#!/usr/bin/env node

/**
 * PNG to SVG Conversion Script
 *
 * Converts raster PNG images to vector SVG format
 * Makes assets scalable and interactable
 */

import potrace from "potrace";
import sharp from "sharp";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify potrace functions
const trace = promisify(potrace.trace);
const posterize = promisify(potrace.posterize);

/**
 * Convert PNG to SVG
 *
 * @param {Object} options - Conversion options
 * @param {string} options.input - Input PNG path
 * @param {string} options.output - Output SVG path
 * @param {string} options.mode - Conversion mode (trace, posterize)
 * @param {Object} options.traceOptions - Potrace options
 * @returns {Promise<Object>} - Result with file path and metadata
 */
export async function convertToSvg(options) {
  const {
    input,
    output,
    mode = "trace",
    color = "#000000",
    background = "transparent",
    threshold = 128,
    turnPolicy = "minority",
    turdSize = 2,
    optCurve = true,
    optTolerance = 0.2,
    steps = 4, // For posterize mode
    fillStrategy = "dominant"
  } = options;

  const spinner = ora({
    text: chalk.blue(`Converting: ${path.basename(input)}`),
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

    spinner.text = chalk.blue("Preparing image...");

    // Pre-process image for better tracing
    const processedBuffer = await preprocessImage(input, threshold);

    spinner.text = chalk.blue(`Converting to SVG (${mode} mode)...`);

    // Configure potrace options
    const potraceOptions = {
      color: color,
      background: background,
      threshold: threshold,
      turnPolicy: potrace.Potrace[`TURNPOLICY_${turnPolicy.toUpperCase()}`] || potrace.Potrace.TURNPOLICY_MINORITY,
      turdSize: turdSize,
      optCurve: optCurve,
      optTolerance: optTolerance
    };

    let svgData;

    if (mode === "posterize") {
      // Posterize mode - good for multi-color images
      svgData = await posterize(processedBuffer, {
        ...potraceOptions,
        steps: steps,
        fillStrategy: potrace.Potrace[`FILL_${fillStrategy.toUpperCase()}`] || potrace.Potrace.FILL_DOMINANT
      });
    } else {
      // Trace mode - good for single color/icons
      svgData = await trace(processedBuffer, potraceOptions);
    }

    // Post-process SVG
    svgData = postProcessSvg(svgData, options);

    // Write SVG file
    await fs.writeFile(outputPath, svgData);

    const outputStats = await fs.stat(outputPath);
    const inputStats = await fs.stat(input);

    spinner.succeed(chalk.green(`Converted to SVG: ${path.basename(outputPath)}`));

    // Calculate dimensions from SVG
    const dimensions = extractSvgDimensions(svgData);

    return {
      success: true,
      inputPath: input,
      outputPath: outputPath,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      compressionRatio: ((1 - outputStats.size / inputStats.size) * 100).toFixed(1),
      dimensions: dimensions,
      metadata: {
        convertedAt: new Date().toISOString(),
        mode: mode,
        options: potraceOptions
      }
    };

  } catch (error) {
    spinner.fail(chalk.red(`Failed: ${error.message}`));
    throw error;
  }
}

/**
 * Preprocess image for better tracing results
 */
async function preprocessImage(inputPath, threshold) {
  // Convert to grayscale and enhance contrast for better tracing
  return await sharp(inputPath)
    .grayscale()
    .normalize()
    .threshold(threshold)
    .png()
    .toBuffer();
}

/**
 * Post-process SVG for better quality and compatibility
 */
function postProcessSvg(svgData, options) {
  // Add XML declaration if missing
  if (!svgData.startsWith("<?xml")) {
    svgData = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgData;
  }

  // Add viewBox if missing
  if (!svgData.includes("viewBox")) {
    const widthMatch = svgData.match(/width="(\d+)"/);
    const heightMatch = svgData.match(/height="(\d+)"/);
    if (widthMatch && heightMatch) {
      const width = widthMatch[1];
      const height = heightMatch[1];
      svgData = svgData.replace(
        /<svg/,
        `<svg viewBox="0 0 ${width} ${height}"`
      );
    }
  }

  // Add class for styling if specified
  if (options.className) {
    svgData = svgData.replace(/<svg/, `<svg class="${options.className}"`);
  }

  // Add ID if specified
  if (options.id) {
    svgData = svgData.replace(/<svg/, `<svg id="${options.id}"`);
  }

  return svgData;
}

/**
 * Extract dimensions from SVG
 */
function extractSvgDimensions(svgData) {
  const widthMatch = svgData.match(/width="(\d+)"/);
  const heightMatch = svgData.match(/height="(\d+)"/);
  const viewBoxMatch = svgData.match(/viewBox="([^"]+)"/);

  return {
    width: widthMatch ? parseInt(widthMatch[1]) : null,
    height: heightMatch ? parseInt(heightMatch[1]) : null,
    viewBox: viewBoxMatch ? viewBoxMatch[1] : null
  };
}

/**
 * Generate output path from input
 */
