# Prompt Engineering for AI Image Generation

## Overview

Effective prompts are crucial for generating high-quality image assets. This guide covers techniques for writing prompts that consistently produce professional results.

## Prompt Structure

### Basic Formula

```
[Subject] + [Style] + [Mood] + [Technical Specs] + [Negative Prompts]
```

### Example Breakdown

```
Modern office workspace,           <- Subject
flat illustration style,           <- Style
professional and clean,            <- Mood
high resolution, centered,         <- Technical
white background                   <- Background
```

## Subject Description

### Be Specific

```
❌ Bad:  "office"
✅ Good: "modern open-plan office workspace with standing desks and plants"

❌ Bad:  "person"
✅ Good: "professional woman in business attire, confident pose, mid-30s"
```

### Include Context

```
❌ Bad:  "laptop"
✅ Good: "sleek laptop on minimalist desk, coffee cup nearby, morning light"
```

### Describe Composition

```
"Hero image showing [subject] in the center,
with [supporting elements] arranged around it,
leaving space for text overlay on the left"
```

## Style Keywords

### Design Styles

| Style | Keywords | Best For |
|-------|----------|----------|
| Flat | flat design, 2D, no shadows | Icons, illustrations |
| Material | material design, subtle shadows | UI elements |
| Minimalist | minimal, simple, clean | Modern websites |
| Isometric | isometric, 3D angle, geometric | Tech, data viz |
| Hand-drawn | sketch, hand-drawn, organic | Creative, friendly |
| Photorealistic | realistic, photo-quality | Hero images |
| Abstract | abstract, artistic, conceptual | Backgrounds |

### Art Styles

```
- Vector art
- Digital painting
- Watercolor effect
- Line art
- Low-poly
- Gradient mesh
- Paper cut-out
- Neon/glowing
```

### Photography Styles

```
- Product photography
- Editorial style
- Lifestyle photography
- Studio lighting
- Natural light
- Dramatic lighting
- Soft focus
- High contrast
```

## Color Specifications

### Named Palettes

```
"corporate blue palette" - Professional blues
"startup vibrant" - Bold, energetic colors
"nature greens" - Organic, earthy tones
"monochrome" - Single color variations
"pastel soft" - Gentle, muted colors
"dark mode" - Dark backgrounds, light accents
```

### Specific Colors

```
"primary color: #3B82F6 blue"
"warm orange (#F97316) accents"
"gradient from deep purple to soft pink"
"two-tone black and gold"
```

### Color Relationships

```
"complementary colors"
"analogous color scheme"
"triadic colors"
"split-complementary"
```

## Mood & Atmosphere

### Professional Moods

```
- Professional and trustworthy
- Corporate and authoritative
- Clean and modern
- Sophisticated and elegant
- Innovative and forward-thinking
```

### Friendly Moods

```
- Warm and welcoming
- Playful and fun
- Approachable and friendly
- Casual and relaxed
- Cheerful and positive
```

### Dynamic Moods

```
- Energetic and bold
- Dynamic and powerful
- Exciting and vibrant
- Active and moving
- Dramatic and impactful
```

## Technical Specifications

### Resolution & Size

```
"high resolution"
"4K quality"
"crisp and sharp"
"suitable for large format"
"optimized for web"
```

### Composition

```
"centered composition"
"rule of thirds"
"symmetrical layout"
"negative space on left"
"full bleed"
"with margins"
```

### Aspect Ratios

```
"16:9 landscape format"
"1:1 square format"
"9:16 vertical/portrait"
"21:9 ultra-wide"
"4:3 standard"
```

### Background

```
"white background"
"transparent background"
"gradient background"
"solid color background (#FFFFFF)"
"no background, isolated subject"
```

## Negative Prompts

### What to Avoid

```
"without text"
"no watermarks"
"avoid blurry elements"
"no distorted faces"
"not cluttered"
"no busy backgrounds"
```

### Common Issues to Prevent

```
"avoid: text, logos, watermarks, blurry areas, distortion"
"exclude: humans, faces, copyrighted content"
"without: gradients, shadows, 3D effects"
```

## Category-Specific Prompts

### Hero Images

```
[Scene description] for website hero section,
professional photography style,
[mood] atmosphere,
suitable for text overlay,
high quality,
16:9 aspect ratio,
[color scheme]
```

**Example:**
```
Modern tech startup team collaborating in glass-walled office,
professional photography style,
innovative and dynamic atmosphere,
suitable for text overlay on left side,
high quality, sharp focus,
16:9 aspect ratio,
blue and white color scheme
```

### Icons

```
[Subject] icon,
[style] design,
single color ([color]),
white background,
centered,
suitable for UI,
[size]px,
consistent stroke width
```

**Example:**
```
Email envelope icon,
minimal line art design,
single color (#333333),
white background,
centered,
suitable for UI,
256px,
consistent 2px stroke width
```

### Backgrounds

```
Abstract [pattern type] background,
[color scheme] colors,
[mood] feel,
seamless pattern,
suitable for website background,
[resolution]
```

**Example:**
```
Abstract geometric wave background,
blue to purple gradient colors,
calm and professional feel,
seamless pattern,
suitable for website background,
1920x1080
```

### Product Images

```
[Product] mockup,
[angle] view,
professional product photography,
[lighting] lighting,
[background],
high quality render,
suitable for e-commerce
```

**Example:**
```
Smartphone mockup displaying app interface,
three-quarter angle view,
professional product photography,
soft studio lighting,
clean white background,
high quality render,
suitable for e-commerce
```

## Consistency Tips

### For Icon Sets

Add to each prompt:
```
", consistent with existing icon set,
same stroke width,
matching visual weight,
cohesive design language"
```

### For Brand Assets

Include brand guidelines:
```
"following brand guidelines:
- Primary color: [color]
- Style: [style]
- Tone: [tone]
- Consistent with [existing assets]"
```

### Batch Generation

Use template with variables:
```javascript
const iconPrompt = (subject) => `
${subject} icon,
minimal flat design,
single color (#000000),
white background,
centered,
256x256,
consistent 2px stroke,
matching style with set
`;

const icons = ["home", "search", "settings", "user"];
const prompts = icons.map(iconPrompt);
```

## Quality Checklist

Before generating, ensure prompt includes:

- [ ] Clear subject description
- [ ] Style specification
- [ ] Mood/atmosphere
- [ ] Color information
- [ ] Technical specs (size, format)
- [ ] Background preference
- [ ] Negative prompts (what to avoid)
- [ ] Use case context

## Common Mistakes

### Too Vague
```
❌ "nice image for website"
✅ "professional hero image for SaaS landing page, showing team collaboration, modern office, blue accent colors, 16:9"
```

### Too Complex
```
❌ "image with a person holding a laptop while standing in an office that has plants and there's a window with city view and..."
✅ "professional at laptop, modern office, clean composition, suitable for hero section"
```

### Missing Context
```
❌ "icon of a house"
✅ "home navigation icon, minimal line style, 24x24px, UI-ready, consistent 2px stroke"
```

## Iteration Strategy

### Start Broad, Then Refine

1. **First attempt**: Basic prompt
2. **Second attempt**: Add style details
3. **Third attempt**: Add technical specs
4. **Fourth attempt**: Add negative prompts

### A/B Testing

Generate variations:
```
Version A: "...modern flat style..."
Version B: "...minimal line art style..."
Version C: "...subtle gradient style..."
```

Compare and select the best approach for your project.

---

**Last Updated**: December 2024
