FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ /app/src/

# Set Python path
ENV PYTHONPATH=/app

# Run as non-root user
RUN useradd -m appuser
USER appuser

# Command will be specified in docker-compose.yml
CMD ["uvicorn", "content_repurposer.main:app", "--host", "0.0.0.0", "--port", "8000"]
