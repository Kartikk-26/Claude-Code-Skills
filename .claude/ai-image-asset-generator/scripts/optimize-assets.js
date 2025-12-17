#!/usr/bin/env node

/**
 * Optimize Assets Script
 *
 * Compress, resize, and convert images for optimal web performance
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
 * Optimization presets
 */
const PRESETS = {
  web: {
    quality: 80,
    formats: ["webp", "png"],
    maxWidth: 1920,
    progressive: true
  },
  thumbnail: {
    quality: 70,
    formats: ["webp"],
    maxWidth: 400,
    progressive: true
  },
  icon: {
    quality: 90,
    formats: ["png", "webp"],
    maxWidth: 256,
    progressive: false
  },
  hero: {
    quality: 85,
    formats: ["webp", "jpg"],
    maxWidth: 1920,
    progressive: true
  },
  retina: {
    quality: 80,
    formats: ["webp", "png"],
    sizes: [1, 2, 3], // 1x, 2x, 3x
    progressive: true
  }
};

/**
 * Optimize a single image
 *
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Optimization results
 */
export async function optimizeImage(options) {
  const {
    input,
    output,
    quality = 80,
    format = "webp",
    maxWidth,
    maxHeight,
    progressive = true,
    preserveAspectRatio = true
  } = options;

  const spinner = ora({
    text: chalk.blue(`Optimizing: ${path.basename(input)}`),
    spinner: "dots"
  }).start();

  try {
    // Validate input
    if (!await fs.pathExists(input)) {
      throw new Error(`Input file not found: ${input}`);
    }

    // Get original metadata
    const image = sharp(input);
    const metadata = await image.metadata();
    const originalSize = (await fs.stat(input)).size;

    // Determine output path
    const outputPath = output || generateOutputPath(input, format);
    await fs.ensureDir(path.dirname(outputPath));

    // Build sharp pipeline
    let pipeline = image;

    // Resize if needed
    if (maxWidth || maxHeight) {
      const resizeOptions = {
        withoutEnlargement: true
      };

      if (preserveAspectRatio) {
        resizeOptions.fit = "inside";
      }

      if (maxWidth) resizeOptions.width = maxWidth;
      if (maxHeight) resizeOptions.height = maxHeight;

      pipeline = pipeline.resize(resizeOptions);
    }

    // Apply format-specific optimizations
    switch (format.toLowerCase()) {
      case "webp":
        pipeline = pipeline.webp({
          quality,
          effort: 6 // Higher = better compression, slower
        });
        break;

      case "png":
        pipeline = pipeline.png({
          quality,
          compressionLevel: 9,
          progressive
        });
        break;

      case "jpg":
      case "jpeg":
        pipeline = pipeline.jpeg({
          quality,
          progressive,
          mozjpeg: true // Better compression
        });
        break;

      case "avif":
        pipeline = pipeline.avif({
          quality,
          effort: 6
        });
        break;

      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Write output
    await pipeline.toFile(outputPath);

    // Get new size
    const newSize = (await fs.stat(outputPath)).size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);

    spinner.succeed(chalk.green(`Optimized: ${path.basename(outputPath)} (${savings}% smaller)`));

    return {
      success: true,
      inputPath: input,
      outputPath: outputPath,
      originalSize,
      newSize,
      savings: parseFloat(savings),
      format,
      dimensions: {
        original: { width: metadata.width, height: metadata.height },
        optimized: await sharp(outputPath).metadata().then(m => ({ width: m.width, height: m.height }))
      }
    };

  } catch (error) {
    spinner.fail(chalk.red(`Failed: ${error.message}`));
    throw error;
  }
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveSizes(input, sizes, options = {}) {
  const results = [];
  const baseName = path.basename(input, path.extname(input));
  const outputDir = options.outputDir || path.dirname(input);

  console.log(chalk.cyan(`\n📐 Generating responsive sizes for: ${path.basename(input)}\n`));

  for (const width of sizes) {
    const outputPath = path.join(outputDir, `${baseName}-${width}w.${options.format || "webp"}`);

    try {
      const result = await optimizeImage({
        input,
        output: outputPath,
        maxWidth: width,
        quality: options.quality || 80,
        format: options.format || "webp"
      });
      results.push(result);
    } catch (error) {
      console.error(chalk.red(`  Failed for ${width}px: ${error.message}`));
      results.push({ success: false, width, error: error.message });
    }
  }

  // Generate srcset string
  const srcset = results
    .filter(r => r.success)
    .map(r => `${path.basename(r.outputPath)} ${r.dimensions.optimized.width}w`)
    .join(", ");

  console.log(chalk.gray(`\n📝 Suggested srcset:\n   ${srcset}`));

  return { results, srcset };
}

/**
 * Generate retina versions (1x, 2x, 3x)
 */
export async function generateRetinaVersions(input, baseWidth, options = {}) {
  const scales = options.scales || [1, 2, 3];
  const results = [];
  const baseName = path.basename(input, path.extname(input));
  const outputDir = options.outputDir || path.dirname(input);

  console.log(chalk.cyan(`\n📱 Generating retina versions for: ${path.basename(input)}\n`));

  for (const scale of scales) {
    const width = baseWidth * scale;
    const suffix = scale === 1 ? "" : `@${scale}x`;
    const outputPath = path.join(outputDir, `${baseName}${suffix}.${options.format || "webp"}`);

    try {
      const result = await optimizeImage({
        input,
        output: outputPath,
        maxWidth: width,
        quality: options.quality || 80,
        format: options.format || "webp"
      });
      results.push({ ...result, scale });
    } catch (error) {
      console.error(chalk.red(`  Failed for ${scale}x: ${error.message}`));
      results.push({ success: false, scale, error: error.message });
    }
  }

  return results;
}

/**
 * Batch optimize directory
 */
export async function batchOptimize(inputDir, outputDir, options = {}) {
  const preset = PRESETS[options.preset] || PRESETS.web;
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(f =>
    [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(path.extname(f).toLowerCase())
  );

  console.log(chalk.cyan(`\n📁 Batch optimizing ${imageFiles.length} images\n`));
  console.log(chalk.gray(`   Preset: ${options.preset || "web"}`));
  console.log(chalk.gray(`   Quality: ${preset.quality}`));
  console.log(chalk.gray(`   Formats: ${preset.formats.join(", ")}`));
  console.log(chalk.gray("━".repeat(50) + "\n"));

  const results = [];
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);

    for (const format of preset.formats) {
      const outputPath = path.join(
        outputDir || inputDir,
        `${path.basename(file, path.extname(file))}.${format}`
      );

      try {
        const result = await optimizeImage({
          input: inputPath,
          output: outputPath,
          quality: preset.quality,
          format: format,
          maxWidth: preset.maxWidth,
          progressive: preset.progressive
        });

        results.push(result);
        totalOriginal += result.originalSize;
        totalOptimized += result.newSize;

      } catch (error) {
        console.error(chalk.red(`  Failed: ${file} → ${format}`));
        results.push({ success: false, file, format, error: error.message });
      }
    }
  }

  // Summary
  const totalSavings = ((1 - totalOptimized / totalOriginal) * 100).toFixed(1);
  console.log(chalk.cyan("\n" + "━".repeat(50)));
  console.log(chalk.cyan("📊 Optimization Summary\n"));
  console.log(chalk.white(`   Original:  ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`));
  console.log(chalk.white(`   Optimized: ${(totalOptimized / 1024 / 1024).toFixed(2)} MB`));
  console.log(chalk.green(`   Savings:   ${totalSavings}%`));

  return results;
}

