"""
OpenAI service for content generation
"""
import logging
import random
import time
from typing import List, Dict, Any, Optional
import asyncio
from openai import OpenAI, AsyncOpenAI
from openai.types.responses import Response

from content_repurposer.core.config import settings

logger = logging.getLogger(__name__)

class OpenAIService:
    """
    Service for interacting with OpenAI API
    """
    def __init__(self):
        """
        Initialize OpenAI client
        """
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.async_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL

    def generate_content(self, content_type: str, original_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate content for a specific platform

        Args:
            content_type: Type of content to generate (twitter, instagram, etc.)
            original_content: Original content to repurpose
            title: Title of the content
            metadata: Additional metadata for content generation

        Returns:
            Generated content
        """
        try:
            # Create system prompt based on content type
            system_prompt = self._create_system_prompt(content_type, metadata)

            # Create user prompt with original content
            user_prompt = f"Title: {title}\n\nContent: {original_content}"

            # Call OpenAI API
            response = self.client.responses.create(
                model=self.model,
                instructions=system_prompt,
                input=user_prompt,
                temperature=0.7,
            )

            return response.output_text
        except Exception as e:
            logger.error(f"Error generating content with OpenAI: {e}")
            raise

    async def generate_content_async(self, content_type: str, original_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate content asynchronously

        Args:
            content_type: Type of content to generate (twitter, instagram, etc.)
            original_content: Original content to repurpose
            title: Title of the content
            metadata: Additional metadata for content generation

        Returns:
            Generated content
        """
        try:
            # Create system prompt based on content type
            system_prompt = self._create_system_prompt(content_type, metadata)

            # Create user prompt with original content
            user_prompt = f"Title: {title}\n\nContent: {original_content}"

            # Call OpenAI API
            response = await self.async_client.responses.create(
                model=self.model,
                instructions=system_prompt,
                input=user_prompt,
                temperature=0.7,
            )

            return response.output_text
        except Exception as e:
            logger.error(f"Error generating content with OpenAI: {e}")
            raise

    def _create_system_prompt(self, content_type: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Create system prompt based on content type

        Args:
            content_type: Type of content to generate
            metadata: Additional metadata for content generation

        Returns:
            System prompt
        """
        tone = metadata.get("tone", "professional") if metadata else "professional"
        hashtags = metadata.get("hashtags", []) if metadata else []

        prompts = {
            "twitter": f"""
# Identity
You are a professional social media content creator specializing in Twitter/X posts.

# Instructions
- Create a Twitter thread (3-5 tweets) based on the provided content.
- Each tweet should be no more than 280 characters.
- Use a {tone} tone.
- Include relevant hashtags at the end of the thread.
- Format the thread with numbers (1/, 2/, etc.) at the beginning of each tweet.
- Make the content engaging and shareable.
- If hashtags were provided, use them: {', '.join(hashtags) if hashtags else 'Use your judgment for hashtags'}.

# Output Format
Provide the thread as plain text with each tweet on a new line, starting with the tweet number.
            """,

            "instagram": f"""
# Identity
You are a professional social media content creator specializing in Instagram captions.

# Instructions
- Create an engaging Instagram caption based on the provided content.
- Use a {tone} tone.
- The caption should be 150-300 characters.
- Include relevant emojis throughout the text.
- Include a call to action at the end.
- Add 5-10 relevant hashtags at the end.
- If hashtags were provided, use them: {', '.join(hashtags) if hashtags else 'Use your judgment for hashtags'}.

# Output Format
Provide the caption as plain text with hashtags at the end.
            """,

            "linkedin": f"""
# Identity
You are a professional content creator specializing in LinkedIn posts.

# Instructions
- Create a professional LinkedIn post based on the provided content.
- Use a {tone} tone.
- The post should be 200-500 characters.
- Focus on professional insights and value.
- Include a call to action at the end.
- Format with appropriate line breaks for readability.
- If hashtags were provided, use them: {', '.join(hashtags) if hashtags else 'Use 3-5 relevant professional hashtags'}.

# Output Format
Provide the post as plain text with hashtags integrated naturally.
            """,

            "facebook": f"""
# Identity
You are a professional social media content creator specializing in Facebook posts.

# Instructions
- Create an engaging Facebook post based on the provided content.
- Use a {tone} tone.
- The post should be 100-300 characters.
- Make it conversational and engaging.
- Include a question or call to action to encourage engagement.
- If hashtags were provided, use them sparingly: {', '.join(hashtags) if hashtags else 'Use 1-3 relevant hashtags if appropriate'}.

# Output Format
Provide the post as plain text.
            """,

            "thumbnail": f"""
# Identity
You are a professional image description creator for AI image generation.

# Instructions
- Create a detailed image description for a thumbnail based on the provided content.
- The description should be vivid and specific.
- Focus on visual elements that represent the content's main theme.
- Include details about style, colors, composition, and mood.
- The description should be 50-100 words.
- Use a {tone} tone.

# Output Format
Provide the image description as plain text.
            """
        }

        return prompts.get(content_type, "Create content based on the provided text.")

    def generate_image(self, prompt: str) -> str:
        """
        Generate an image using DALL-E

        Args:
            prompt: Image generation prompt

        Returns:
            URL of the generated image
        """
        try:
            # Create parameters dict based on the model
            params = {
                "model": "dall-e-3",  # Force DALL-E 3 model
                "prompt": prompt,
                "size": settings.OPENAI_IMAGE_SIZE,
                "n": 1,
            }

            # Implement exponential backoff for rate limit handling
            max_retries = 5
            retry_count = 0
            backoff_time = 1  # Start with 1 second

            while True:
                try:
                    response = self.client.images.generate(**params)
                    break  # If successful, break out of the retry loop
                except Exception as e:
                    if "rate limit" in str(e).lower() and retry_count < max_retries:
                        # Implement exponential backoff
                        retry_count += 1
                        sleep_time = backoff_time * (2 ** (retry_count - 1)) * (0.5 + random.random())
                        logger.warning(f"Rate limit hit, retrying in {sleep_time:.2f} seconds (attempt {retry_count}/{max_retries})")
                        time.sleep(sleep_time)
                    else:
                        # If it's not a rate limit error or we've exceeded max retries, re-raise
                        raise

            return response.data[0].url
        except Exception as e:
            logger.error(f"Error generating image with DALL-E: {e}")
            raise
