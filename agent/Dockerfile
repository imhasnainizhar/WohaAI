# syntax=docker/dockerfile:1.7

FROM python:3.11-slim

# Python settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY agent/requirements.txt ./agent/requirements.txt

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# System packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy application
COPY agent/ ./agent/

WORKDIR /app/agent

# Non-root user
RUN useradd --create-home --shell /bin/bash appuser

RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]