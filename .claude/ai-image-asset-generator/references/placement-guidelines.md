# Image Placement Guidelines

## Overview

This guide covers best practices for integrating AI-generated image assets into frontend applications.

## Project Structure

### Recommended Asset Organization

```
src/
├── assets/
│   ├── images/
│   │   ├── hero/           # Hero/banner images
│   │   ├── icons/          # UI icons (SVG preferred)
│   │   ├── backgrounds/    # Background patterns/images
│   │   ├── products/       # Product images
│   │   ├── illustrations/  # Decorative illustrations
│   │   └── logos/          # Brand assets
│   └── fonts/
├── components/
│   └── ui/
│       ├── Image.tsx       # Reusable image component
│       ├── Icon.tsx        # Icon component
│       └── Avatar.tsx      # Avatar component
└── styles/
```

### Generated Assets Location

```
generated-assets/          # AI-generated output
├── raw/                   # Original generations
├── processed/             # After background removal
├── optimized/             # Compressed & resized
└── final/                 # Production-ready
```

## React Integration

### Basic Image Component

```jsx
// components/ui/Image.jsx
export const Image = ({
  src,
  alt,
  className = '',
  loading = 'lazy',
  ...props
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-image ${className}`}
      loading={loading}
      decoding="async"
      {...props}
    />
  );
};
```

### Importing Assets

```jsx
// Method 1: Direct import (bundled)
import heroImage from '@/assets/images/hero/main.webp';

function HeroSection() {
  return <img src={heroImage} alt="Hero" />;
}

// Method 2: Public folder (not bundled)
function HeroSection() {
  return <img src="/images/hero/main.webp" alt="Hero" />;
}

// Method 3: Dynamic import
const heroImage = await import(`@/assets/images/hero/${imageName}.webp`);
```

### Icon Component

```jsx
// components/ui/Icon.jsx
export const Icon = ({ name, size = 24, className = '' }) => {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
};

// Usage
<Icon name="search" size={20} />
<Icon name="menu" size={24} className="text-gray-600" />
```

## Next.js Integration

### Image Component

```tsx
// components/ui/OptimizedImage.tsx
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = ''
}: Props) => {
  // Fill mode for responsive
  if (!width || !height) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="100vw"
        />
      </div>
    );
  }

  // Fixed dimensions
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};
```

### Next.js Config

```js
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',
      },
    ],
  },
};
```

## CSS Integration

### Background Images

```css
/* Direct reference */
.hero {
  background-image: url('/images/hero/main.webp');
  background-size: cover;
  background-position: center;
}

/* With CSS variables for theming */
:root {
  --hero-bg: url('/images/hero/light.webp');
}

[data-theme='dark'] {
  --hero-bg: url('/images/hero/dark.webp');
}

.hero {
  background-image: var(--hero-bg);
}

/* Responsive backgrounds */
.hero {
  background-image: url('/images/hero/mobile.webp');
}

@media (min-width: 768px) {
  .hero {
    background-image: url('/images/hero/tablet.webp');
  }
}

@media (min-width: 1200px) {
  .hero {
    background-image: url('/images/hero/desktop.webp');
  }
}
```

### Icon Fonts vs SVG Icons

```css
/* SVG Icons (recommended) */
.icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

/* Size variants */
.icon-sm { font-size: 16px; }
.icon-md { font-size: 24px; }
.icon-lg { font-size: 32px; }

/* Color variants */
.icon-primary { color: var(--color-primary); }
.icon-muted { color: var(--color-muted); }
```

## Layout Patterns

### Hero Section

```jsx
function HeroSection({ image, title, subtitle }) {
  return (
    <section className="hero">
      <div className="hero__image-container">
        <img
          src={image}
          alt=""
          className="hero__image"
          loading="eager"
          fetchpriority="high"
        />
        <div className="hero__overlay" />
      </div>
      <div className="hero__content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
```

```css
.hero {
  position: relative;
  height: 80vh;
  min-height: 500px;
}

.hero__image-container {
  position: absolute;
  inset: 0;
}

.hero__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
}

.hero__content {
  position: relative;
  z-index: 1;
  /* ... */
}
```

### Feature Grid with Icons

```jsx
function FeatureGrid({ features }) {
  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <div key={feature.id} className="feature-card">
          <img
            src={feature.icon}
            alt=""
            className="feature-card__icon"
            width={64}
            height={64}
          />
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      ))}
    </div>
  );
}
```

```css
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
}

.feature-card__icon {
  margin-bottom: 1rem;
}
```

### Product Gallery

```jsx
function ProductGallery({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <img
          src={images[activeIndex].src}
          alt={images[activeIndex].alt}
          className="product-gallery__image"
        />
      </div>
      <div className="product-gallery__thumbs">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={index === activeIndex ? 'active' : ''}
          >
            <img src={image.thumb} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Performance Optimization

### Image Preloading

```jsx
// In head or early in document
<link rel="preload" as="image" href="/images/hero.webp" />

// Programmatic preloading
useEffect(() => {
  const criticalImages = ['/images/hero.webp', '/images/logo.svg'];

  criticalImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}, []);
```

### Lazy Loading Pattern

```jsx
function LazyImage({ src, alt, placeholder }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          imgRef.current.src = src;
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className="lazy-image-container">
      {!loaded && <div className="placeholder" style={{ background: placeholder }} />}
      <img
        ref={imgRef}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={loaded ? 'loaded' : 'loading'}
      />
    </div>
  );
}
```

### Error Handling

```jsx
function ImageWithFallback({ src, fallback, alt, ...props }) {
  const [error, setError] = useState(false);

  return (
    <img
      src={error ? fallback : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
```

## Integration Checklist

### Before Adding Images

- [ ] Optimize image (compress, resize)
- [ ] Generate responsive sizes
- [ ] Create WebP version
- [ ] Prepare alt text
- [ ] Determine loading strategy (eager/lazy)

### Implementation

- [ ] Use appropriate component
- [ ] Set width/height to prevent CLS
- [ ] Implement error fallback
- [ ] Add loading state if needed
- [ ] Test on slow connection

### After Adding

- [ ] Verify correct display
- [ ] Check responsive behavior
- [ ] Test accessibility (screen reader)
- [ ] Measure performance impact
- [ ] Verify caching works

## Common Patterns

### Conditional Image Loading

```jsx
// Load different images based on viewport
const heroImage = useBreakpoint({
  mobile: '/images/hero-mobile.webp',
  tablet: '/images/hero-tablet.webp',
  desktop: '/images/hero-desktop.webp',
});
```

### Image with Loading State

```jsx
function AsyncImage({ src, alt }) {
  const [status, setStatus] = useState('loading');

  return (
    <div className={`image-wrapper ${status}`}>
      {status === 'loading' && <Skeleton />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
      {status === 'error' && <ErrorPlaceholder />}
    </div>
  );
}
```

### Theme-Aware Images

```jsx
function ThemedImage({ lightSrc, darkSrc, alt }) {
  const { theme } = useTheme();

  return (
    <img
      src={theme === 'dark' ? darkSrc : lightSrc}
      alt={alt}
    />
  );
}
```

---

**Last Updated**: December 2024
