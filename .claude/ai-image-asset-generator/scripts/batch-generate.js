#!/usr/bin/env node

/**
 * Batch Generate Script
 *
 * Generate multiple images in a single run using a config file
 * Handles rate limiting, retries, and parallel processing
 */

import { generateImage, generateImagePrompt } from "./generate-image.js";
import { removeBackground } from "./remove-background.js";
import { convertToSvg } from "./png-to-svg.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default batch configuration
 */
const DEFAULT_CONFIG = {
  outputDir: "./generated-assets",
  delayBetweenCalls: 1000, // 1 second between API calls (faster)
  maxRetries: 3,
  processAfterGenerate: true,
  removeBackgrounds: false,
  convertToSvg: false,
  concurrency: 1 // Sequential by default to avoid rate limits
};

/**
 * Batch generate images from a config file or array
 *
 * @param {Object|string} config - Config object or path to config JSON
 * @returns {Promise<Object>} - Results summary
 */
export async function batchGenerate(config) {
  // Load config if it's a file path
  if (typeof config === "string") {
    config = await fs.readJson(config);
  }

  const settings = { ...DEFAULT_CONFIG, ...config.settings };
  const assets = config.assets || [];

  console.log(chalk.cyan("\n🎨 Batch Image Generation\n"));
  console.log(chalk.gray("━".repeat(50)));
  console.log(chalk.white(`Total Assets:     ${assets.length}`));
  console.log(chalk.white(`Output Directory: ${settings.outputDir}`));
  console.log(chalk.white(`Delay:            ${settings.delayBetweenCalls}ms`));
  console.log(chalk.gray("━".repeat(50) + "\n"));

  // Ensure output directory exists
  await fs.ensureDir(settings.outputDir);

  const results = {
    total: assets.length,
    successful: 0,
    failed: 0,
    assets: []
  };

  // Process assets
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const assetName = asset.name || `asset-${i + 1}`;

    console.log(chalk.blue(`\n[${i + 1}/${assets.length}] ${assetName}`));

    try {
      // Generate the image
      const outputPath = path.join(
        settings.outputDir,
        asset.output || `${assetName}.png`
      );

      const result = await generateImage({
        prompt: asset.prompt,
        style: asset.style || settings.defaultStyle,
        size: asset.size || settings.defaultSize || "1024x1024",
        output: outputPath,
        negative: asset.negative,
        quality: asset.quality || "high"
      });

      let assetResult = {
        name: assetName,
        success: result.success,
        generatedPath: result.filePath || result.description,
        processedPaths: []
      };

      // Post-processing if enabled and generation succeeded
      if (result.success && result.filePath) {
        // Remove background if specified
        if (asset.removeBackground || settings.removeBackgrounds) {
          try {
            const bgResult = await removeBackground({
              input: result.filePath,
              backgroundColor: asset.backgroundColor || "#FFFFFF"
            });
            assetResult.processedPaths.push({
              type: "no-background",
              path: bgResult.outputPath
            });
            console.log(chalk.gray(`  ✓ Background removed`));
          } catch (e) {
            console.log(chalk.yellow(`  ⚠ Background removal failed: ${e.message}`));
          }
        }

        // Convert to SVG if specified
        if (asset.convertToSvg || settings.convertToSvg) {
          try {
            const inputForSvg = assetResult.processedPaths.find(p => p.type === "no-background")?.path
              || result.filePath;

            const svgResult = await convertToSvg({
              input: inputForSvg,
              mode: asset.svgMode || "trace",
              color: asset.svgColor || "#000000"
            });
            assetResult.processedPaths.push({
              type: "svg",
              path: svgResult.outputPath
            });
            console.log(chalk.gray(`  ✓ Converted to SVG`));
          } catch (e) {
            console.log(chalk.yellow(`  ⚠ SVG conversion failed: ${e.message}`));
          }
        }
      }

      results.assets.push(assetResult);
      results.successful++;

      // Delay between API calls
      if (i < assets.length - 1) {
        await sleep(settings.delayBetweenCalls);
      }

    } catch (error) {
      console.error(chalk.red(`  ✗ Failed: ${error.message}`));
      results.assets.push({
        name: assetName,
        success: false,
        error: error.message
      });
      results.failed++;

      // Longer delay after errors
      await sleep(settings.delayBetweenCalls * 2);
    }
  }

  // Print summary
  console.log(chalk.cyan("\n" + "━".repeat(50)));
  console.log(chalk.cyan("📊 Batch Generation Summary\n"));
  console.log(chalk.green(`  ✓ Successful: ${results.successful}`));
  console.log(chalk.red(`  ✗ Failed:     ${results.failed}`));
  console.log(chalk.white(`  Total:        ${results.total}`));

  // Save results to file
  const resultsPath = path.join(settings.outputDir, "batch-results.json");
  await fs.writeJson(resultsPath, results, { spaces: 2 });
  console.log(chalk.gray(`\n  Results saved to: ${resultsPath}`));

  return results;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a batch config from a simple list of prompts
 */
