import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const modelName = process.env.AI_MODEL || "nvidia/nemotron-3-nano-30b-a3b:free";

export function getModel() {
  return openrouter(modelName);
}

export function getClassifierModel() {
  return openrouter(modelName);
}
