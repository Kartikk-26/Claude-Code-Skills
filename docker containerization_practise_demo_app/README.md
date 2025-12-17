# Demo App

A simple FastAPI + React app ready to be containerized.

**Make sure Docker Desktop is installed and running.**

## Dockerize with Claude

Tell Claude:

```
dockerize my app using .claude/docker-containerization
```

## Run

After Claude creates Docker files:

```bash
docker-compose up --build
```

## Access

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
