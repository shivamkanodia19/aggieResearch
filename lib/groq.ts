import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;

// Model options (as of 2024):
// - llama-3.3-70b-versatile  (best quality, still fast)
// - llama-3.1-8b-instant     (fastest, good for simple tasks)
// - mixtral-8x7b-32768      (good balance, 32k context)
export const GROQ_MODEL = "llama-3.3-70b-versatile";
export const GROQ_MODEL_FAST = "llama-3.1-8b-instant";
