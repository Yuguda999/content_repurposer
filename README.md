# Content Repurposer for Social Media

A production-grade service that ingests raw blog content and orchestrates AI-powered repurposing into various social media formats. This system leverages OpenAI's GPT models and DALL-E for intelligent content transformation, with a scalable architecture designed for high throughput and reliability.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running Locally](#running-locally)
  - [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Endpoints](#endpoints)
  - [Request/Response Examples](#requestresponse-examples)
- [Development](#development)
  - [Project Structure](#project-structure)
  - [Running Tests](#running-tests)
  - [Adding New Content Types](#adding-new-content-types)
  - [Extending AI Capabilities](#extending-ai-capabilities)
- [Production Deployment](#production-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
  - [Scaling Considerations](#scaling-considerations)
  - [Monitoring and Observability](#monitoring-and-observability)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Intelligent Content Transformation**: Transforms blog content into:
  - Twitter thread with optimal segmentation and hashtag suggestions
  - Instagram caption with engaging formatting and relevant hashtags
  - LinkedIn post with professional tone and call-to-action elements
  - Facebook post optimized for engagement and shareability
  - AI-generated thumbnails and platform-specific images via DALL-E 3
  - Custom images for each social media platform optimized for their audience

- **Advanced AI Integration**:
  - Uses OpenAI's GPT-4 for context-aware content generation
  - Leverages OpenAI Agents for sophisticated orchestration
  - Implements DALL-E 3 for high-quality image generation with customizable styles
  - Generates platform-specific images optimized for each social media channel
  - Fallback to alternative AI providers for redundancy

- **Production-Ready Architecture**:
  - Asynchronous processing with Celery workers
  - Horizontal scaling capabilities
  - Comprehensive error handling and retry mechanisms
  - Structured logging and metrics collection
  - Rate limiting and authentication

- **Flexible Storage Options**:
  - Local file system for development
  - S3/GCS integration for production
  - Extensible storage interface for custom providers

- **Developer-Friendly**:
  - Comprehensive API documentation
  - Modular, well-structured codebase
  - Extensive test coverage
  - Docker and Kubernetes support

## Architecture

The system follows a modular, microservices-inspired architecture designed for scalability and resilience:

```text
           ┌────────────────┐        ┌────────────────────┐
           │   FastAPI API  │        │  Object Storage    │
           │    Gateway     │◀──────▶│      (S3/GCS)      │
           └────────────────┘        └────────────────────┘
                   │                           ▲
                   ▼                           │
           ┌────────────────┐       ┌────────────────────┐
           │  Message Queue │◀─────▶│  Worker Pool       │
           │ (RabbitMQ/Redis)│      │ (Celery + OpenAI Agents) │
           └────────────────┘       └────────────────────┘
                  ▲  │                           │
                  │  ▼                           ▼
    ┌────────────────────┐        ┌─────────────────────┐
    │  AI Orchestrator   │        │   AI Clients        │
    │    (OpenAI Agents) │───────▶│ GPT‑4 / DALL·E /    │
    └────────────────────┘        │ Stability AI        │
                                   └─────────────────────┘
```

### Component Details

1. **FastAPI Gateway**:
   - Handles HTTP requests and authentication
   - Validates input with Pydantic schemas
   - Implements rate limiting and security measures
   - Provides OpenAPI documentation

2. **Message Queue**:
   - Decouples request handling from processing
   - Enables asynchronous job execution
   - Provides backpressure handling
   - Supports job prioritization

3. **Worker Pool**:
   - Processes jobs asynchronously
   - Scales horizontally based on load
   - Implements retry logic for resilience
   - Reports job status and metrics

4. **AI Orchestrator**:
   - Coordinates complex AI workflows
   - Manages context and prompt engineering
   - Handles fallbacks between AI providers
   - Optimizes token usage and performance

5. **AI Clients**:
   - Provides abstracted interfaces to AI services
   - Implements provider-specific optimizations
   - Handles authentication and rate limiting
   - Manages response parsing and error handling
   - Supports DALL-E 3 for high-quality image generation
   - Implements efficient image downloading and storage

6. **Object Storage**:
   - Stores generated images and artifacts
   - Organizes images by platform (Twitter, Instagram, etc.)
   - Provides URL generation for content delivery
   - Implements access control and lifecycle policies
   - Supports multiple storage backends (local, S3, GCS)
   - Efficiently handles binary image data from DALL-E API

## Technology Stack

- **Backend Framework**: FastAPI
- **Database**: PostgreSQL (production), SQLite (development)
- **Message Queue**: Redis (development), RabbitMQ (production)
- **Task Processing**: Celery
- **AI Services**: OpenAI GPT-4, DALL-E 3, Stability AI
- **Storage**: Local filesystem, AWS S3, Google Cloud Storage
- **Authentication**: JWT-based authentication
- **Containerization**: Docker, Kubernetes
- **Monitoring**: Prometheus, Grafana
- **Logging**: Structured JSON logging (ELK-compatible)
- **Testing**: Pytest, TestClient

## Getting Started

### Prerequisites

- Python 3.11+
- Docker and Docker Compose (for containerized deployment)
- OpenAI API key
- PostgreSQL (for production) or SQLite (for development)
- Redis (for message queue and caching)

### Installation

#### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/content-repurposer.git
   cd content-repurposer
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Edit the `.env` file with your configuration (see [Configuration](#configuration) section).

### Configuration

The application is configured through environment variables, which can be set in the `.env` file:

```ini
# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
SECRET_KEY=your-secret-key-here

# OpenAI Settings
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4.1

# Image Generation Settings
OPENAI_IMAGE_MODEL=dall-e-3
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=standard  # Options: standard, hd (for DALL-E 3)

# Storage Settings
STORAGE_TYPE=local  # local, s3, gcs
LOCAL_STORAGE_PATH=./storage
# S3 settings (if using S3)
# S3_BUCKET_NAME=your-bucket-name
# S3_ACCESS_KEY=your-access-key
# S3_SECRET_KEY=your-secret-key
# S3_REGION=us-east-1

# Redis Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Database Settings
DATABASE_URL=sqlite:///./content_repurposer.db
# For PostgreSQL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/content_repurposer
```

### Running Locally

1. Initialize the database:
   ```bash
   python -m scripts.migrate
   ```

2. Seed the database with test data (optional):
   ```bash
   python -m scripts.seed
   ```

3. Start the API server:
   ```bash
   cd src
   uvicorn content_repurposer.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. In a separate terminal, start the Celery worker (optional for development):
   ```bash
   cd src
   celery -A content_repurposer.workers.celery_app worker --loglevel=info
   ```

### Running with Docker

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Check the logs:
   ```bash
   docker-compose logs -f
   ```

3. Stop the containers:
   ```bash
   docker-compose down
   ```

## API Documentation

Once the application is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Authentication

The API uses JWT-based authentication. To authenticate:

1. Create a user account:
   ```bash
   curl -X POST http://localhost:8000/api/users \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "securepassword", "full_name": "Example User"}'
   ```

2. Obtain an access token:
   ```bash
   curl -X POST http://localhost:8000/api/auth/token \
     -d "username=user@example.com&password=securepassword"
   ```

3. Use the token in subsequent requests:
   ```bash
   curl -X GET http://localhost:8000/api/jobs \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

### Endpoints

#### User Management
- `POST /api/users` - Create a new user
- `POST /api/auth/token` - Get access token

#### Content Repurposing
- `POST /api/content` - Submit content for repurposing
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{job_id}` - Get job details

#### System
- `GET /health` - Health check endpoint
- `GET /metrics` - Prometheus metrics (requires authentication)

### Request/Response Examples

#### Submitting Content for Repurposing

Request:
```json
POST /api/content
{
  "title": "The Future of AI in Content Creation",
  "content": "Artificial intelligence is revolutionizing content creation...",
  "content_types": ["twitter", "instagram", "linkedin"],
  "metadata": {
    "tone": "professional",
    "hashtags": ["AI", "ContentCreation", "DigitalMarketing"]
  }
}
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "The Future of AI in Content Creation",
  "status": "pending",
  "created_at": "2023-04-24T12:34:56.789Z",
  "updated_at": "2023-04-24T12:34:56.789Z",
  "completed_at": null,
  "error_message": null,
  "job_metadata": {
    "content_types": ["twitter", "instagram", "linkedin"],
    "tone": "professional",
    "hashtags": ["AI", "ContentCreation", "DigitalMarketing"]
  },
  "outputs": []
}
```

#### Getting Job Results

Request:
```
GET /api/jobs/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "The Future of AI in Content Creation",
  "status": "completed",
  "created_at": "2023-04-24T12:34:56.789Z",
  "updated_at": "2023-04-24T12:35:10.123Z",
  "completed_at": "2023-04-24T12:35:10.123Z",
  "error_message": null,
  "job_metadata": {
    "content_types": ["twitter", "instagram", "linkedin"],
    "tone": "professional",
    "hashtags": ["AI", "ContentCreation", "DigitalMarketing"]
  },
  "outputs": [
    {
      "id": "660f9500-f30c-52e5-b827-557766550000",
      "content_type": "twitter",
      "content": "1/ The Future of AI in Content Creation: A thread on how artificial intelligence is transforming the way we create and consume content...",
      "file_path": null,
      "created_at": "2023-04-24T12:35:05.456Z",
      "updated_at": "2023-04-24T12:35:05.456Z"
    },
    {
      "id": "770a0600-g41d-63f6-c938-668877660000",
      "content_type": "instagram",
      "content": "✨ The Future of AI in Content Creation ✨\n\nArtificial intelligence is revolutionizing how we create content...",
      "file_path": null,
      "created_at": "2023-04-24T12:35:07.789Z",
      "updated_at": "2023-04-24T12:35:07.789Z"
    },
    {
      "id": "880b1700-h52e-74g7-d049-779988770000",
      "content_type": "linkedin",
      "content": "I've been exploring the transformative impact of AI on content creation...",
      "file_path": null,
      "created_at": "2023-04-24T12:35:09.012Z",
      "updated_at": "2023-04-24T12:35:09.012Z"
    },
    {
      "id": "990c2800-i63f-85h8-e150-880099880000",
      "content_type": "thumbnail",
      "content": null,
      "file_path": "https://storage.example.com/thumbnails/550e8400-e29b-41d4-a716-446655440000.png",
      "created_at": "2023-04-24T12:35:10.123Z",
      "updated_at": "2023-04-24T12:35:10.123Z"
    },
    {
      "id": "aa0d3900-j74g-96i9-f261-991100990000",
      "content_type": "twitter_image",
      "content": null,
      "file_path": "https://storage.example.com/twitter_images/550e8400-e29b-41d4-a716-446655440000.png",
      "created_at": "2023-04-24T12:35:11.234Z",
      "updated_at": "2023-04-24T12:35:11.234Z"
    },
    {
      "id": "bb0e4a00-k85h-a7j0-g372-aa2211aa0000",
      "content_type": "instagram_image",
      "content": null,
      "file_path": "https://storage.example.com/instagram_images/550e8400-e29b-41d4-a716-446655440000.png",
      "created_at": "2023-04-24T12:35:12.345Z",
      "updated_at": "2023-04-24T12:35:12.345Z"
    }
  ]
}
```

## Development

### Project Structure

The project follows a modular structure for maintainability and separation of concerns:

```
content-repurposer/
├── .env.example                     # Example environment variables
├── .gitignore                       # Git ignore file
├── Dockerfile                       # Container definition
├── README.md                        # Project documentation
├── docker-compose.yml               # Docker Compose configuration
├── requirements.txt                 # Python dependencies
├── scripts/                         # Utility scripts
│   ├── migrate.sh                   # Database migration script
│   ├── seed.sh                      # Database seeding script
│   └── test_agents.py               # OpenAI agents test script
├── src/                             # Source code
│   └── content_repurposer/          # Main package
│       ├── __init__.py              # Package initialization
│       ├── main.py                  # FastAPI application entrypoint
│       ├── api/                     # API routes and dependencies
│       │   ├── __init__.py
│       │   ├── dependencies.py      # Dependency injection
│       │   └── routes.py            # API endpoints
│       ├── core/                    # Core functionality
│       │   ├── __init__.py
│       │   ├── config.py            # Configuration management
│       │   ├── logging.py           # Logging configuration
│       │   └── security.py          # Authentication and security
│       ├── services/                # Business logic
│       │   ├── __init__.py
│       │   ├── image_generation.py  # Image generation service
│       │   ├── openai_agents.py     # OpenAI agents integration
│       │   ├── orchestrator.py      # Content orchestration
│       │   ├── storage_service.py   # Storage abstraction
│       │   └── text_generation.py   # Text generation service
│       ├── clients/                 # External API clients
│       │   ├── __init__.py
│       │   ├── openai_client.py     # OpenAI API client
│       │   └── stabilityai_client.py# Stability AI client
│       ├── db/                      # Database models and session
│       │   ├── __init__.py
│       │   ├── base.py              # SQLAlchemy base
│       │   ├── models.py            # Database models
│       │   └── session.py           # Database session
│       ├── workers/                 # Asynchronous workers
│       │   ├── __init__.py
│       │   ├── celery_app.py        # Celery configuration
│       │   └── tasks.py             # Celery tasks
│       ├── utils/                   # Utility functions
│       │   ├── __init__.py
│       │   ├── cache.py             # Caching utilities
│       │   └── retry.py             # Retry mechanisms
│       └── schemas/                 # Data validation schemas
│           ├── __init__.py
│           └── content_models.py    # Pydantic models
├── tests/                           # Test suite
│   ├── conftest.py                  # Test configuration
│   ├── unit/                        # Unit tests
│   │   ├── test_routes.py           # API route tests
│   │   └── test_services.py         # Service tests
│   └── integration/                 # Integration tests
│       └── test_end_to_end.py       # End-to-end tests
└── openai_docs/                     # OpenAI documentation
    ├── README.md                    # Documentation overview
    ├── openai_agents_overview.md    # OpenAI Agents overview
    ├── openai_agents_quickstart.md  # OpenAI Agents quickstart
    └── ...                          # Other documentation files
```

### Running Tests

The project uses pytest for testing. To run the tests:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_services.py

# Run with coverage report
pytest --cov=content_repurposer
```

### Adding New Content Types

To add a new content type (e.g., TikTok captions):

1. Add the new type to the `ContentType` enum in `schemas/content_models.py`:
   ```python
   class ContentType(str, Enum):
       # Existing types...
       TIKTOK = "tiktok"
   ```

2. Implement the generation logic in `services/text_generation.py`:
   ```python
   async def generate_tiktok_caption(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
       # Implementation...
   ```

3. Update the `generate_content` method to handle the new type:
   ```python
   async def generate_content(self, content_type: ContentType, ...):
       # Existing types...
       elif content_type == ContentType.TIKTOK:
           return await self.generate_tiktok_caption(...)
   ```

4. Add OpenAI agent support in `services/openai_agents.py`:
   ```python
   def _create_agent_for_content_type(self, content_type: ContentType, ...):
       # Existing types...
       elif content_type == ContentType.TIKTOK:
           return Agent(
               name="TikTok Caption Creator",
               instructions="...",
               model=settings.OPENAI_MODEL,
               tools=[get_hashtags],
           )
   ```

5. Add tests for the new content type in `tests/unit/test_services.py`.

### Extending AI Capabilities

#### Adding a New AI Text Provider

To integrate a new AI provider (e.g., Anthropic Claude):

1. Create a new client in `clients/anthropic_client.py`:
   ```python
   class AnthropicClient:
       def __init__(self, api_key: Optional[str] = None):
           # Implementation...

       async def generate_text(self, prompt: str, ...) -> str:
           # Implementation...
   ```

2. Update the orchestrator to support the new provider:
   ```python
   class ContentOrchestrator:
       def __init__(self, ..., anthropic_client: Optional[AnthropicClient] = None, use_anthropic: bool = False):
           self.anthropic_client = anthropic_client or AnthropicClient()
           self.use_anthropic = use_anthropic
   ```

3. Add fallback logic in the text generation service:
   ```python
   async def _generate_text_content(self, content_type: ContentType, job: Job, db: Session) -> None:
       try:
           if self.use_anthropic:
               # Try Anthropic first
           elif self.use_agents:
               # Try OpenAI Agents
           else:
               # Use standard text service
       except Exception as e:
           # Fallback logic
   ```

4. Update configuration in `core/config.py` to support the new provider.

#### Enhancing Image Generation

To add support for a new image generation model or provider:

1. Update the image generation service in `services/image_generation.py`:
   ```python
   async def generate_image_with_new_provider(self, prompt: str) -> Optional[str]:
       """
       Generates an image using a new provider's API.
       """
       try:
           # Implementation for the new provider
           return image_url
       except Exception as e:
           logger.error(f"Error generating image with new provider: {str(e)}")
           raise
   ```

2. Add fallback logic in the image generation methods:
   ```python
   async def generate_thumbnail(self, blog_content: str, title: str, metadata: Optional[Dict[str, Any]] = None) -> str:
       try:
           # Generate image prompt...

           if self.use_new_provider:
               image_url = await self.generate_image_with_new_provider(image_prompt)
           else:
               image_url = await self.generate_image_with_dalle(image_prompt)

           # Download and save image...
       except Exception as e:
           # Fallback logic
   ```

3. Update configuration in `core/config.py` to support the new provider:
   ```python
   # New Image Provider Settings
   NEW_PROVIDER_API_KEY: str = os.getenv("NEW_PROVIDER_API_KEY", "")
   NEW_PROVIDER_MODEL: str = os.getenv("NEW_PROVIDER_MODEL", "default-model")
   USE_NEW_PROVIDER: bool = os.getenv("USE_NEW_PROVIDER", "false").lower() == "true"
   ```

## Production Deployment

### Kubernetes Deployment

The application can be deployed to Kubernetes using the provided manifests:

1. Build and push the Docker image:
   ```bash
   docker build -t your-registry/content-repurposer:latest .
   docker push your-registry/content-repurposer:latest
   ```

2. Deploy using Helm:
   ```bash
   cd helm
   helm install content-repurposer . \
     --set image.repository=your-registry/content-repurposer \
     --set image.tag=latest \
     --set secrets.openaiApiKey=your-openai-api-key
   ```

### Scaling Considerations

For production deployments, consider the following scaling strategies:

1. **Horizontal Scaling**:
   - Scale API servers based on CPU/memory usage
   - Scale workers based on queue length
   - Use autoscaling for dynamic workloads

2. **Database Scaling**:
   - Use connection pooling
   - Consider read replicas for high-read workloads
   - Implement database sharding for very large datasets

3. **Caching Strategy**:
   - Cache frequently accessed data in Redis
   - Implement result caching for similar prompts
   - Use CDN for serving generated images

4. **Cost Optimization**:
   - Batch similar requests where possible
   - Implement token usage tracking and budgeting
   - Use smaller models for simpler tasks

### Monitoring and Observability

The application includes built-in monitoring capabilities:

1. **Metrics**:
   - Prometheus endpoint at `/metrics`
   - Request counts, latencies, and error rates
   - Queue lengths and processing times
   - AI token usage and costs

2. **Logging**:
   - Structured JSON logs compatible with ELK stack
   - Request IDs for tracing requests across components
   - Error details and context for troubleshooting

3. **Alerting**:
   - Set up alerts for high error rates
   - Monitor queue backlog and processing delays
   - Track API rate limits and quota usage

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL in .env file
   - Ensure database server is running
   - Verify network connectivity and firewall settings

2. **Redis Connection Errors**:
   - Check REDIS_HOST and REDIS_PORT in .env file
   - Ensure Redis server is running
   - For local development, rate limiting is disabled if Redis is unavailable

3. **OpenAI API Errors**:
   - Verify OPENAI_API_KEY is correct
   - Check for rate limiting or quota issues
   - Ensure the requested model is available for your account
   - For DALL-E 3 image generation, verify your account has access to the model
   - Check if your organization has been verified for image generation

4. **Worker Processing Issues**:
   - Check Celery worker logs for errors
   - Ensure message broker (Redis/RabbitMQ) is running
   - Verify task routing configuration

5. **Image Generation Issues**:
   - Check if DALL-E 3 is available in your region
   - Verify storage directories exist and have proper permissions
   - For image download failures, check network connectivity
   - Inspect image prompts in logs for potential content policy violations

### Debugging

For detailed debugging:

1. Enable debug mode in .env:
   ```
   DEBUG=True
   ```

2. Run the API with increased log level:
   ```bash
   uvicorn content_repurposer.main:app --log-level debug
   ```

3. Check application logs:
   ```bash
   docker-compose logs -f api
   docker-compose logs -f worker
   ```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run tests: `pytest`
5. Commit your changes: `git commit -m 'Add my feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
