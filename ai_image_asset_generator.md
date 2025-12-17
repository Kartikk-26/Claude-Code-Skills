# AI Image Asset Generator

## What is this?

A Claude Code skill that automatically generates website images using Google Gemini AI. Just describe your project and it creates all the images you need.

## Technologies Used

| Technology | Purpose |
|------------|---------|
| **Google Gemini 2.0 Flash** | AI image generation |
| **Sharp** | Background removal from images |
| **Potrace** | PNG to SVG vector conversion |
| **Node.js** | Script execution |

## How it works

```
User Prompt
     │
     ▼
┌─────────────────┐
│  1. ANALYZE     │  Determine what assets are needed
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. GENERATE    │  Call Gemini API (11 times)
└────────┬────────┘  → 4 heroes, 2 backgrounds, 5 icons
         │
         ▼
┌─────────────────┐
│  3. PROCESS     │  Sharp removes backgrounds (5 icons)
└────────┬────────┘  Potrace converts to SVG (3 icons)
         │
         ▼
┌─────────────────┐
│  4. OUTPUT      │  Save 19 files to generated-assets/
└─────────────────┘
```

## What it generates

For any landing page, it creates **19 files**:

| Type | Count | Description |
|------|-------|-------------|
| Hero Images | 4 | Large banner images (1920x1080) |
| Backgrounds | 2 | Pattern/texture images (1920x1080) |
| Icons | 5 | Small icons (256x256) |
| Transparent Icons | 5 | Same icons with background removed |
| SVG Vectors | 3 | Scalable vector versions of icons |

## Setup

1. Install dependencies in your project root:
```bash
npm install @google/generative-ai sharp potrace fs-extra chalk ora commander dotenv axios
```

2. Add your Gemini API key to `.env`:
```
GEMINI_API_KEY=your_api_key_here
```

Get API key from: https://aistudio.google.com/apikey

## How to use

Just tell Claude what you want to build:

```
I want to build a [your project] landing page so generate the assets using .claude/ai-image-asset-generator
```

## Example

**Prompt:**
```
I want to build a cricket academy website landing page so generate the assets using .claude/ai-image-asset-generator
```

**Output:** `generated-assets/cricket-academy/`

```
hero-main.png
hero-secondary.png
hero-feature.png
hero-cta.png
background-main.png
background-secondary.png
icon-primary.png
icon-primary-nobg.png
icon-primary-nobg.svg
icon-secondary.png
icon-secondary-nobg.png
icon-secondary-nobg.svg
icon-tertiary.png
icon-tertiary-nobg.png
icon-tertiary-nobg.svg
icon-quaternary.png
icon-quaternary-nobg.png
icon-quinary.png
icon-quinary-nobg.png
```

## That's it!

One prompt = 19 ready-to-use website images.
