import base64
import json
import random
import time
from typing import Dict, List, Optional, Any, Union
import os

from openai import OpenAI

from content_repurposer.core.config import settings
from content_repurposer.core.logging import get_logger

logger = get_logger(__name__)


class OpenAIClient:
    """
    Client for interacting with OpenAI API
    """

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI client

        Args:
            api_key: OpenAI API key (defaults to settings.OPENAI_API_KEY)
        """
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.client = OpenAI(api_key=self.api_key)
        self.model = settings.OPENAI_MODEL
        self.image_model = settings.OPENAI_IMAGE_MODEL

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1000,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate text using OpenAI API

        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            model: Model to use (defaults to settings.OPENAI_MODEL)
            max_tokens: Maximum tokens to generate
            temperature: Temperature for generation

        Returns:
            Generated text
        """
        try:
            messages = []

            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            messages.append({"role": "user", "content": prompt})

            # Create parameters dict
            params = {
                "model": model or self.model,
                "input": messages,
                "temperature": temperature,
            }

            # The max_tokens parameter is not supported in the responses.create() method
            # Instead, we need to estimate the response size and handle rate limits with retries

            # Implement exponential backoff for rate limit handling
            max_retries = 5
            retry_count = 0
            backoff_time = 1  # Start with 1 second

            while True:
                try:
                    response = self.client.responses.create(**params)
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

            return response.output_text
        except Exception as e:
            logger.error("Error generating text", error=str(e))
            raise

    async def generate_image(
        self,
        prompt: str,
        model: Optional[str] = None,
        size: Optional[str] = None,
        quality: Optional[str] = None,
        n: int = 1,
    ) -> List[str]:
        """
        Generate images using OpenAI DALL-E API

        Args:
            prompt: Image description
            model: Model to use (defaults to settings.OPENAI_IMAGE_MODEL)
            size: Image size (defaults to settings.OPENAI_IMAGE_SIZE)
            quality: Image quality (defaults to settings.OPENAI_IMAGE_QUALITY)
            n: Number of images to generate

        Returns:
            List of image URLs
        """
        try:
            # Create parameters dict based on the model
            params = {
                "model": "dall-e-3",  # Force DALL-E 3 model
                "prompt": prompt,
                "size": size or settings.OPENAI_IMAGE_SIZE,
                "n": n,
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

            return [image.url for image in response.data]
        except Exception as e:
            logger.error("Error generating image", error=str(e))
            raise

    async def function_calling(
        self,
        prompt: str,
        functions: List[Dict[str, Any]],
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
    ) -> Dict[str, Any]:
        """
        Use function calling with OpenAI API

        Args:
            prompt: User prompt
            functions: List of function definitions
            system_prompt: System prompt (optional)
            model: Model to use (defaults to settings.OPENAI_MODEL)
            temperature: Temperature for generation

        Returns:
            Function call result
        """
        try:
            messages = []

            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            messages.append({"role": "user", "content": prompt})

            # Create parameters dict
            params = {
                "model": model or self.model,
                "input": messages,
                "tools": functions,
                "temperature": temperature,
            }

            # Implement exponential backoff for rate limit handling
            max_retries = 5
            retry_count = 0
            backoff_time = 1  # Start with 1 second

            while True:
                try:
                    response = self.client.responses.create(**params)
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

            # Check if the model called a function
            if response.output and len(response.output) > 0:
                for output in response.output:
                    if output.type == "function_call":
                        return {
                            "name": output.name,
                            "arguments": json.loads(output.arguments)
                        }

            # If no function was called, return the text response
            return {"text": response.output_text}
        except Exception as e:
            logger.error("Error with function calling", error=str(e))
            raise

    async def encode_image(self, image_path: str) -> str:
        """
        Encode image to base64

        Args:
            image_path: Path to image file

        Returns:
            Base64 encoded image
        """
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")
