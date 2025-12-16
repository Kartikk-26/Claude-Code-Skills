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
| `agentic_app` | AI-powered chatbot demo app |

---


## Agentic App - Raju's Royal Artifacts

An AI-powered chatbot simulating a charming Indian shopkeeper.

**Live Demo:** [agenticapp.vercel.app](https://agenticapp.vercel.app/)

### What it does:
- Users browse a virtual artifact shop (lamps, scarves, carvings, etc.)
- Chat with "Raju" who responds in Indian-English style
- Raju can negotiate prices, give discounts, and describe items

### Tech Stack:

| Layer    | Technology               |
|----------|--------------------------|
| Frontend | React.js                 |
| Backend  | Python Flask             |
| AI/LLM   | Groq API (Llama 3.3 70B) |
| Hosting  | Vercel (serverless)      |
| Styling  | CSS                      |

### Architecture:
```
Frontend (React) → /api/chat → Flask API → Groq LLM → Response
```

Simple, fun demo of an AI-powered conversational commerce experience!