/**
 * Generate output path with new extension
 */
function generateOutputPath(inputPath, format) {
  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));
  return path.join(dir, `${name}-optimized.${format}`);
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("optimize-assets")
  .description("Optimize images for web performance")
  .version("1.0.0");

program
  .option("-i, --input <path>", "Input image or directory")
  .option("-o, --output <path>", "Output path or directory")
  .option("-f, --format <format>", "Output format (webp, png, jpg, avif)", "webp")
  .option("-q, --quality <number>", "Quality (1-100)", "80")
  .option("-w, --max-width <pixels>", "Maximum width")
  .option("-h, --max-height <pixels>", "Maximum height")
  .option("-p, --preset <name>", "Use preset (web, thumbnail, icon, hero, retina)")
  .option("--responsive <sizes>", "Generate responsive sizes (comma-separated widths)")
  .option("--retina <baseWidth>", "Generate retina versions at base width")
  .option("--batch", "Batch process directory")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("\n🗜️  Image Optimizer\n"));
      console.log(chalk.gray("━".repeat(50)));

      if (options.batch || (options.input && (await fs.stat(options.input)).isDirectory())) {
        // Batch processing
        await batchOptimize(options.input, options.output, {
          preset: options.preset,
          format: options.format,
          quality: parseInt(options.quality)
        });

      } else if (options.responsive && options.input) {
        // Generate responsive sizes
        const sizes = options.responsive.split(",").map(s => parseInt(s.trim()));
        await generateResponsiveSizes(options.input, sizes, {
          outputDir: options.output,
          format: options.format,
          quality: parseInt(options.quality)
        });

      } else if (options.retina && options.input) {
        // Generate retina versions
        await generateRetinaVersions(options.input, parseInt(options.retina), {
          outputDir: options.output,
          format: options.format,
          quality: parseInt(options.quality)
        });

      } else if (options.input) {
        // Single file
        console.log(chalk.white(`Input:   ${options.input}`));
        console.log(chalk.white(`Format:  ${options.format}`));
        console.log(chalk.white(`Quality: ${options.quality}`));
        console.log(chalk.gray("━".repeat(50) + "\n"));

        const result = await optimizeImage({
          input: options.input,
          output: options.output,
          format: options.format,
          quality: parseInt(options.quality),
          maxWidth: options.maxWidth ? parseInt(options.maxWidth) : undefined,
          maxHeight: options.maxHeight ? parseInt(options.maxHeight) : undefined
        });

        if (result.success) {
          console.log(chalk.green("\n✅ Optimization complete!"));
          console.log(chalk.gray(`   Output: ${result.outputPath}`));
          console.log(chalk.gray(`   Size: ${(result.newSize / 1024).toFixed(2)} KB`));
          console.log(chalk.gray(`   Savings: ${result.savings}%`));
        }

      } else {
        console.error(chalk.red("Error: --input is required"));
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

export default optimizeImage;
