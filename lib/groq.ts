import Groq from "groq-sdk";

let _groq: InstanceType<typeof Groq> | null = null;

/** Lazy client so build (no env) does not throw. Use at runtime only. */
export function getGroq(): InstanceType<typeof Groq> {
  if (_groq) return _groq;
  const key = process.env.GROQ_API_KEY;
  if (!key?.trim()) {
    throw new Error(
      "GROQ_API_KEY is missing or empty; set it in the environment or pass apiKey to the Groq client."
    );
  }
  _groq = new Groq({ apiKey: key });
  return _groq;
}


// Model options (as of 2024):
// - llama-3.3-70b-versatile  (best quality, still fast)
// - llama-3.1-8b-instant     (fastest, good for simple tasks)
// - mixtral-8x7b-32768      (good balance, 32k context)
export const GROQ_MODEL = "llama-3.3-70b-versatile";
export const GROQ_MODEL_FAST = "llama-3.1-8b-instant";
