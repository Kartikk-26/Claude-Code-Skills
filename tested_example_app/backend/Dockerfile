# Multi-stage Dockerfile for FastAPI Production
# Based on docker-containerization skill - optimized for minimal size and security

# Stage 1: Builder
FROM python:3.11-slim AS builder
LABEL stage=builder

WORKDIR /app

# Copy requirements and install dependencies to /app/.venv
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/dependencies -r requirements.txt

# Stage 2: Runner (Production)
FROM python:3.11-slim AS runner
LABEL maintainer="your-email@example.com"
LABEL description="FastAPI Backend - Production"

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy installed packages from builder
COPY --from=builder /app/dependencies /app/dependencies

# Copy application source
COPY . .

# Change ownership to appuser
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Add dependencies to PYTHONPATH
ENV PYTHONPATH=/app/dependencies
ENV PATH=/app/dependencies/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

# Start the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
