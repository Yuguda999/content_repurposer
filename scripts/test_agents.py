#!/usr/bin/env python
"""
Test script for OpenAI agents implementation
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

# Load environment variables
load_dotenv()

from content_repurposer.services.openai_agents import OpenAIAgentsOrchestrator
from content_repurposer.schemas.content_models import ContentType


async def main():
    """
    Test OpenAI agents implementation
    """
    # Sample blog content
    title = "The Future of AI in Content Creation"
    blog_content = """
    Artificial intelligence is revolutionizing content creation across industries. 
    From automated blog writing to image generation, AI tools are helping creators 
    produce more content with less effort.
    
    However, there are challenges to consider. The quality of AI-generated content 
    varies widely, and there are concerns about originality and plagiarism. 
    Additionally, AI tools may not always capture the unique voice or perspective 
    that makes content engaging.
    
    Despite these challenges, the future looks promising. As AI models continue to 
    improve, we can expect more sophisticated tools that work alongside human 
    creators, enhancing their capabilities rather than replacing them.
    
    In conclusion, AI is transforming content creation, but the most effective 
    approach will likely be a hybrid one, combining the efficiency of AI with the 
    creativity and judgment of human creators.
    """
    
    # Create orchestrator
    orchestrator = OpenAIAgentsOrchestrator()
    
    # Test Twitter thread generation
    print("Generating Twitter thread...")
    twitter_content = await orchestrator.repurpose_content(
        content_type=ContentType.TWITTER,
        blog_content=blog_content,
        title=title,
        metadata={"tone": "informative", "hashtags": ["AI", "ContentCreation"]},
    )
    print("\nTwitter Thread:")
    print(twitter_content)
    
    # Test thumbnail prompt generation
    print("\nGenerating thumbnail prompt...")
    thumbnail_prompt = await orchestrator.generate_thumbnail_prompt(
        blog_content=blog_content,
        title=title,
        metadata={"style": "digital art"},
    )
    print("\nThumbnail Prompt:")
    print(thumbnail_prompt)


if __name__ == "__main__":
    asyncio.run(main())
