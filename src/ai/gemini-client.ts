import { GoogleGenAI } from "@google/genai";

let genAiInstance: GoogleGenAI | null = null;

export function getGeminiApiKey(): string | null {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    null
  );
}

export function isAiAvailable(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  if (!genAiInstance) {
    genAiInstance = new GoogleGenAI({ apiKey });
  }

  return genAiInstance;
}
