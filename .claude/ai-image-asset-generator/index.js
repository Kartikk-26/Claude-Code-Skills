/**
 * AI Image Asset Generator Skill
 *
 * Main entry point for the Claude skill.
 * This skill generates image assets using Gemini API and processes them
 * for web applications.
 */

export default async function aiImageAssetGenerator(input) {
  console.log("🎨 Running skill: ai-image-asset-generator");

  return {
    message: "Skill 'ai-image-asset-generator' is ready!",
    capabilities: [
      "Generate images with Gemini API",
      "Remove backgrounds from images",
      "Convert PNG to SVG",
      "Batch generate multiple assets",
      "Analyze page requirements",
      "Optimize images for web"
    ],
    input
  };
}

// Export individual functions for direct use
export { generateImage } from './scripts/generate-image.js';
export { removeBackground } from './scripts/remove-background.js';
export { convertToSvg } from './scripts/png-to-svg.js';
export { batchGenerate } from './scripts/batch-generate.js';
