# AI Image Asset Generator - Claude Skill

A Claude Code skill that automatically generates AI image assets for websites and applications using Google Gemini API. Just describe your project, and Claude will determine what images you need, generate them, remove backgrounds, convert to SVG, and place them in your project.

## Features

- **Smart Asset Analysis** - Automatically determines what images your project needs
- **Gemini API Integration** - Generates high-quality images using Google Gemini 2.0 Flash
- **Background Removal** - Creates transparent PNGs for icons and overlays
- **PNG to SVG Conversion** - Converts images to scalable, interactable vectors
- **Batch Generation** - Generate multiple assets in one go
- **Frontend Integration** - Ready-to-use React, Next.js, and HTML templates

## Quick Start

### 1. Install Dependencies (in your project root)

```bash
npm install @google/generative-ai sharp potrace fs-extra chalk ora commander dotenv axios
```

### 2. Set Your Gemini API Key

Create a `.env` file in your project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/apikey

### 3. Use the Skill

Just tell Claude what you want to build:

```
"I want to build an airport website landing page"
```

Claude will automatically:
1. Analyze what assets are needed (hero, icons, background)
2. Generate all images using Gemini API
3. Remove backgrounds from icons
4. Convert icons to SVG
5. Save everything to `generated-assets/` folder

## Usage Examples

### Generate Landing Page Assets
```
"Build a landing page for an e-commerce store"
```

### Generate Icon Set
```
"Create icons for: dashboard, settings, profile, notifications"
```

### Generate Single Image
```
"Generate a hero image for a tech startup website"
```

### Direct Skill Invocation
```
"Generate image assets using .claude/ai-image-asset-generator"
```

## Scripts

### Generate Single Image
```bash
node .claude/ai-image-asset-generator/scripts/generate-image.js \
  --prompt "modern office workspace" \
  --size 1920x1080 \
  --output ./assets/hero.png
```

### Remove Background
```bash
node .claude/ai-image-asset-generator/scripts/remove-background.js \
  --input ./assets/icon.png \
  --output ./assets/icon-transparent.png
```

### Convert to SVG
```bash
node .claude/ai-image-asset-generator/scripts/png-to-svg.js \
  --input ./assets/icon.png \
  --output ./assets/icon.svg \
  --color "#2563EB"
```

### Batch Generate
```bash
node .claude/ai-image-asset-generator/scripts/batch-generate.js \
  --landing-page "airport booking website"
```

### Analyze Page Requirements
```bash
node .claude/ai-image-asset-generator/scripts/analyze-page.js \
  --description "e-commerce landing page for shoes"
```

## Folder Structure

```
.claude/ai-image-asset-generator/
├── SKILL.md                    # Skill documentation (Claude reads this)
├── README.md                   # This file
├── package.json                # Dependencies
├── index.js                    # Entry point
├── .env                        # API key (create this)
│
├── scripts/                    # Executable scripts
│   ├── generate-image.js       # Generate images with Gemini
│   ├── remove-background.js    # Remove image backgrounds
│   ├── png-to-svg.js          # Convert PNG to SVG
│   ├── batch-generate.js      # Batch generation
│   ├── analyze-page.js        # Analyze asset requirements
│   └── optimize-assets.js     # Optimize images for web
│
├── assets/
│   ├── prompt-templates/       # Pre-built prompt templates
│   │   ├── landing-hero.txt
│   │   ├── icon-set.txt
│   │   ├── background-abstract.txt
│   │   ├── product-mockup.txt
│   │   └── infographic-element.txt
│   │
│   ├── placement-templates/    # Frontend code templates
│   │   ├── react-image-component.jsx
│   │   ├── next-image-component.tsx
│   │   └── html-css-placement.html
│   │
│   └── config/                 # Configuration files
│       ├── gemini-config.json
│       ├── image-presets.json
│       └── .env.example
│
└── references/                 # Documentation
    ├── gemini-api-guide.md
    ├── prompt-engineering.md
    ├── image-best-practices.md
    └── placement-guidelines.md
```

## How It Works

