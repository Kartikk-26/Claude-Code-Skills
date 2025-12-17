# Image Asset Best Practices

## Overview

This guide covers best practices for creating, optimizing, and using image assets in web applications.

## File Formats

### Format Comparison

| Format | Best For | Transparency | Animation | Compression |
|--------|----------|--------------|-----------|-------------|
| **WebP** | General web | Yes | Yes | Lossy/Lossless |
| **PNG** | Icons, graphics | Yes | No | Lossless |
| **JPEG** | Photos | No | No | Lossy |
| **SVG** | Icons, logos | Yes | Yes | Vector |
| **AVIF** | Modern web | Yes | Yes | Lossy |

### When to Use Each

#### WebP (Recommended Default)
```
✅ Photos and complex images
✅ UI elements with gradients
✅ Thumbnails and previews
✅ Hero images
❌ Need IE11 support
```

#### PNG
```
✅ Icons requiring transparency
✅ Screenshots with text
✅ Graphics with sharp edges
✅ Images requiring lossless quality
❌ Large photos (use WebP/JPEG)
```

#### JPEG
```
✅ Photos without transparency
✅ Large hero images
✅ Background images
❌ Graphics with text
❌ Images needing transparency
```

#### SVG
```
✅ Icons and logos
✅ Simple illustrations
✅ Animated graphics
✅ Scalable UI elements
❌ Complex images/photos
```

#### AVIF
```
✅ Maximum compression needed
✅ Modern browser only
✅ High quality at small size
❌ Safari < 16, older browsers
```

## Image Optimization

### Compression Guidelines

| Image Type | Format | Quality | Max Size |
|------------|--------|---------|----------|
| Hero | WebP | 80-85% | 200KB |
| Product | WebP/PNG | 85-90% | 150KB |
| Thumbnail | WebP | 70-75% | 30KB |
| Icon | SVG/PNG | 90%+ | 10KB |
| Background | WebP | 75-80% | 100KB |

### Size Recommendations

```
Hero Images:    1920x1080 (Full HD)
                2560x1440 (2K) for retina
                3840x2160 (4K) for large displays

Product:        800x800 - 1200x1200
Thumbnails:     300x300 - 400x400
Icons:          24x24, 48x48, 64x64, 128x128
Avatars:        64x64, 128x128, 256x256
Social Share:   1200x630 (Open Graph)
```

### Responsive Images

#### HTML srcset

```html
<img
  src="image-800.webp"
  srcset="
    image-400.webp 400w,
    image-800.webp 800w,
    image-1200.webp 1200w,
    image-1920.webp 1920w
  "
  sizes="(max-width: 600px) 400px,
         (max-width: 1200px) 800px,
         1200px"
  alt="Descriptive text"
  loading="lazy"
>
```

#### Picture Element (Format Fallback)

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Fallback">
</picture>
```

## Performance Best Practices

### Lazy Loading

```html
<!-- Native lazy loading -->
<img src="image.webp" loading="lazy" alt="...">

<!-- With dimensions (prevents layout shift) -->
<img
  src="image.webp"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
  alt="..."
>
```

### Preloading Critical Images

```html
<!-- In <head> for hero images -->
<link
  rel="preload"
  as="image"
  href="hero.webp"
  fetchpriority="high"
>
```

### Placeholder Strategies

#### 1. Dominant Color
```css
.image-container {
  background-color: #e2e8f0; /* Dominant color */
}
```

#### 2. Blur-up (LQIP)
```html
<!-- Low Quality Image Placeholder -->
<img
  src="tiny-blur.jpg"
  data-src="full-image.webp"
  class="lazy-image"
>
```

#### 3. Skeleton
```css
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

## Accessibility

### Alt Text Guidelines

```html
<!-- Descriptive for content images -->
<img src="team.jpg" alt="Five team members collaborating around a whiteboard">

<!-- Empty for decorative -->
<img src="decoration.svg" alt="" role="presentation">

<!-- Functional for actions -->
<img src="search.svg" alt="Search">
```

### Color Contrast

- Icons should have sufficient contrast with background
- Don't rely solely on color to convey information
- Test with color blindness simulators

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .animated-image {
    animation: none;
  }
}
```

## Background Images

### CSS Best Practices

```css
.hero {
  background-image: url('hero.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* Fallback color while loading */
  background-color: #1a1a2e;
}

/* Responsive background */
@media (max-width: 768px) {
  .hero {
    background-image: url('hero-mobile.webp');
  }
}

/* High-DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .hero {
    background-image: url('hero@2x.webp');
  }
}
```

### Background with Overlay

```css
.hero {
  position: relative;
  background-image: url('hero.webp');
  background-size: cover;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.7)
  );
}
```

## Icon Best Practices

### SVG Icons

```html
<!-- Inline SVG (best for styling) -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
  <path d="..."/>
</svg>

<!-- External SVG with use -->
<svg class="icon">
  <use href="icons.svg#search"/>
</svg>
```

### Icon Styling

```css
.icon {
  width: 1em;
  height: 1em;
  fill: currentColor; /* Inherits text color */
  vertical-align: middle;
}

.icon--sm { width: 16px; height: 16px; }
.icon--md { width: 24px; height: 24px; }
.icon--lg { width: 32px; height: 32px; }
```

### Icon Sprite

```html
<!-- icons.svg -->
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <symbol id="search" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
  <symbol id="menu" viewBox="0 0 24 24">
    <path d="..."/>
  </symbol>
</svg>
```

## Caching Strategy

### Cache Headers

```
# Long cache for hashed filenames
Cache-Control: public, max-age=31536000, immutable

# Shorter cache for frequently updated
Cache-Control: public, max-age=86400
```

### File Naming

```
# With hash for cache busting
hero.a1b2c3d4.webp
icon-search.e5f6g7h8.svg

# Version suffix
logo-v2.svg
hero-2024.webp
```

## CDN & Delivery

### Image CDN Benefits

- Automatic format conversion
- On-the-fly resizing
- Global distribution
- Compression optimization

### Example CDN URL

```
https://cdn.example.com/images/hero.jpg?w=1200&q=80&fm=webp
```

### Self-Hosting Checklist

- [ ] Compress all images
- [ ] Generate multiple sizes
- [ ] Serve WebP with fallback
- [ ] Enable gzip/brotli
- [ ] Set cache headers
- [ ] Use lazy loading

## Quality Checklist

### Before Deployment

- [ ] All images optimized/compressed
- [ ] Responsive sizes generated
- [ ] WebP versions available
- [ ] Alt text provided
- [ ] Lazy loading implemented
- [ ] Proper dimensions set
- [ ] Fallbacks in place
- [ ] Cache headers configured
- [ ] Loading tested on slow connections

### Regular Audit

```bash
# Check for large images
find ./images -type f -size +500k

# Audit with Lighthouse
npx lighthouse https://example.com --only-categories=performance
```

## Tools & Resources

### Optimization Tools

- **Sharp** (Node.js) - Image processing
- **ImageOptim** (Mac) - Lossless compression
- **Squoosh** (Web) - Manual optimization
- **SVGO** - SVG optimization

### Testing Tools

- **Lighthouse** - Performance auditing
- **WebPageTest** - Load testing
- **ImageKit** - Image analysis
- **Cloudinary** - CDN + optimization

---

**Last Updated**: December 2024
