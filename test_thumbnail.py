import sys
import os
import asyncio

# Add src to path
sys.path.insert(0, os.path.abspath("src"))

from content_repurposer.services.image_generation import ImageGenerationService
from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)

async def test_thumbnail_generation():
    """Test thumbnail generation"""
    try:
        # Create image generation service
        image_service = ImageGenerationService()
        
        # Generate thumbnail
        blog_content = "Artificial intelligence is revolutionizing healthcare by improving diagnostics, treatment planning, and patient care. Machine learning algorithms can analyze medical images with remarkable accuracy, often outperforming human specialists in detecting certain conditions."
        title = "AI in Healthcare"
        metadata = {"tone": "professional", "hashtags": ["AI", "Healthcare", "Technology"]}
        
        # Generate thumbnail
        image_url = await image_service.generate_thumbnail(
            blog_content=blog_content,
            title=title,
            metadata=metadata,
        )
        
        print(f"Generated thumbnail: {image_url}")
        
        # Generate image from prompt
        prompt = "A futuristic medical facility with AI-powered diagnostic equipment, rendered in a clean, professional style with blue and white color scheme."
        
        image_url = await image_service.generate_image_from_prompt(
            prompt=prompt,
            metadata=metadata,
        )
        
        print(f"Generated image from prompt: {image_url}")
        
    except Exception as e:
        logger.error(f"Error testing thumbnail generation: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(test_thumbnail_generation())
