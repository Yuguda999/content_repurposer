import base64
import os
from typing import Dict, List, Optional, Any, Union
import httpx

from content_repurposer.core.config import settings
from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)


class StabilityAIClient:
    """
    Client for interacting with Stability AI API
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Stability AI client
        
        Args:
            api_key: Stability AI API key
        """
        self.api_key = api_key or os.getenv("STABILITY_API_KEY")
        self.api_host = os.getenv("STABILITY_API_HOST", "https://api.stability.ai")
        self.engine_id = os.getenv("STABILITY_ENGINE_ID", "stable-diffusion-xl-1024-v1-0")
    
    async def generate_image(
        self,
        prompt: str,
        height: int = 1024,
        width: int = 1024,
        cfg_scale: float = 7.0,
        steps: int = 30,
        samples: int = 1,
    ) -> List[str]:
        """
        Generate images using Stability AI API
        
        Args:
            prompt: Image description
            height: Image height
            width: Image width
            cfg_scale: How strictly the diffusion process adheres to the prompt
            steps: Number of diffusion steps to run
            samples: Number of images to generate
            
        Returns:
            List of base64 encoded images
        """
        if not self.api_key:
            raise ValueError("Stability AI API key is required")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_host}/v1/generation/{self.engine_id}/text-to-image",
                    headers={
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "text_prompts": [
                            {
                                "text": prompt,
                                "weight": 1.0
                            }
                        ],
                        "height": height,
                        "width": width,
                        "cfg_scale": cfg_scale,
                        "steps": steps,
                        "samples": samples,
                    },
                    timeout=60.0,
                )
                
                if response.status_code != 200:
                    logger.error(
                        "Error generating image with Stability AI", 
                        status_code=response.status_code,
                        response=response.text
                    )
                    raise Exception(f"Stability AI API error: {response.text}")
                
                data = response.json()
                return [artifact["base64"] for artifact in data["artifacts"]]
        except Exception as e:
            logger.error("Error generating image with Stability AI", error=str(e))
            raise
