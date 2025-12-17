#!/usr/bin/env node

/**
 * Analyze Page Script
 *
 * Analyzes a page description or project to determine
 * what image assets are needed
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";
import { Command } from "commander";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Asset types and their configurations
 */
const ASSET_TYPES = {
  hero: {
    name: "Hero Image",
    size: "1920x1080",
    description: "Main landing page visual"
  },
  icon: {
    name: "Icon",
    size: "256x256",
    description: "UI icons for features/services"
  },
  background: {
    name: "Background",
    size: "1920x1080",
    description: "Page background pattern or image"
  },
  product: {
    name: "Product Image",
    size: "1024x1024",
    description: "Product showcase images"
  },
  thumbnail: {
    name: "Thumbnail",
    size: "400x300",
    description: "Preview/card images"
  },
  avatar: {
    name: "Avatar",
    size: "512x512",
    description: "Profile or team member images"
  }
};

/**
 * Analyze a page description to determine needed assets
 *
 * @param {string} description - Page or project description
 * @returns {Promise<Object>} - Analysis results with asset recommendations
 */
export async function analyzePage(description) {
  const spinner = ora("Analyzing page requirements...").start();

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required. Set it in .env file.");
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze this website/page description and determine what image assets are needed.

Description: "${description}"

Return a JSON object with the following structure:
{
  "projectName": "short-name-for-project",
  "assets": [
    {
      "type": "hero|icon|background|product|thumbnail|avatar",
      "name": "asset-name",
      "prompt": "detailed prompt for generating this image",
      "removeBackground": true/false,
      "convertToSvg": true/false
    }
  ],
  "colorScheme": {
    "primary": "#hexcolor",
    "secondary": "#hexcolor",
    "accent": "#hexcolor"
  },
  "style": "overall style description"
}

Guidelines:
- For landing pages, include 1 hero, 3-5 icons, and 1 background
- Icons should have removeBackground: true
- First 3 icons should have convertToSvg: true
- Use specific, detailed prompts that will generate good images
- Match the color scheme to the industry/theme

Return ONLY the JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Parse JSON from response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      spinner.fail("Failed to parse analysis");
      return {
        success: false,
        error: `JSON parse error: ${parseError.message}`,
        rawResponse: response
      };
    }

    spinner.succeed("Analysis complete");

    // Add asset type configurations
    analysis.assets = analysis.assets.map(asset => ({
      ...asset,
      size: ASSET_TYPES[asset.type]?.size || "1024x1024",
      typeConfig: ASSET_TYPES[asset.type]
    }));

    return {
      success: true,
      analysis
    };

  } catch (error) {
    spinner.fail(`Analysis failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a batch config from analysis
 */
export function createBatchConfigFromAnalysis(analysis, outputDir) {
  return {
    settings: {
      outputDir: outputDir || `./generated-assets/${analysis.projectName}`,
      delayBetweenCalls: 1000,
      defaultStyle: analysis.style
    },
    assets: analysis.assets.map(asset => ({
      name: asset.name,
      prompt: asset.prompt,
      size: asset.size,
      removeBackground: asset.removeBackground || false,
      convertToSvg: asset.convertToSvg || false,
      svgColor: analysis.colorScheme?.primary || "#000000"
    }))
  };
}

/**
 * CLI Interface
 */
const program = new Command();

program
  .name("analyze-page")
  .description("Analyze page requirements for image assets")
  .version("1.0.0");

program
  .requiredOption("-d, --description <text>", "Page or project description")
  .option("-o, --output <path>", "Output path for analysis JSON")
  .option("--generate-config", "Generate batch config file")
  .action(async (options) => {
    console.log(chalk.cyan("\n🔍 Page Asset Analyzer\n"));
    console.log(chalk.gray("━".repeat(50)));
    console.log(chalk.white(`Description: ${options.description}`));
    console.log(chalk.gray("━".repeat(50) + "\n"));

    const result = await analyzePage(options.description);

    if (result.success) {
      console.log(chalk.green("\n✅ Analysis complete!\n"));

      // Display results
      console.log(chalk.cyan("Project: ") + result.analysis.projectName);
      console.log(chalk.cyan("Style: ") + result.analysis.style);
      console.log(chalk.cyan("\nAssets needed:"));

      result.analysis.assets.forEach((asset, i) => {
        console.log(chalk.white(`  ${i + 1}. ${asset.name} (${asset.type})`));
        console.log(chalk.gray(`     Size: ${asset.size}`));
        console.log(chalk.gray(`     BG Removal: ${asset.removeBackground}`));
        console.log(chalk.gray(`     To SVG: ${asset.convertToSvg}`));
      });

      // Save output if requested
      if (options.output) {
        await fs.writeJson(options.output, result.analysis, { spaces: 2 });
        console.log(chalk.gray(`\nSaved to: ${options.output}`));
      }

      // Generate batch config if requested
      if (options.generateConfig) {
        const config = createBatchConfigFromAnalysis(result.analysis);
        const configPath = options.output?.replace(".json", "-config.json")
          || `./batch-config-${result.analysis.projectName}.json`;
        await fs.writeJson(configPath, config, { spaces: 2 });
        console.log(chalk.gray(`Batch config saved to: ${configPath}`));
      }

    } else {
      console.log(chalk.red(`\n❌ Analysis failed: ${result.error}`));
      process.exit(1);
    }
  });

// Run CLI if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  program.parse();
}

export default analyzePage;
