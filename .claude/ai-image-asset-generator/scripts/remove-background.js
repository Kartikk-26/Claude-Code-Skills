#!/usr/bin/env node

/**
 * Remove Background Script
 *
 * Removes backgrounds from images using sharp library
 * Creates transparent PNGs suitable for web overlays
 */

import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Remove background from an image
 *
 * This uses color-based background removal which works well for:
 * - Images with solid color backgrounds (white, black, etc.)
 * - Icons and illustrations
 * - Product photos on plain backgrounds
 *
 * @param {Object} options - Processing options
 * @param {string} options.input - Input image path
 * @param {string} options.output - Output image path
 * @param {string} options.backgroundColor - Background color to remove (default: white)
 * @param {number} options.threshold - Color matching threshold (0-255, default: 30)
 * @returns {Promise<Object>} - Result with file path and metadata
 */
export async function removeBackground(options) {
  const {
    input,
    output,
    backgroundColor = "#FFFFFF",
    threshold = 30,
    feather = 2
  } = options;

  const spinner = ora({
    text: chalk.blue(`Processing: ${path.basename(input)}`),
    spinner: "dots"
  }).start();

  try {
    // Validate input file exists
    if (!await fs.pathExists(input)) {
      throw new Error(`Input file not found: ${input}`);
    }

    // Determine output path
    const outputPath = output || generateOutputPath(input);
    await fs.ensureDir(path.dirname(outputPath));

    spinner.text = chalk.blue("Analyzing image...");

    // Load the image
    const image = sharp(input);
    const metadata = await image.metadata();

    spinner.text = chalk.blue("Removing background...");

    // Get raw pixel data
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Parse background color
    const bgColor = parseColor(backgroundColor);

    // Process pixels to remove background
    const processedData = processPixels(data, info, bgColor, threshold, feather);

    // Create output image
    await sharp(processedData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
      .png()
      .toFile(outputPath);

    const outputStats = await fs.stat(outputPath);

    spinner.succeed(chalk.green(`Background removed: ${path.basename(outputPath)}`));

    return {
      success: true,
      inputPath: input,
      outputPath: outputPath,
      originalSize: metadata.size,
      newSize: outputStats.size,
      dimensions: {
        width: info.width,
        height: info.height
      },
      metadata: {
        processedAt: new Date().toISOString(),
        threshold: threshold,
        backgroundColor: backgroundColor
      }
    };

  } catch (error) {
    spinner.fail(chalk.red(`Failed: ${error.message}`));
    throw error;
  }
}

/**
 * Process pixels to make background transparent
 */
function processPixels(data, info, bgColor, threshold, feather) {
  const { width, height, channels } = info;
  const output = Buffer.alloc(data.length);

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;

    // Calculate color distance from background
    const distance = Math.sqrt(
      Math.pow(r - bgColor.r, 2) +
      Math.pow(g - bgColor.g, 2) +
      Math.pow(b - bgColor.b, 2)
    );

    // Determine new alpha based on distance
    let newAlpha;
    if (distance < threshold) {
      // Within threshold - make transparent
      newAlpha = 0;
    } else if (distance < threshold + feather * 10) {
      // Feather zone - partial transparency for smooth edges
      const featherAmount = (distance - threshold) / (feather * 10);
      newAlpha = Math.min(255, Math.round(featherAmount * a));
    } else {
      // Keep original
      newAlpha = a;
    }

    output[i] = r;
    output[i + 1] = g;
    output[i + 2] = b;
    output[i + 3] = newAlpha;
  }

  return output;
}

/**
 * Parse color string to RGB object
 */
function parseColor(color) {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  // Handle named colors
  const namedColors = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 },
    grey: { r: 128, g: 128, b: 128 }
  };

  return namedColors[color.toLowerCase()] || namedColors.white;
}

/**
 * Generate output path from input
 */
function generateOutputPath(inputPath) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const name = path.basename(inputPath, ext);

  return path.join(dir, `${name}-nobg.png`);
}

