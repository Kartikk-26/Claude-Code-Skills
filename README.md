# Docker Containerization Skill

A Claude skill template that can dockerize your entire project within 1 minute.

## How to Use

1. Make sure your project code is ready
2. Ensure Docker Desktop is installed and running
3. Tell Claude:

```
dockerize my app using .claude/docker-containerization
```

That's it! Claude will create all Docker configurations automatically.

## What It Does

- Creates optimized Dockerfiles (multi-stage builds)
- Creates docker-compose.yml for multi-service apps
- Creates .dockerignore files
- Supports Python/FastAPI, React, Node.js, Next.js

## Folders

| Folder | Description |
|--------|-------------|
| `.claude/docker-containerization` | The skill template |
| `demo_app` | Sample app without Docker (for testing) |
| `tested_example_app` | Sample app with Docker (already containerized) |
