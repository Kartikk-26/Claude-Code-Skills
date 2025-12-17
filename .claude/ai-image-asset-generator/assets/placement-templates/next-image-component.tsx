/**
 * Next.js Image Component Templates
 *
 * Optimized for Next.js Image component with automatic optimization
 */

import React from 'react';
import Image from 'next/image';

// ============================================
// TYPES
// ============================================

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

interface HeroImageProps extends ImageProps {
  overlayOpacity?: number;
  children?: React.ReactNode;
}

interface IconProps {
  src: string;
  alt?: string;
  size?: number;
  className?: string;
}

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  className?: string;
}

interface GalleryImage {
  src: string;
  alt?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: number;
  className?: string;
}

// ============================================
// HERO IMAGE COMPONENT
// ============================================

/**
 * Full-width hero image with Next.js Image optimization
 */
export const HeroImage: React.FC<HeroImageProps> = ({
  src,
  alt,
  children,
  overlayOpacity = 0.5,
  className = '',
  priority = true
}) => {
  return (
    <div className={`relative w-full h-[80vh] ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        sizes="100vw"
        quality={85}
      />
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================
// RESPONSIVE IMAGE COMPONENT
// ============================================

/**
 * Responsive image with automatic srcset
 */
export const ResponsiveImage: React.FC<ImageProps & {
  width: number;
  height: number;
  sizes?: string;
}> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`max-w-full h-auto ${className}`}
      priority={priority}
      sizes={sizes}
      quality={80}
    />
  );
};

// ============================================
// ICON COMPONENT
// ============================================

/**
 * Optimized icon component
 */
export const Icon: React.FC<IconProps> = ({
  src,
  alt = '',
  size = 24,
  className = ''
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block ${className}`}
      // Icons are usually small, no need for optimization
      unoptimized={src.endsWith('.svg')}
    />
  );
};

// ============================================
// BACKGROUND IMAGE COMPONENT
// ============================================

/**
 * Section with background image
 */
export const BackgroundSection: React.FC<{
  src: string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  overlayColor?: string;
}> = ({
  src,
  alt = 'Background',
  children,
  className = '',
  overlay = false,
  overlayColor = 'rgba(0,0,0,0.3)'
}) => {
  return (
    <section className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover -z-10"
        quality={75}
        sizes="100vw"
      />
      {overlay && (
        <div
          className="absolute inset-0 -z-5"
          style={{ backgroundColor: overlayColor }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

// ============================================
// FEATURE CARD COMPONENT
// ============================================

/**
 * Feature card with icon
 */
export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = ''
}) => {
  return (
    <div className={`p-6 text-center rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <div className="mb-4 flex justify-center">
        <Image
          src={icon}
          alt=""
          width={64}
          height={64}
          className="w-16 h-16"
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// ============================================
// IMAGE GALLERY COMPONENT
// ============================================

/**
 * Responsive image gallery
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  className = ''
}) => {
  return (
    <div
      className={`grid gap-4 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square">
          <Image
            src={image.src}
            alt={image.alt || `Gallery image ${index + 1}`}
            fill
            className="object-cover rounded-lg"
            sizes={`(max-width: 768px) 50vw, ${100 / columns}vw`}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================
// PRODUCT IMAGE COMPONENT
// ============================================

/**
 * Product image with zoom capability placeholder
 */
export const ProductImage: React.FC<ImageProps & {
  width?: number;
  height?: number;
}> = ({
  src,
  alt,
  width = 600,
  height = 600,
  className = '',
  priority = false
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain w-full h-auto"
        priority={priority}
        quality={90}
      />
    </div>
  );
};

// ============================================
// AVATAR/PROFILE IMAGE
// ============================================

/**
 * Circular avatar image
 */
export const Avatar: React.FC<{
  src: string;
  alt: string;
  size?: number;
  className?: string;
}> = ({
  src,
  alt,
  size = 48,
  className = ''
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
    />
  );
};

// ============================================
// LOGO COMPONENT
// ============================================

/**
 * Logo with automatic sizing
 */
export const Logo: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({
  src,
  alt,
  width = 150,
  height = 40,
  className = ''
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`h-auto ${className}`}
      priority // Logos should load immediately
    />
  );
};

// ============================================
// NEXT.JS CONFIG ADDITION
// ============================================

/*
Add to next.config.js for external images:

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    // Optional: custom device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Optional: formats
    formats: ['image/avif', 'image/webp'],
  },
}
*/

// ============================================
// EXPORTS
// ============================================

export default {
  HeroImage,
  ResponsiveImage,
  Icon,
  BackgroundSection,
  FeatureCard,
  ImageGallery,
  ProductImage,
  Avatar,
  Logo
};
