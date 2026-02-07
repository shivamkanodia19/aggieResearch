import { GoogleGenAI } from "@google/genai";

let _gemini: GoogleGenAI | null = null;

/** Lazy client so build (no env) does not throw. Use at runtime only. */
export function getGemini(): GoogleGenAI {
  if (_gemini) return _gemini;
  const key =
    process.env.GOOGLE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GOOGLE_AI_API_KEY or GEMINI_API_KEY is missing; set one in the environment (e.g. from Google AI Studio)."
    );
  }
  _gemini = new GoogleGenAI({ apiKey: key });
  return _gemini;
}

/** Whether Gemini is configured (so callers can prefer it over Groq). */
export function hasGeminiKey(): boolean {
  return !!(
    process.env.GOOGLE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim()
  );
}

// Free tier–friendly; good quality for extraction/summarization
export const GEMINI_MODEL = "gemini-2.0-flash";
export const GEMINI_MODEL_FAST = "gemini-2.0-flash";