export function createBatchConfig(prompts, options = {}) {
  return {
    settings: {
      outputDir: options.outputDir || DEFAULT_CONFIG.outputDir,
      delayBetweenCalls: options.delay || DEFAULT_CONFIG.delayBetweenCalls,
      removeBackgrounds: options.removeBackgrounds || false,
      convertToSvg: options.convertToSvg || false,
      defaultStyle: options.style || "modern, professional, high quality",
      defaultSize: options.size || "1024x1024"
    },
    assets: prompts.map((prompt, i) => ({
      name: typeof prompt === "string" ? `asset-${i + 1}` : prompt.name,
      prompt: typeof prompt === "string" ? prompt : prompt.prompt,
      ...( typeof prompt === "object" ? prompt : {})
    }))
  };
}

/**
 * Generate landing page assets
 * Generates: 4 hero images, 2 backgrounds, 5 icons (all transparent), 3 SVGs
 */
export async function generateLandingPageAssets(description, options = {}) {
  const themeColor = options.themeColor || "#2563EB";

  const assets = [
    // 4 Hero Images
    {
      name: "hero-main",
      prompt: `Hero image for ${description}, professional website header, modern design, high quality, wide shot`,
      size: "1920x1080"
    },
    {
      name: "hero-secondary",
      prompt: `Secondary hero image for ${description}, different angle, lifestyle shot, professional`,
      size: "1920x1080"
    },
    {
      name: "hero-feature",
      prompt: `Feature showcase hero for ${description}, detailed view, professional photography style`,
      size: "1920x1080"
    },
    {
      name: "hero-cta",
      prompt: `Call-to-action hero image for ${description}, engaging, motivational, professional`,
      size: "1920x1080"
    },
    // 2 Background Patterns
    {
      name: "background-main",
      prompt: `Subtle abstract background pattern for ${description} website, minimal, light colors, seamless`,
      size: "1920x1080"
    },
    {
      name: "background-secondary",
      prompt: `Secondary background texture for ${description}, geometric pattern, soft colors, modern`,
      size: "1920x1080"
    },
    // 5 Icons (all get transparent backgrounds, first 3 get SVG)
    {
      name: "icon-primary",
      prompt: `Primary icon representing main feature of ${description}, minimal flat design, single color, white background, centered`,
      size: "256x256",
      removeBackground: true,
      convertToSvg: true,
      svgColor: themeColor
    },
    {
      name: "icon-secondary",
      prompt: `Secondary icon for ${description} service, minimal flat design, single color, white background, centered`,
      size: "256x256",
      removeBackground: true,
      convertToSvg: true,
      svgColor: themeColor
    },
    {
      name: "icon-tertiary",
      prompt: `Tertiary icon for ${description} benefit, minimal flat design, single color, white background, centered`,
      size: "256x256",
      removeBackground: true,
      convertToSvg: true,
      svgColor: themeColor
    },
    {
      name: "icon-quaternary",
      prompt: `Fourth icon for ${description} feature, minimal flat design, single color, white background, centered`,
      size: "256x256",
      removeBackground: true,
      convertToSvg: false // No SVG for this one
    },
    {
      name: "icon-quinary",
      prompt: `Fifth icon for ${description} highlight, minimal flat design, single color, white background, centered`,
      size: "256x256",
      removeBackground: true,
      convertToSvg: false // No SVG for this one
    }
  ];

  return await batchGenerate({
    settings: {
      outputDir: options.outputDir || "./landing-page-assets",
      delayBetweenCalls: 1000, // Fast 1 second delay
      removeBackgrounds: false, // Per-asset control
      convertToSvg: false // Per-asset control
    },
    assets
  });
}

