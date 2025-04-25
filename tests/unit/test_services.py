import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from content_repurposer.clients.openai_client import OpenAIClient
from content_repurposer.services.text_generation import TextGenerationService
from content_repurposer.schemas.content_models import ContentType


@pytest.fixture
def mock_openai_client():
    """
    Mock OpenAI client fixture
    """
    client = AsyncMock(spec=OpenAIClient)
    client.generate_text = AsyncMock(return_value="Generated text")
    return client


@pytest.mark.asyncio
async def test_generate_twitter_thread(mock_openai_client):
    """
    Test Twitter thread generation
    """
    service = TextGenerationService(openai_client=mock_openai_client)
    result = await service.generate_twitter_thread(
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    
    assert result == "Generated text"
    mock_openai_client.generate_text.assert_called_once()
    args, kwargs = mock_openai_client.generate_text.call_args
    assert "Test Blog" in kwargs["prompt"]
    assert "This is a test blog post." in kwargs["prompt"]


@pytest.mark.asyncio
async def test_generate_instagram_caption(mock_openai_client):
    """
    Test Instagram caption generation
    """
    service = TextGenerationService(openai_client=mock_openai_client)
    result = await service.generate_instagram_caption(
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    
    assert result == "Generated text"
    mock_openai_client.generate_text.assert_called_once()
    args, kwargs = mock_openai_client.generate_text.call_args
    assert "Test Blog" in kwargs["prompt"]
    assert "This is a test blog post." in kwargs["prompt"]


@pytest.mark.asyncio
async def test_generate_content(mock_openai_client):
    """
    Test content generation by type
    """
    service = TextGenerationService(openai_client=mock_openai_client)
    
    # Test Twitter
    await service.generate_content(
        content_type=ContentType.TWITTER,
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    assert mock_openai_client.generate_text.call_count == 1
    
    # Test Instagram
    await service.generate_content(
        content_type=ContentType.INSTAGRAM,
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    assert mock_openai_client.generate_text.call_count == 2
    
    # Test LinkedIn
    await service.generate_content(
        content_type=ContentType.LINKEDIN,
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    assert mock_openai_client.generate_text.call_count == 3
    
    # Test Facebook
    await service.generate_content(
        content_type=ContentType.FACEBOOK,
        blog_content="This is a test blog post.",
        title="Test Blog",
    )
    assert mock_openai_client.generate_text.call_count == 4
    
    # Test invalid type
    with pytest.raises(ValueError):
        await service.generate_content(
            content_type=ContentType.THUMBNAIL,
            blog_content="This is a test blog post.",
            title="Test Blog",
        )
