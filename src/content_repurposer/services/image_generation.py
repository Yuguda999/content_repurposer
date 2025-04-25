import os
import uuid
from typing import Dict, List, Optional, Any, Union
import httpx

from openai import AsyncOpenAI
from content_repurposer.clients.openai_client import OpenAIClient
from content_repurposer.clients.stabilityai_client import StabilityAIClient
from content_repurposer.core.config import settings
from content_repurposer.core.logging import get_logger
from content_repurposer.services.storage_service import get_storage_service, StorageService
from content_repurposer.schemas.content_models import ContentType

logger = get_logger(__name__)


class ImageGenerationService:
    """Service for generating images and thumbnails"""

    def __init__(
        self,
        openai_client: Optional[OpenAIClient] = None,
        stability_client: Optional[StabilityAIClient] = None,
        storage_service: Optional[StorageService] = None,
        use_stability: bool = False,
    ):
        """
        Initialize image generation service

        Args:
            openai_client: OpenAI client instance
            stability_client: Stability AI client instance
            storage_service: Storage service instance
            use_stability: Whether to use Stability AI instead of DALL-E
        """
        self.openai_client = openai_client or OpenAIClient()
        self.stability_client = stability_client or StabilityAIClient()
        self.storage_service = storage_service or get_storage_service()
        self.use_stability = use_stability
        # Initialize AsyncOpenAI client
        self.async_openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_image_with_dalle(self, prompt: str) -> Optional[str]:
        """
        Generates an image using the OpenAI DALL-E API.
        
        Args:
            prompt: The prompt to generate an image from
            
        Returns:
            The URL of the generated image, or None if generation failed
        """
        try:
            # Generate the image
            response = self.async_openai_client.images.generate(
                model="dall-e-3", 
                prompt=prompt, 
                size="1024x1024", 
                quality="standard", 
                n=1
            )
            images_response = await response
            # Extract the URL from the first image in the data list
            if images_response.data and len(images_response.data) > 0:
                image_url = images_response.data[0].url
                return image_url
            else:
                return None
        except Exception as e:
            logger.error(f"Error generating image with DALL-E: {str(e)}")
            raise

    async def generate_thumbnail(
        self,
        blog_content: str,
        title: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate a thumbnail image for a blog post

        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata

        Returns:
            URL or path to the generated image
        """
        try:
            # Generate a prompt for the image
            system_prompt = """
            You are an expert at creating prompts for AI image generation.
            Create a detailed, vivid prompt that will result in a high-quality, engaging thumbnail image
            for a blog post. The prompt should be descriptive and specific, focusing on the main theme
            of the blog post. Do not include any text in the image prompt, as text will be added separately.
            """

            prompt = f"""
            Blog Title: {title}

            Blog Content:
            {blog_content}

            Please create a detailed, vivid prompt for generating a thumbnail image for this blog post.
            The prompt should be descriptive and specific, focusing on the main theme of the blog post.
            Do not include any text in the image prompt, as text will be added separately.
            """

            if metadata and metadata.get("style"):
                prompt += f"\n\nThe image should be in a {metadata['style']} style."

            # Generate the image prompt
            image_prompt = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300,
            )
            
            # Log the generated prompt
            logger.info(f"Generated image prompt: {image_prompt}")

            # Generate the image using OpenAI's DALL-E
            logger.info(f"Generating image with prompt: {image_prompt}")
            
            try:
                # Generate the image using DALL-E
                image_url = await self.generate_image_with_dalle(image_prompt)
                
                if not image_url:
                    raise ValueError("No image URL returned from OpenAI")
                
                logger.info(f"Image generated successfully: {image_url}")
                
                # Download the image
                async with httpx.AsyncClient() as client:
                    img_response = await client.get(image_url)
                    if img_response.status_code != 200:
                        raise ValueError(f"Failed to download image: {img_response.status_code}")
                    
                    # Save the image
                    file_name = f"thumbnails/{uuid.uuid4()}.png"
                    saved_url = await self.storage_service.save_file(
                        file_content=img_response.content,
                        file_path=file_name,
                    )
                
                # Create image metadata
                image_metadata = {
                    "prompt": image_prompt,
                    "generated": "dall-e",
                    "description": f"AI-generated thumbnail for '{title}'"
                }
                
                return saved_url
                
            except Exception as e:
                logger.error(f"Error generating image with DALL-E: {str(e)}")
                raise
            
        except Exception as e:
            logger.error("Error generating thumbnail", error=str(e))
            raise

    async def generate_image_from_prompt(
        self,
        prompt: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate an image from a prompt

        Args:
            prompt: Image generation prompt
            metadata: Additional metadata

        Returns:
            URL or path to the generated image
        """
        try:
            # Log the prompt
            logger.info(f"Image generation prompt: {prompt}")

            # Generate the image using OpenAI's DALL-E
            logger.info(f"Generating image with prompt: {prompt}")
            
            try:
                # Generate the image using DALL-E
                image_url = await self.generate_image_with_dalle(prompt)
                
                if not image_url:
                    raise ValueError("No image URL returned from OpenAI")
                
                logger.info(f"Image generated successfully: {image_url}")
                
                # Download the image
                async with httpx.AsyncClient() as client:
                    img_response = await client.get(image_url)
                    if img_response.status_code != 200:
                        raise ValueError(f"Failed to download image: {img_response.status_code}")
                    
                    # Save the image
                    file_name = f"thumbnails/{uuid.uuid4()}.png"
                    saved_url = await self.storage_service.save_file(
                        file_content=img_response.content,
                        file_path=file_name,
                    )
                
                # Create image metadata
                image_metadata = {
                    "prompt": prompt,
                    "generated": "dall-e",
                    "description": "AI-generated image from prompt"
                }
                
                return saved_url
                
            except Exception as e:
                logger.error(f"Error generating image with DALL-E: {str(e)}")
                raise
            
        except Exception as e:
            logger.error("Error generating image from prompt", error=str(e))
            raise

    async def generate_social_media_image(
        self,
        content_type: ContentType,
        blog_content: str,
        title: str,
        text_content: str = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate an image for a social media post
        
        Args:
            content_type: Type of social media platform
            blog_content: Original blog content
            title: Blog title
            text_content: Generated text content for the platform
            metadata: Additional metadata
            
        Returns:
            URL or path to the generated image
        """
        try:
            # Generate a platform-specific prompt for the image
            system_prompt = f"""
            You are an expert at creating prompts for AI image generation.
            Create a detailed, vivid prompt that will result in a high-quality, engaging image
            for a {content_type.value} post. The prompt should be descriptive and specific, 
            focusing on the main theme of the content. The image should be optimized for 
            {content_type.value} platform's audience and format.
            """
            
            prompt = f"""
            Platform: {content_type.value}
            Blog Title: {title}
            
            Blog Content:
            {blog_content}
            
            Generated {content_type.value} content:
            {text_content if text_content else "Not available"}
            
            Please create a detailed, vivid prompt for generating an image for this {content_type.value} post.
            The prompt should be descriptive and specific, focusing on the main theme of the post.
            The image should be optimized for {content_type.value} platform's audience and format.
            """
            
            if metadata:
                if metadata.get("style"):
                    prompt += f"\n\nThe image should be in a {metadata['style']} style."
                if metadata.get("tone"):
                    prompt += f"\n\nThe image should match a {metadata['tone']} tone."
                if metadata.get("hashtags"):
                    hashtags = ", ".join(metadata["hashtags"])
                    prompt += f"\n\nThe image should be relevant to these hashtags: {hashtags}."
            
            # Generate the image prompt
            image_prompt = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300,
            )
            
            # Log the generated prompt
            logger.info(f"Generated {content_type.value} image prompt: {image_prompt}")

            # Generate the image using OpenAI's DALL-E
            logger.info(f"Generating {content_type.value} image with prompt: {image_prompt}")
            
            try:
                # Generate the image using DALL-E
                image_url = await self.generate_image_with_dalle(image_prompt)
                
                if not image_url:
                    raise ValueError("No image URL returned from OpenAI")
                
                logger.info(f"{content_type.value} image generated successfully: {image_url}")
                
                # Download the image
                async with httpx.AsyncClient() as client:
                    img_response = await client.get(image_url)
                    if img_response.status_code != 200:
                        raise ValueError(f"Failed to download image: {img_response.status_code}")
                    
                    # Save the image in a platform-specific directory
                    directory = f"{content_type.value.lower()}_images"
                    
                    # Ensure the directory exists
                    os.makedirs(f"storage/{directory}", exist_ok=True)
                    
                    file_name = f"{directory}/{uuid.uuid4()}.png"
                    saved_url = await self.storage_service.save_file(
                        file_content=img_response.content,
                        file_path=file_name,
                    )
                
                # Create image metadata
                image_metadata = {
                    "prompt": image_prompt,
                    "generated": "dall-e",
                    "platform": content_type.value,
                    "description": f"AI-generated image for {content_type.value} post"
                }
                
                return saved_url
                
            except Exception as e:
                logger.error(f"Error generating {content_type.value} image with DALL-E: {str(e)}")
                raise
            
        except Exception as e:
            logger.error(f"Error generating {content_type.value} image", error=str(e))
            raise
