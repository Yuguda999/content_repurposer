from typing import Dict, List, Optional, Any, Union
import asyncio
import uuid

from content_repurposer.core.logging import get_logger
from content_repurposer.schemas.content_models import ContentType, JobStatus
from content_repurposer.services.text_generation import TextGenerationService
from content_repurposer.services.image_generation import ImageGenerationService
from content_repurposer.services.storage_service import get_storage_service
from content_repurposer.services.openai_agents import OpenAIAgentsOrchestrator
from content_repurposer.db.models import Job, ContentOutput
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class ContentOrchestrator:
    """Orchestrates the content repurposing process"""

    def __init__(
        self,
        text_service: Optional[TextGenerationService] = None,
        image_service: Optional[ImageGenerationService] = None,
        agents_orchestrator: Optional[OpenAIAgentsOrchestrator] = None,
        use_agents: bool = True,
    ):
        """
        Initialize content orchestrator

        Args:
            text_service: Text generation service
            image_service: Image generation service
            agents_orchestrator: OpenAI Agents orchestrator
            use_agents: Whether to use OpenAI Agents (if available)
        """
        self.text_service = text_service or TextGenerationService()
        self.image_service = image_service or ImageGenerationService()
        self.agents_orchestrator = agents_orchestrator or OpenAIAgentsOrchestrator()
        self.storage_service = get_storage_service()
        self.use_agents = use_agents

    async def process_job(self, job: Job, db: Session) -> Job:
        """
        Process a content repurposing job

        Args:
            job: Job to process
            db: Database session

        Returns:
            Updated job
        """
        try:
            # Update job status to processing
            job.status = JobStatus.PROCESSING
            db.commit()
            db.refresh(job)

            # Determine content types to generate
            content_types = []
            if job.job_metadata and "content_types" in job.job_metadata:
                content_types = [ContentType(ct) for ct in job.job_metadata["content_types"]]
            else:
                # Default to all content types
                content_types = [
                    ContentType.TWITTER,
                    ContentType.INSTAGRAM,
                    ContentType.LINKEDIN,
                    ContentType.FACEBOOK,
                    ContentType.THUMBNAIL,
                ]

            # Process each content type
            tasks = []
            for content_type in content_types:
                if content_type == ContentType.THUMBNAIL:
                    tasks.append(self._generate_thumbnail(job, db))
                else:
                    # Generate text content first
                    text_task = self._generate_text_content(content_type, job, db)
                    tasks.append(text_task)

                    # Generate image for the social media post
                    image_task = self._generate_social_media_image(content_type, job, db)
                    tasks.append(image_task)

            # Wait for all tasks to complete
            await asyncio.gather(*tasks)

            # Update job status to completed
            job.status = JobStatus.COMPLETED
            db.commit()
            db.refresh(job)

            return job
        except Exception as e:
            logger.error("Error processing job", error=str(e), job_id=str(job.id))

            # Update job status to failed
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
            db.refresh(job)

            raise

    async def _generate_text_content(self, content_type: ContentType, job: Job, db: Session) -> None:
        """
        Generate text content for a specific platform

        Args:
            content_type: Type of content to generate
            job: Job to process
            db: Database session
        """
        try:
            # Generate content using OpenAI Agents if enabled, otherwise use text service
            if self.use_agents:
                try:
                    content = await self.agents_orchestrator.repurpose_content(
                        content_type=content_type,
                        blog_content=job.original_content,
                        title=job.title,
                        metadata=job.job_metadata,
                    )
                    logger.info(
                        "Generated content using OpenAI Agents",
                        job_id=str(job.id),
                        content_type=content_type.value,
                    )
                except Exception as agent_error:
                    logger.warning(
                        "Failed to generate content with OpenAI Agents, falling back to text service",
                        error=str(agent_error),
                        job_id=str(job.id),
                        content_type=content_type.value,
                    )
                    content = await self.text_service.generate_content(
                        content_type=content_type,
                        blog_content=job.original_content,
                        title=job.title,
                        metadata=job.job_metadata,
                    )
            else:
                content = await self.text_service.generate_content(
                    content_type=content_type,
                    blog_content=job.original_content,
                    title=job.title,
                    metadata=job.job_metadata,
                )

            # Save content to database
            output = ContentOutput(
                job_id=job.id,
                content_type=content_type,
                content=content,
            )
            db.add(output)
            db.commit()
        except Exception as e:
            logger.error(
                "Error generating text content",
                error=str(e),
                job_id=str(job.id),
                content_type=content_type,
            )
            raise

    async def _generate_thumbnail(self, job: Job, db: Session) -> None:
        """
        Generate thumbnail image

        Args:
            job: Job to process
            db: Database session
        """
        try:
            # Generate thumbnail prompt using OpenAI Agents if enabled
            if self.use_agents:
                try:
                    # Generate prompt using agents
                    image_prompt = await self.agents_orchestrator.generate_thumbnail_prompt(
                        blog_content=job.original_content,
                        title=job.title,
                        metadata=job.job_metadata,
                    )

                    logger.info(
                        "Generated thumbnail prompt using OpenAI Agents",
                        job_id=str(job.id),
                    )

                    # Use the prompt to generate the image
                    image_url = await self.image_service.generate_image_from_prompt(
                        prompt=image_prompt,
                        metadata=job.job_metadata,
                    )
                except Exception as agent_error:
                    logger.warning(
                        "Failed to generate thumbnail with OpenAI Agents, falling back to image service",
                        error=str(agent_error),
                        job_id=str(job.id),
                    )
                    image_url = await self.image_service.generate_thumbnail(
                        blog_content=job.original_content,
                        title=job.title,
                        metadata=job.job_metadata,
                    )
            else:
                # Use standard image service
                image_url = await self.image_service.generate_thumbnail(
                    blog_content=job.original_content,
                    title=job.title,
                    metadata=job.job_metadata,
                )

            # Save content to database
            output = ContentOutput(
                job_id=job.id,
                content_type=ContentType.THUMBNAIL,
                file_path=image_url,
            )
            db.add(output)
            db.commit()
        except Exception as e:
            logger.error(
                "Error generating thumbnail",
                error=str(e),
                job_id=str(job.id),
            )
            raise

    async def _generate_social_media_image(self, content_type: ContentType, job: Job, db: Session) -> None:
        """
        Generate an image for a social media post

        Args:
            content_type: Type of social media platform
            job: Job to process
            db: Database session
        """
        try:
            # Get the text content for this platform if it exists
            text_content = None
            for output in job.outputs:
                if output.content_type == content_type and output.content:
                    text_content = output.content
                    break

            # Generate image using the image service
            image_url = await self.image_service.generate_social_media_image(
                content_type=content_type,
                blog_content=job.original_content,
                title=job.title,
                text_content=text_content,
                metadata=job.job_metadata,
            )

            # Save image path to database
            output = ContentOutput(
                job_id=job.id,
                content_type=content_type,
                file_path=image_url,
                output_metadata={"type": "image"}
            )
            db.add(output)
            db.commit()

            logger.info(
                f"Generated image for {content_type.value}",
                job_id=str(job.id),
                content_type=content_type.value,
            )

        except Exception as e:
            logger.error(
                f"Error generating image for {content_type.value}",
                error=str(e),
                job_id=str(job.id),
                content_type=content_type.value,
            )
            # Don't raise the exception to allow the job to continue with other content types
            # Just log the error