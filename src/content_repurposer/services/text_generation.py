from typing import Dict, List, Optional, Any

from content_repurposer.clients.openai_client import OpenAIClient
from content_repurposer.core.logging import get_logger
from content_repurposer.schemas.content_models import ContentType

logger = get_logger(__name__)


class TextGenerationService:
    """Service for generating text content for different platforms"""
    
    def __init__(self, openai_client: Optional[OpenAIClient] = None):
        """
        Initialize text generation service
        
        Args:
            openai_client: OpenAI client instance
        """
        self.openai_client = openai_client or OpenAIClient()
    
    async def generate_twitter_thread(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a Twitter thread from blog content
        
        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Twitter thread text
        """
        system_prompt = """
        You are an expert at repurposing blog content into engaging Twitter threads.
        Create a thread that captures the key points of the blog while maintaining the original voice and style.
        Format the thread with each tweet numbered and separated by a line break.
        Keep each tweet under 280 characters.
        Include relevant hashtags at the end of the thread.
        """
        
        prompt = f"""
        Blog Title: {title}
        
        Blog Content:
        {blog_content}
        
        Please convert this blog post into an engaging Twitter thread that captures the key points
        while maintaining the original voice and style. Format as a numbered thread with each tweet
        under 280 characters.
        """
        
        if metadata and metadata.get("tone"):
            prompt += f"\n\nUse a {metadata['tone']} tone for the thread."
        
        if metadata and metadata.get("hashtags"):
            prompt += f"\n\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
        
        try:
            result = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
            )
            
            return result
        except Exception as e:
            logger.error("Error generating Twitter thread", error=str(e))
            raise
    
    async def generate_instagram_caption(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate an Instagram caption from blog content
        
        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Instagram caption text
        """
        system_prompt = """
        You are an expert at repurposing blog content into engaging Instagram captions.
        Create a caption that captures the essence of the blog while being visually appealing and engaging.
        Include line breaks for readability and relevant hashtags at the end.
        The caption should be between 150-300 words.
        """
        
        prompt = f"""
        Blog Title: {title}
        
        Blog Content:
        {blog_content}
        
        Please convert this blog post into an engaging Instagram caption that captures the essence
        of the content. Include line breaks for readability and relevant hashtags at the end.
        The caption should be between 150-300 words.
        """
        
        if metadata and metadata.get("tone"):
            prompt += f"\n\nUse a {metadata['tone']} tone for the caption."
        
        if metadata and metadata.get("hashtags"):
            prompt += f"\n\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
        
        try:
            result = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
            )
            
            return result
        except Exception as e:
            logger.error("Error generating Instagram caption", error=str(e))
            raise
    
    async def generate_linkedin_post(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a LinkedIn post from blog content
        
        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            LinkedIn post text
        """
        system_prompt = """
        You are an expert at repurposing blog content into professional LinkedIn posts.
        Create a post that presents the key insights from the blog in a professional, thoughtful manner.
        Format the post with clear paragraphs, bullet points where appropriate, and a call to action.
        The post should be between 200-500 words.
        """
        
        prompt = f"""
        Blog Title: {title}
        
        Blog Content:
        {blog_content}
        
        Please convert this blog post into a professional LinkedIn post that presents the key insights
        in a thoughtful manner. Format with clear paragraphs, bullet points where appropriate, and include
        a call to action. The post should be between 200-500 words.
        """
        
        if metadata and metadata.get("tone"):
            prompt += f"\n\nUse a {metadata['tone']} tone for the post."
        
        if metadata and metadata.get("hashtags"):
            prompt += f"\n\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
        
        try:
            result = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
            )
            
            return result
        except Exception as e:
            logger.error("Error generating LinkedIn post", error=str(e))
            raise
    
    async def generate_facebook_post(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate a Facebook post from blog content
        
        Args:
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Facebook post text
        """
        system_prompt = """
        You are an expert at repurposing blog content into engaging Facebook posts.
        Create a post that captures the key points of the blog while encouraging engagement.
        Format the post with clear paragraphs and include a question or call to action to encourage comments.
        The post should be between 150-400 words.
        """
        
        prompt = f"""
        Blog Title: {title}
        
        Blog Content:
        {blog_content}
        
        Please convert this blog post into an engaging Facebook post that captures the key points
        while encouraging engagement. Format with clear paragraphs and include a question or call to action
        to encourage comments. The post should be between 150-400 words.
        """
        
        if metadata and metadata.get("tone"):
            prompt += f"\n\nUse a {metadata['tone']} tone for the post."
        
        if metadata and metadata.get("hashtags"):
            prompt += f"\n\nInclude these hashtags: {', '.join(metadata['hashtags'])}"
        
        try:
            result = await self.openai_client.generate_text(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.7,
            )
            
            return result
        except Exception as e:
            logger.error("Error generating Facebook post", error=str(e))
            raise
    
    async def generate_content(
        self, 
        content_type: ContentType, 
        blog_content: str, 
        title: str, 
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate content based on the specified type
        
        Args:
            content_type: Type of content to generate
            blog_content: Original blog content
            title: Blog title
            metadata: Additional metadata
            
        Returns:
            Generated content
        """
        if content_type == ContentType.TWITTER:
            return await self.generate_twitter_thread(blog_content, title, metadata)
        elif content_type == ContentType.INSTAGRAM:
            return await self.generate_instagram_caption(blog_content, title, metadata)
        elif content_type == ContentType.LINKEDIN:
            return await self.generate_linkedin_post(blog_content, title, metadata)
        elif content_type == ContentType.FACEBOOK:
            return await self.generate_facebook_post(blog_content, title, metadata)
        else:
            raise ValueError(f"Unsupported content type: {content_type}")
