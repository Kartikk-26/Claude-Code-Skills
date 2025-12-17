/**
 * React Image Component Templates
 *
 * Copy and customize these templates for your React project
 */

// ============================================
// BASIC IMAGE COMPONENT
// ============================================

import React from 'react';

/**
 * Basic responsive image with lazy loading
 */
export const BasicImage = ({
  src,
  alt,
  className = '',
  width,
  height
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-image ${className}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
};

// ============================================
// HERO IMAGE COMPONENT
// ============================================

/**
 * Full-width hero image with overlay support
 */
export const HeroImage = ({
  src,
  alt,
  children,
  overlayOpacity = 0.5,
  className = ''
}) => {
  return (
    <div className={`hero-container ${className}`} style={{ position: 'relative' }}>
      <img
        src={src}
        alt={alt}
        className="hero-image"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '80vh',
          objectFit: 'cover'
        }}
        loading="eager" // Hero images should load immediately
        fetchpriority="high"
      />
      {children && (
        <div
          className="hero-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// OPTIMIZED IMAGE WITH WEBP FALLBACK
// ============================================

/**
 * Image with WebP format and PNG/JPG fallback
 */
export const OptimizedImage = ({
  src,
  webpSrc,
  alt,
  className = '',
  width,
  height
}) => {
  return (
    <picture>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};

// ============================================
// RESPONSIVE IMAGE WITH SRCSET
// ============================================

/**
 * Responsive image with multiple sizes
 */
export const ResponsiveImage = ({
  src,
  srcSet,
  sizes = '100vw',
  alt,
  className = '',
  width,
  height
}) => {
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`responsive-image ${className}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
    />
  );
};

// Example usage:
// <ResponsiveImage
//   src="/images/hero.jpg"
//   srcSet="/images/hero-640.jpg 640w, /images/hero-1280.jpg 1280w, /images/hero-1920.jpg 1920w"
//   sizes="(max-width: 640px) 640px, (max-width: 1280px) 1280px, 1920px"
//   alt="Hero image"
// />

// ============================================
// ICON COMPONENT (FOR SVG ICONS)
// ============================================

/**
 * SVG Icon component with size and color props
 */
export const Icon = ({
  src,
  alt,
  size = 24,
  color = 'currentColor',
  className = ''
}) => {
  // For inline SVG
  if (src.endsWith('.svg')) {
    return (
      <img
        src={src}
        alt={alt}
        className={`icon ${className}`}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          filter: color !== 'currentColor' ? `drop-shadow(0 0 0 ${color})` : 'none'
        }}
        aria-hidden={!alt}
      />
    );
  }

  // For regular images
  return (
    <img
      src={src}
      alt={alt}
      className={`icon ${className}`}
      width={size}
      height={size}
      loading="lazy"
    />
  );
};

// ============================================
// BACKGROUND IMAGE COMPONENT
// ============================================

/**
 * Div with background image
 */
export const BackgroundImage = ({
  src,
  children,
  className = '',
  style = {},
  overlay = false,
  overlayColor = 'rgba(0,0,0,0.3)'
}) => {
  return (
    <div
      className={`bg-image-container ${className}`}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        ...style
      }}
    >
      {overlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: overlayColor
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// ============================================
// FEATURE CARD WITH ICON
// ============================================

/**
 * Feature card component with icon
 */
export const FeatureCard = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <div className={`feature-card ${className}`} style={{
      padding: '24px',
      textAlign: 'center',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div className="feature-icon" style={{ marginBottom: '16px' }}>
        <img
          src={icon}
          alt=""
          width={64}
          height={64}
          style={{ width: 64, height: 64 }}
        />
      </div>
      <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6 }}>
        {description}
      </p>
    </div>
  );
};

// ============================================
// IMAGE GALLERY COMPONENT
// ============================================

/**
 * Simple image gallery grid
 */
export const ImageGallery = ({
  images,
  columns = 3,
  gap = 16,
  className = ''
}) => {
  return (
    <div
      className={`image-gallery ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap
      }}
    >
      {images.map((image, index) => (
        <div key={index} className="gallery-item">
          <img
            src={image.src}
            alt={image.alt || `Gallery image ${index + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

// ============================================
// CSS STYLES (add to your stylesheet)
// ============================================

/*
.responsive-image {
  max-width: 100%;
  height: auto;
  display: block;
}

.hero-container {
  width: 100%;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
}

.icon {
  display: inline-block;
  vertical-align: middle;
}

.feature-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.image-gallery {
  width: 100%;
}

@media (max-width: 768px) {
  .image-gallery {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 480px) {
  .image-gallery {
    grid-template-columns: 1fr !important;
  }
}
*/

export default {
  BasicImage,
  HeroImage,
  OptimizedImage,
  ResponsiveImage,
  Icon,
  BackgroundImage,
  FeatureCard,
  ImageGallery
};
