# Gemini API Guide for Image Generation

## Overview

This guide covers using Google's Gemini API for AI image generation in the context of web asset creation.

## Setup

### 1. Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and save your key securely

### 2. Environment Setup

```bash
# Set environment variable
export GEMINI_API_KEY="your-api-key-here"

# Or create .env file
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

### 3. Install SDK

```bash
npm install @google/generative-ai
```

## Basic Usage

### Initialize Client

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

### Text Generation

```javascript
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const result = await model.generateContent("Write a prompt for...");
const text = result.response.text();
```

### Image Generation (Gemini 2.0)

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: ["Text", "Image"]
  }
});

const result = await model.generateContent("Generate an image of...");
const response = result.response;

// Extract image from response
for (const part of response.candidates[0].content.parts) {
  if (part.inlineData) {
    const imageData = part.inlineData;
    // imageData.data is base64 encoded
    // imageData.mimeType is the format
    const buffer = Buffer.from(imageData.data, "base64");
    fs.writeFileSync("output.png", buffer);
  }
}
```

## Models

### Available Models

| Model | Best For | Features |
|-------|----------|----------|
| `gemini-2.0-flash-exp` | Fast generation | Image + Text output |
| `gemini-1.5-pro` | Complex tasks | Large context window |
| `gemini-1.5-flash` | Quick responses | Cost effective |

### Model Selection

```javascript
// For image generation
const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: ["Image"]
  }
});

// For text/analysis
const textModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp"
});
```

## Generation Config

### Parameters

```javascript
const generationConfig = {
  temperature: 0.7,      // Creativity (0-2)
  topK: 40,              // Token sampling
  topP: 0.95,            // Nucleus sampling
  maxOutputTokens: 8192, // Response length
  responseMimeType: "text/plain"
};

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig
});
```

### Temperature Guide

| Value | Behavior | Use Case |
|-------|----------|----------|
| 0.0 | Deterministic | Consistent outputs |
| 0.5 | Balanced | General use |
| 0.7 | Creative | Image generation |
| 1.0+ | Very creative | Experimental |

## Safety Settings

```javascript
const safetySettings = [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_HATE_SPEECH",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  {
    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  }
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  safetySettings
});
```

### Threshold Levels

- `BLOCK_NONE` - No blocking
- `BLOCK_LOW_AND_ABOVE` - Block low+ probability
- `BLOCK_MEDIUM_AND_ABOVE` - Block medium+ probability (recommended)
- `BLOCK_HIGH_AND_ABOVE` - Only block high probability

## Rate Limits & Quotas

### Free Tier Limits

| Metric | Limit |
|--------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Tokens per minute | 1,000,000 |

### Handling Rate Limits

```javascript
async function generateWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.message.includes("429") || error.message.includes("quota")) {
        console.log(`Rate limited, waiting ${(i + 1) * 5}s...`);
        await sleep((i + 1) * 5000);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}
```

## Best Practices

### 1. Prompt Engineering

```javascript
// Good prompt structure
const prompt = `
Generate an image of: ${subject}
Style: ${style}
Technical requirements: ${specs}
Avoid: ${negativePrompts}
`.trim();
```

### 2. Error Handling

```javascript
try {
  const result = await model.generateContent(prompt);

  if (!result.response) {
    throw new Error("No response received");
  }

  const candidates = result.response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("No candidates in response");
  }

  // Process response

} catch (error) {
  if (error.message.includes("SAFETY")) {
    console.error("Content blocked by safety filters");
  } else if (error.message.includes("API_KEY")) {
    console.error("Invalid API key");
  } else if (error.message.includes("quota")) {
    console.error("Quota exceeded");
  } else {
    console.error("Generation failed:", error.message);
  }
}
```

### 3. Batch Processing

```javascript
async function batchGenerate(prompts, delayMs = 2000) {
  const results = [];

  for (const prompt of prompts) {
    const result = await model.generateContent(prompt);
    results.push(result);

    // Delay between requests
    await new Promise(r => setTimeout(r, delayMs));
  }

  return results;
}
```

### 4. Caching Responses

```javascript
const cache = new Map();

async function generateCached(prompt) {
  const cacheKey = prompt.trim().toLowerCase();

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await model.generateContent(prompt);
  cache.set(cacheKey, result);

  return result;
}
```

## Common Issues

### Issue: Empty Response

```javascript
// Check for empty response
if (!response.candidates?.[0]?.content?.parts?.length) {
  console.error("Empty response - try different prompt");
}
```

### Issue: Image Not Generated

```javascript
// Verify image generation is enabled
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    responseModalities: ["Text", "Image"] // Must include "Image"
  }
});
```

### Issue: Safety Block

```javascript
// Check finish reason
const finishReason = response.candidates[0].finishReason;
if (finishReason === "SAFETY") {
  console.error("Blocked by safety filters - modify prompt");
}
```

## Resources

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [API Reference](https://ai.google.dev/api/rest)
- [Pricing](https://ai.google.dev/pricing)

## Version History

| Version | Changes |
|---------|---------|
| 1.0.0 | Initial guide |

---

**Last Updated**: December 2024