function generateOutputPath(inputPath) {
  const dir = path.dirname(inputPath);
  const name = path.basename(inputPath, path.extname(inputPath));

  return path.join(dir, `${name}.svg`);
}

/**
 * Convert color PNG to multi-color SVG
 * Uses posterize with multiple steps for color preservation
 */
export async function convertColorToSvg(input, output, options = {}) {
  return await convertToSvg({
    input,
    output,
    mode: "posterize",
    steps: options.colors || 4,
    fillStrategy: "dominant",
    ...options
  });
}

/**
 * Convert to optimized icon SVG
 * Best for single-color icons
 */
export async function convertIconToSvg(input, output, options = {}) {
  return await convertToSvg({
    input,
    output,
    mode: "trace",
    color: options.color || "#000000",
    threshold: options.threshold || 128,
    turdSize: 0, // Keep small details
    optCurve: true,
    optTolerance: 0.1, // Higher precision
    ...options
  });
}

/**
 * Batch convert multiple images
 */
export async function batchConvertToSvg(inputDir, outputDir, options = {}) {
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter(f =>
    [".png", ".jpg", ".jpeg"].includes(path.extname(f).toLowerCase())
  );

  console.log(chalk.cyan(`\n📁 Converting ${imageFiles.length} images to SVG...\n`));

  const results = [];

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(
      outputDir || inputDir,
      `${path.basename(file, path.extname(file))}.svg`
    );

    try {
      const result = await convertToSvg({
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
  console.log(chalk.green(`\n✅ Converted ${successful}/${imageFiles.length} images`));

  return results;
}

/**
 * Create animated SVG from multiple frames
 */
export async function createAnimatedSvg(frames, output, options = {}) {
  const {
    duration = 1000,
    loop = true
  } = options;

  // Convert all frames to SVG paths
  const svgPaths = [];
  for (const frame of frames) {
    const svgData = await trace(frame.buffer || await fs.readFile(frame.path), {
      color: frame.color || "#000000"
    });
    // Extract just the path data
    const pathMatch = svgData.match(/<path[^>]*d="([^"]+)"[^>]*>/);
    if (pathMatch) {
      svgPaths.push(pathMatch[1]);
    }
  }

  // Create animated SVG
  const frameTime = duration / frames.length;
  const keyTimes = frames.map((_, i) => (i / frames.length).toFixed(2)).join(";");
  const values = svgPaths.join(";");

  const animatedSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill="currentColor">
    <animate
      attributeName="d"
      dur="${duration}ms"
      repeatCount="${loop ? 'indefinite' : '1'}"
      keyTimes="${keyTimes}"
      values="${values}"
    />
  </path>
</svg>`;

  await fs.writeFile(output, animatedSvg);

  return { success: true, outputPath: output };
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("png-to-svg")
  .description("Convert PNG images to SVG vector format")
  .version("1.0.0");

program
  .option("-i, --input <path>", "Input PNG path (required)")
  .option("-o, --output <path>", "Output SVG path")
  .option("-m, --mode <mode>", "Conversion mode (trace, posterize)", "trace")
  .option("-c, --color <color>", "SVG color (for trace mode)", "#000000")
  .option("-b, --background <color>", "Background color", "transparent")
  .option("-t, --threshold <number>", "Threshold for tracing (0-255)", "128")
  .option("--steps <number>", "Color steps for posterize mode", "4")
  .option("--batch <directory>", "Convert all images in directory")
  .option("--icon", "Optimize for icons (higher precision)")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("\n🔄 PNG to SVG Converter\n"));
      console.log(chalk.gray("━".repeat(50)));

      if (options.batch) {
        // Batch processing
        console.log(chalk.white(`Directory: ${options.batch}`));
        console.log(chalk.white(`Mode:      ${options.mode}`));
        console.log(chalk.gray("━".repeat(50) + "\n"));

        await batchConvertToSvg(options.batch, options.output, {
          mode: options.mode,
          color: options.color,
          threshold: parseInt(options.threshold),
          steps: parseInt(options.steps)
        });

      } else if (options.input) {
        // Single file processing
        console.log(chalk.white(`Input:     ${options.input}`));
        console.log(chalk.white(`Mode:      ${options.mode}`));
        console.log(chalk.white(`Color:     ${options.color}`));
        console.log(chalk.white(`Threshold: ${options.threshold}`));
        console.log(chalk.gray("━".repeat(50) + "\n"));

        let result;

        if (options.icon) {
          result = await convertIconToSvg(options.input, options.output, {
            color: options.color,
            threshold: parseInt(options.threshold)
          });
        } else {
          result = await convertToSvg({
            input: options.input,
            output: options.output,
            mode: options.mode,
            color: options.color,
            background: options.background,
            threshold: parseInt(options.threshold),
            steps: parseInt(options.steps)
          });
        }

        if (result.success) {
          console.log(chalk.green("\n✅ Conversion complete!"));
          console.log(chalk.gray(`   Output: ${result.outputPath}`));
          console.log(chalk.gray(`   Size: ${(result.outputSize / 1024).toFixed(2)} KB`));
          console.log(chalk.gray(`   Compression: ${result.compressionRatio}%`));
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

export default convertToSvg;
