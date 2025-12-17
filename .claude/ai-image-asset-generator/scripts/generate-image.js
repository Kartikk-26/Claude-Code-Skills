#!/usr/bin/env node

/**
 * Generate Image Script
 *
 * Generates images using Google Gemini 2.0 Flash API
 * Supports custom prompts, styles, sizes, and output paths
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default configuration
const DEFAULT_CONFIG = {
  model: "gemini-2.0-flash-exp",
  outputDir: "./generated-assets",
  defaultSize: "1024x1024",
  defaultStyle: "modern, professional, high quality"
};

// API Key - must be set via environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Initialize Gemini client
 */
function initializeGemini(apiKey = GEMINI_API_KEY) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required. Set it in .env file.");
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate an image using Gemini API
 *
 * @param {Object} options - Generation options
 * @param {string} options.prompt - The image generation prompt
 * @param {string} options.style - Style modifiers
 * @param {string} options.size - Image size (WxH)
 * @param {string} options.output - Output file path
 * @param {string} options.negative - Negative prompt (what to avoid)
 * @param {string} options.quality - Quality level
 * @returns {Promise<Object>} - Generation result
 */
export async function generateImage(options) {
  const {
    prompt,
    style = DEFAULT_CONFIG.defaultStyle,
    size = DEFAULT_CONFIG.defaultSize,
    output,
    negative = "",
    quality = "high"
  } = options;

  const spinner = ora(`Generating image: "${prompt.substring(0, 50)}..."`).start();

  try {
    const genAI = initializeGemini();
    const model = genAI.getGenerativeModel({
      model: DEFAULT_CONFIG.model,
      generationConfig: {
        responseModalities: ["Text", "Image"]
      }
    });

    // Build the full prompt
    let fullPrompt = prompt;
    if (style) {
      fullPrompt += `, ${style}`;
    }
    if (negative) {
      fullPrompt += `. Avoid: ${negative}`;
    }
    fullPrompt += `. High quality, ${quality} detail.`;

    // Generate the image
    const response = await model.generateContent(fullPrompt);
    const result = response.response;

    // Extract image data from response
    let imageData = null;
    let textResponse = "";

    if (result.candidates && result.candidates[0]) {
      const parts = result.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith("image/")) {
          imageData = part.inlineData.data;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageData) {
      spinner.fail("No image generated");
      return {
        success: false,
        error: "No image data in response",
        description: textResponse
      };
    }

    // Determine output path
    const outputPath = output || path.join(
      DEFAULT_CONFIG.outputDir,
      `generated-${Date.now()}.png`
    );

    // Ensure output directory exists
    await fs.ensureDir(path.dirname(outputPath));

    // Save the image
    const imageBuffer = Buffer.from(imageData, "base64");
    await fs.writeFile(outputPath, imageBuffer);

    const stats = await fs.stat(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    spinner.succeed(`Image generated successfully: ${outputPath}`);

    console.log(chalk.gray(`  Saved to: ${outputPath}`));
    console.log(chalk.gray(`  Size: ${fileSizeKB} KB`));

    return {
      success: true,
      filePath: outputPath,
      size: stats.size,
      prompt: fullPrompt,
      description: textResponse
    };

  } catch (error) {
    spinner.fail(`Generation failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a prompt based on template and context
 */
export function generateImagePrompt(template, context) {
  let prompt = template;
  for (const [key, value] of Object.entries(context)) {
    prompt = prompt.replace(new RegExp(`{{${key}}}`, "g"), value);
  }
  return prompt;
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("generate-image")
  .description("Generate images using Google Gemini API")
  .version("1.0.0");

program
  .requiredOption("-p, --prompt <text>", "Image generation prompt")
  .option("-s, --style <style>", "Style modifiers", DEFAULT_CONFIG.defaultStyle)
  .option("--size <WxH>", "Image size", DEFAULT_CONFIG.defaultSize)
  .option("-o, --output <path>", "Output file path")
  .option("-n, --negative <text>", "What to avoid in the image")
  .option("-q, --quality <level>", "Quality: low, medium, high", "high")
  .action(async (options) => {
    console.log(chalk.cyan("\n🎨 AI Image Asset Generator\n"));
    console.log(chalk.gray("━".repeat(50)));
    console.log(chalk.white(`Prompt:   ${options.prompt}`));
    console.log(chalk.white(`Style:    ${options.style}`));
    console.log(chalk.white(`Size:     ${options.size}`));
    console.log(chalk.white(`Quality:  ${options.quality}`));
    console.log(chalk.gray("━".repeat(50) + "\n"));

    const result = await generateImage(options);

    if (result.success) {
      console.log(chalk.green("\n✅ Generation complete!"));
      console.log(chalk.gray(`   File: ${result.filePath}`));
    } else {
      console.log(chalk.red(`\n❌ Generation failed: ${result.error}`));
      process.exit(1);
    }
  });

// Run CLI if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  program.parse();
}

export default generateImage;
