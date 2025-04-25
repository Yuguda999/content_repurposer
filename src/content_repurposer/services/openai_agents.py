import asyncio
import json
from typing import Dict, List, Optional, Any, Union, Callable
import os

from content_repurposer.core.config import settings
from content_repurposer.core.logging import get_logger
from content_repurposer.schemas.content_models import ContentType
from content_repurposer.clients.openai_client import OpenAIClient

logger = get_logger(__name__)

try:
    from agents import Agent, Runner, function_tool
    AGENTS_SDK_AVAILABLE = True
except ImportError:
    AGENTS_SDK_AVAILABLE = False
    logger.warning("OpenAI Agents SDK not available. Install with 'pip install openai-agents'")


class OpenAIAgentsOrchestrator:
    """
    Orchestrator for OpenAI Agents
    
    This class provides an interface for using OpenAI Agents to repurpose content.
    If the OpenAI Agents SDK is not available, it falls back to using the OpenAI client directly.
    """
    
    def __init__(self, openai_client: Optional[OpenAIClient] = None):
        """
        Initialize OpenAI Agents orchestrator
        
        Args:
            openai_client: OpenAI client instance (used as fallback if Agents SDK not available)
        """
        self.openai_client = openai_client or OpenAIClient()
        self.agents_available = AGENTS_SDK_AVAILABLE
    
    async def repurpose_content(
        self,
        content_type: ContentType,
        blog_content: str,
        title: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Repurpose content using OpenAI Agents
        
        Args:
            content_type: Type of content to generate
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Generated content
        """
        if not self.agents_available:
            logger.info("Using fallback method with OpenAI client")
            return await self._fallback_repurpose_content(content_type, blog_content, title, metadata)
        
        try:
            # Create agent based on content type
            agent = self._create_agent_for_content_type(content_type, metadata)
            
            # Prepare input
            input_text = f"""
            Blog Title: {title}
            
            Blog Content:
            {blog_content}
            
            Please repurpose this blog content into a {content_type.value} post.
            """
            
            if metadata:
                if metadata.get("tone"):
                    input_text += f"\nUse a {metadata['tone']} tone."
                
                if metadata.get("hashtags"):
                    input_text += f"\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
            
            # Run agent
            result = await Runner.run(agent, input_text)
            
            return result.final_output
        except Exception as e:
            logger.error(
                "Error using OpenAI Agents",
                error=str(e),
                content_type=content_type.value,
            )
            # Fall back to direct OpenAI client
            return await self._fallback_repurpose_content(content_type, blog_content, title, metadata)
    
    def _create_agent_for_content_type(
        self,
        content_type: ContentType,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Any:
        """
        Create an OpenAI Agent for the specified content type
        
        Args:
            content_type: Type of content to generate
            metadata: Additional metadata
            
        Returns:
            OpenAI Agent instance
        """
        if not self.agents_available:
            raise ImportError("OpenAI Agents SDK not available")
        
        # Define tools
        @function_tool
        def get_hashtags(topic: str, count: int = 5) -> str:
            """
            Generate relevant hashtags for a topic
            
            Args:
                topic: The topic to generate hashtags for
                count: Number of hashtags to generate
                
            Returns:
                String of hashtags
            """
            # In a real implementation, this would use a more sophisticated approach
            # For now, we'll return some generic hashtags based on the topic
            generic_hashtags = [
                "content", "marketing", "socialmedia", "digital", "blog",
                "business", "strategy", "growth", "tips", "advice",
                "learning", "development", "success", "inspiration", "motivation"
            ]
            
            # Add topic as a hashtag
            hashtags = [f"#{topic.lower().replace(' ', '')}"]
            
            # Add generic hashtags
            for _ in range(min(count - 1, len(generic_hashtags))):
                hashtag = generic_hashtags.pop(0)
                hashtags.append(f"#{hashtag}")
            
            return " ".join(hashtags)
        
        # Create agent based on content type
        if content_type == ContentType.TWITTER:
            return Agent(
                name="Twitter Thread Creator",
                instructions="""
                You are an expert at repurposing blog content into engaging Twitter threads.
                Create a thread that captures the key points of the blog while maintaining the original voice and style.
                Format the thread with each tweet numbered and separated by a line break.
                Keep each tweet under 280 characters.
                Include relevant hashtags at the end of the thread.
                """,
                model=settings.OPENAI_MODEL,
                tools=[get_hashtags],
            )
        elif content_type == ContentType.INSTAGRAM:
            return Agent(
                name="Instagram Caption Creator",
                instructions="""
                You are an expert at repurposing blog content into engaging Instagram captions.
                Create a caption that captures the essence of the blog while being visually appealing and engaging.
                Include line breaks for readability and relevant hashtags at the end.
                The caption should be between 150-300 words.
                """,
                model=settings.OPENAI_MODEL,
                tools=[get_hashtags],
            )
        elif content_type == ContentType.LINKEDIN:
            return Agent(
                name="LinkedIn Post Creator",
                instructions="""
                You are an expert at repurposing blog content into professional LinkedIn posts.
                Create a post that presents the key insights from the blog in a professional, thoughtful manner.
                Format the post with clear paragraphs, bullet points where appropriate, and a call to action.
                The post should be between 200-500 words.
                """,
                model=settings.OPENAI_MODEL,
                tools=[get_hashtags],
            )
        elif content_type == ContentType.FACEBOOK:
            return Agent(
                name="Facebook Post Creator",
                instructions="""
                You are an expert at repurposing blog content into engaging Facebook posts.
                Create a post that captures the key points of the blog while encouraging engagement.
                Format the post with clear paragraphs and include a question or call to action to encourage comments.
                The post should be between 150-400 words.
                """,
                model=settings.OPENAI_MODEL,
                tools=[get_hashtags],
            )
        else:
            raise ValueError(f"Unsupported content type for agent: {content_type}")
    
    async def _fallback_repurpose_content(
        self,
        content_type: ContentType,
        blog_content: str,
        title: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Fallback method to repurpose content using OpenAI client directly
        
        Args:
            content_type: Type of content to generate
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Generated content
        """
        # Define system prompts for each content type
        system_prompts = {
            ContentType.TWITTER: """
                You are an expert at repurposing blog content into engaging Twitter threads.
                Create a thread that captures the key points of the blog while maintaining the original voice and style.
                Format the thread with each tweet numbered and separated by a line break.
                Keep each tweet under 280 characters.
                Include relevant hashtags at the end of the thread.
            """,
            ContentType.INSTAGRAM: """
                You are an expert at repurposing blog content into engaging Instagram captions.
                Create a caption that captures the essence of the blog while being visually appealing and engaging.
                Include line breaks for readability and relevant hashtags at the end.
                The caption should be between 150-300 words.
            """,
            ContentType.LINKEDIN: """
                You are an expert at repurposing blog content into professional LinkedIn posts.
                Create a post that presents the key insights from the blog in a professional, thoughtful manner.
                Format the post with clear paragraphs, bullet points where appropriate, and a call to action.
                The post should be between 200-500 words.
            """,
            ContentType.FACEBOOK: """
                You are an expert at repurposing blog content into engaging Facebook posts.
                Create a post that captures the key points of the blog while encouraging engagement.
                Format the post with clear paragraphs and include a question or call to action to encourage comments.
                The post should be between 150-400 words.
            """,
        }
        
        if content_type not in system_prompts:
            raise ValueError(f"Unsupported content type: {content_type}")
        
        # Prepare prompt
        prompt = f"""
        Blog Title: {title}
        
        Blog Content:
        {blog_content}
        
        Please repurpose this blog content into a {content_type.value} post.
        """
        
        if metadata:
            if metadata.get("tone"):
                prompt += f"\nUse a {metadata['tone']} tone."
            
            if metadata.get("hashtags"):
                prompt += f"\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
        
        # Generate content
        return await self.openai_client.generate_text(
            prompt=prompt,
            system_prompt=system_prompts[content_type],
            temperature=0.7,
        )
    
    async def generate_thumbnail_prompt(
        self,
        blog_content: str,
        title: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Generate a prompt for thumbnail image generation
        
        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Image generation prompt
        """
        if not self.agents_available:
            # Fallback to direct OpenAI client
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
            
            return await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=300,
            )
        
        try:
            # Create agent for thumbnail prompt generation
            thumbnail_agent = Agent(
                name="Thumbnail Prompt Creator",
                instructions="""
                You are an expert at creating prompts for AI image generation.
                Create a detailed, vivid prompt that will result in a high-quality, engaging thumbnail image
                for a blog post. The prompt should be descriptive and specific, focusing on the main theme
                of the blog post. Do not include any text in the image prompt, as text will be added separately.
                """,
                model=settings.OPENAI_MODEL,
            )
            
            # Prepare input
            input_text = f"""
            Blog Title: {title}
            
            Blog Content:
            {blog_content}
            
            Please create a detailed, vivid prompt for generating a thumbnail image for this blog post.
            """
            
            if metadata and metadata.get("style"):
                input_text += f"\n\nThe image should be in a {metadata['style']} style."
            
            # Run agent
            result = await Runner.run(thumbnail_agent, input_text)
            
            return result.final_output
        except Exception as e:
            logger.error("Error generating thumbnail prompt with OpenAI Agents", error=str(e))
            # Fall back to direct OpenAI client
            return await self.generate_thumbnail_prompt(blog_content, title, metadata)