/**
 * Generate icon set
 */
export async function generateIconSet(icons, options = {}) {
  const style = options.style || "minimal flat design, single color, white background, centered";

  const assets = icons.map(icon => ({
    name: typeof icon === "string" ? icon : icon.name,
    prompt: `${typeof icon === "string" ? icon : icon.prompt} icon, ${style}`,
    size: options.size || "256x256",
    removeBackground: true,
    convertToSvg: true,
    svgColor: options.color || "#000000"
  }));

  return await batchGenerate({
    settings: {
      outputDir: options.outputDir || "./icons",
      delayBetweenCalls: options.delay || 2000
    },
    assets
  });
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("batch-generate")
  .description("Batch generate multiple images")
  .version("1.0.0");

program
  .option("-c, --config <path>", "Path to config JSON file")
  .option("-p, --prompts <prompts...>", "List of prompts to generate")
  .option("-o, --output <directory>", "Output directory", DEFAULT_CONFIG.outputDir)
  .option("-d, --delay <ms>", "Delay between API calls", String(DEFAULT_CONFIG.delayBetweenCalls))
  .option("--remove-bg", "Remove backgrounds from all images")
  .option("--to-svg", "Convert all images to SVG")
  .option("-s, --style <style>", "Default style for all images")
  .option("--size <size>", "Default size for all images", "1024x1024")
  .option("--landing-page <description>", "Generate landing page assets for description")
  .option("--icons <icons...>", "Generate icon set")
  .action(async (options) => {
    try {
      if (options.landingPage) {
        // Generate landing page assets
        console.log(chalk.cyan(`\n🏠 Generating Landing Page Assets for: ${options.landingPage}\n`));
        await generateLandingPageAssets(options.landingPage, {
          outputDir: options.output
        });

      } else if (options.icons && options.icons.length > 0) {
        // Generate icon set
        console.log(chalk.cyan(`\n🎯 Generating Icon Set: ${options.icons.length} icons\n`));
        await generateIconSet(options.icons, {
          outputDir: options.output,
          style: options.style,
          delay: parseInt(options.delay)
        });

      } else if (options.config) {
        // Use config file
        await batchGenerate(options.config);

      } else if (options.prompts && options.prompts.length > 0) {
        // Generate from prompt list
        const config = createBatchConfig(options.prompts, {
          outputDir: options.output,
          delay: parseInt(options.delay),
          removeBackgrounds: options.removeBg,
          convertToSvg: options.toSvg,
          style: options.style,
          size: options.size
        });

        await batchGenerate(config);

      } else {
        console.log(chalk.yellow("No input provided. Use one of:"));
        console.log(chalk.gray("  --config <path>        Config JSON file"));
        console.log(chalk.gray("  --prompts <prompts>    List of prompts"));
        console.log(chalk.gray("  --landing-page <desc>  Generate landing page assets"));
        console.log(chalk.gray("  --icons <icons>        Generate icon set"));
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

// Run CLI if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  program.parse();
}

export default batchGenerate;