/**
 * Batch process multiple images
 */
export async function batchRemoveBackground(inputDir, outputDir, options = {}) {
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(f =>
    [".png", ".jpg", ".jpeg", ".webp"].includes(path.extname(f).toLowerCase())
  );

  console.log(chalk.cyan(`\n📁 Processing ${imageFiles.length} images...\n`));

  const results = [];

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(
      outputDir || inputDir,
      `${path.basename(file, path.extname(file))}-nobg.png`
    );

    try {
      const result = await removeBackground({
        input: inputPath,
        output: outputPath,
        ...options
      });
      results.push(result);
    } catch (error) {
      console.error(chalk.red(`  Failed: ${file} - ${error.message}`));
      results.push({ success: false, file, error: error.message });
    }
  }

  const successful = results.filter(r => r.success).length;
  console.log(chalk.green(`\n✅ Processed ${successful}/${imageFiles.length} images`));

  return results;
}

/**
 * Auto-detect background color
 */
export async function detectBackgroundColor(imagePath) {
  const image = sharp(imagePath);
  const { data, info } = await image
    .resize(10, 10, { fit: "fill" }) // Sample corners
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample corner pixels
  const corners = [
    { x: 0, y: 0 },
    { x: 9, y: 0 },
    { x: 0, y: 9 },
    { x: 9, y: 9 }
  ];

  let rSum = 0, gSum = 0, bSum = 0;

  for (const corner of corners) {
    const idx = (corner.y * 10 + corner.x) * info.channels;
    rSum += data[idx];
    gSum += data[idx + 1];
    bSum += data[idx + 2];
  }

  const r = Math.round(rSum / 4);
  const g = Math.round(gSum / 4);
  const b = Math.round(bSum / 4);

  const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase();

  return { r, g, b, hex };
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("remove-background")
  .description("Remove backgrounds from images")
  .version("1.0.0");

program
  .option("-i, --input <path>", "Input image path (required)")
  .option("-o, --output <path>", "Output image path")
  .option("-b, --background <color>", "Background color to remove", "#FFFFFF")
  .option("-t, --threshold <number>", "Color matching threshold (0-255)", "30")
  .option("-f, --feather <number>", "Edge feather amount", "2")
  .option("--batch <directory>", "Process all images in directory")
  .option("--auto-detect", "Auto-detect background color")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("\n🎨 Background Removal Tool\n"));
      console.log(chalk.gray("━".repeat(50)));

      if (options.batch) {
        // Batch processing
        console.log(chalk.white(`Directory: ${options.batch}`));
        console.log(chalk.gray("━".repeat(50) + "\n"));

        await batchRemoveBackground(options.batch, options.output, {
          backgroundColor: options.background,
          threshold: parseInt(options.threshold),
          feather: parseInt(options.feather)
        });

      } else if (options.input) {
        // Single image processing
        let bgColor = options.background;

        if (options.autoDetect) {
          console.log(chalk.blue("Auto-detecting background color..."));
          const detected = await detectBackgroundColor(options.input);
          bgColor = detected.hex;
          console.log(chalk.gray(`  Detected: ${bgColor}`));
        }

        console.log(chalk.white(`Input:      ${options.input}`));
        console.log(chalk.white(`Background: ${bgColor}`));
        console.log(chalk.white(`Threshold:  ${options.threshold}`));
        console.log(chalk.gray("━".repeat(50) + "\n"));

        const result = await removeBackground({
          input: options.input,
          output: options.output,
          backgroundColor: bgColor,
          threshold: parseInt(options.threshold),
          feather: parseInt(options.feather)
        });

        if (result.success) {
          console.log(chalk.green("\n✅ Background removed successfully!"));
          console.log(chalk.gray(`   Output: ${result.outputPath}`));
          console.log(chalk.gray(`   Size: ${(result.newSize / 1024).toFixed(2)} KB`));
        }

      } else {
        console.error(chalk.red("Error: --input or --batch is required"));
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

export default removeBackground;