```
User: "I want to build an airport website"
                    │
                    ▼
        ┌─────────────────────┐
        │  1. ANALYZE         │
        │  Determine needed   │
        │  assets from desc   │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  2. GENERATE        │
        │  Call Gemini API    │
        │  (5-6 times)        │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  3. PROCESS         │
        │  - Remove BG        │
        │  - Convert to SVG   │
        └─────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │  4. OUTPUT          │
        │  Save to project    │
        │  generated-assets/  │
        └─────────────────────┘
```

## Output Example

For prompt: `"I want to build an airport website landing page"`

Generated assets:
```
generated-assets/airport-landing/
├── hero-airport.png           # 1920x1080 hero image
├── background-pattern.png     # 1920x1080 background
├── icon-flights.png           # 256x256 icon
├── icon-flights-nobg.png      # Transparent version
├── icon-flights.svg           # Vector SVG
├── icon-hotels.png
├── icon-hotels-nobg.png
├── icon-hotels.svg
├── icon-parking.png
├── icon-parking-nobg.png
├── icon-parking.svg
├── icon-lounge.png
├── icon-lounge-nobg.png
└── icon-lounge.svg
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `OUTPUT_DIR` | Output directory | `./generated-assets` |
| `DEFAULT_SIZE` | Default image size | `1024x1024` |
| `DEFAULT_QUALITY` | Image quality (1-100) | `80` |
| `API_DELAY` | Delay between API calls (ms) | `2000` |

### Image Presets

Available in `assets/config/image-presets.json`:

| Preset | Size | Use Case |
|--------|------|----------|
| `hero` | 1920x1080 | Landing page heroes |
| `icon` | 256x256 | UI icons |
| `thumbnail` | 400x300 | Preview images |
| `background` | 1920x1080 | Page backgrounds |
| `product` | 1024x1024 | Product images |
| `avatar` | 512x512 | Profile pictures |
| `logo` | 512x512 | Brand logos |
| `favicon` | 512x512 | Site favicons |

## API Reference

### generate-image.js

```bash
Options:
  -p, --prompt <text>      Image description (required)
  -s, --style <style>      Style modifiers
  --size <WxH>             Image size (default: 1024x1024)
  -o, --output <path>      Output file path
  -n, --negative <text>    What to avoid
  -q, --quality <level>    Quality: low, medium, high
```

### remove-background.js

```bash
Options:
  -i, --input <path>       Input image (required)
  -o, --output <path>      Output image
  -b, --background <color> Background color to remove (default: #FFFFFF)
  -t, --threshold <num>    Color threshold (0-255, default: 30)
  --batch <directory>      Process entire directory
  --auto-detect           Auto-detect background color
```

### png-to-svg.js

```bash
Options:
  -i, --input <path>       Input PNG (required)
  -o, --output <path>      Output SVG
  -m, --mode <mode>        trace or posterize (default: trace)
  -c, --color <color>      SVG color (default: #000000)
  -t, --threshold <num>    Tracing threshold (0-255)
  --batch <directory>      Convert entire directory
  --icon                   Optimize for icons
```

## Troubleshooting

### "API key not found"
- Create `.env` file in project root with `GEMINI_API_KEY=your_key`
- Or set environment variable: `export GEMINI_API_KEY=your_key`

### "Rate limit exceeded"
- Increase `API_DELAY` in .env (default: 2000ms)
- Wait a minute and try again

### "Image generation failed"
- Check your API key has image generation enabled
- Try a simpler prompt
- Check Gemini API status

### "Background removal not working"
- Ensure image has clear subject/background separation
- Try adjusting `--threshold` value
- Use `--auto-detect` for non-white backgrounds

## Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "sharp": "^0.33.0",
  "potrace": "^2.1.8",
  "axios": "^1.6.0",
  "fs-extra": "^11.2.0",
  "chalk": "^5.3.0",
  "ora": "^8.0.0",
  "commander": "^12.0.0",
  "dotenv": "^16.3.0"
}
```

## License

MIT

## Author

AI Labs

---

**Note:** This skill requires a Google Gemini API key with image generation capabilities. Get yours at https://aistudio.google.com/apikey
