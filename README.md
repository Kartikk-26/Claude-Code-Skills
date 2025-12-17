# Claude Skills

A collection of Claude Code skills to automate common development tasks.

---

## 1. Docker Containerization

**Location:** `.claude/docker-containerization`

Dockerize your entire project in 1 minute.

**Usage:**
```
dockerize my app using .claude/docker-containerization
```

**What it does:**
- Creates optimized Dockerfiles (multi-stage builds)
- Creates docker-compose.yml for multi-service apps
- Creates .dockerignore files
- Supports Python/FastAPI, React, Node.js, Next.js

---

## 2. AI Image Asset Generator

**Location:** `.claude/ai-image-asset-generator`

Generate website images using Google Gemini AI.

**Usage:**
```
I want to build a [project] landing page so generate the assets using .claude/ai-image-asset-generator
```

**What it does:**
- Generates 4 hero images (1920x1080)
- Generates 2 background patterns (1920x1080)
- Generates 5 icons (256x256)
- Removes backgrounds from icons (5 transparent PNGs)
- Converts icons to SVG vectors (3 SVGs)

**Technologies:** Gemini 2.0 Flash, Sharp, Potrace

**Output:** 19 files in `generated-assets/[project-name]/`

---

## Setup

### Docker Skill
- Install Docker Desktop

### Image Generator Skill
```bash
npm install @google/generative-ai sharp potrace fs-extra chalk ora commander dotenv axios
```
Add to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

---

## Folders

| Folder | Description |
|--------|-------------|
| `.claude/docker-containerization` | Docker containerization |
| `.claude/ai-image-asset-generator` | Image generator skill |
| `demo_app` | Sample app for testing |
| `tested_app` | docker_containerization_tested_example_app |
| `generated-assets` | Generated images output |
