# Docker Containerization using Claude Skill

This app was containerized using the `.claude/docker-containerization` skill.

---

## Prerequisites

**Make sure Docker Desktop is already installed and running on your system.**

---

## How to Use the Docker Containerization Skill

### Step 1: Prepare Your Project

Make sure your project/codebase is ready with:
- All source code files
- Dependency files (`requirements.txt` for Python, `package.json` for React)
- Your app should be working locally before containerizing

### Step 2: Dockerize with Claude

Simply tell Claude:

```
dockerize my app using .claude/docker-containerization
```

or

```
containerize this project using .claude/docker-containerization skill
```

Claude will:
1. Analyze your project structure
2. Detect the technology stack (FastAPI, React, Node.js, Next.js, etc.)
3. Create optimized Dockerfiles with multi-stage builds
4. Create docker-compose.yml for multi-service apps
5. Create .dockerignore files
6. Provide you with the commands to run

**This takes approximately 1 minute!**

---

## Step 3: Run Your Containerized App

After Claude creates the Docker files, run:

```bash
docker-compose up --build
```

Or run in background:

```bash
docker-compose up --build -d
```

---

## What Gets Created

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for each service |
| `docker-compose.yml` | Orchestrates all services |
| `.dockerignore` | Excludes unnecessary files |
| `nginx.conf` | For React/static frontends |

---

## Features Applied by the Skill

- Multi-stage builds (smaller images)
- Non-root user execution (security)
- Health checks (monitoring)
- Alpine/slim base images (minimal footprint)
- Gzip compression & caching (performance)
- Security headers

---

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# Check running containers
docker ps
```

---

## This Example App

This `tested_example_app` contains:
- **Backend**: FastAPI (Python) - runs on port 8000
- **Frontend**: React.js - runs on port 3000

Access after running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/api/health
