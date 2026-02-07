/**
 * Single LLM abstraction: prefers Google AI Studio (Gemini) when configured,
 * then Groq, then OpenAI. All call sites use this so you can switch
 * providers via env vars without code changes.
 */

import { getGroq, GROQ_MODEL } from "./groq";
import { getGemini, hasGeminiKey, GEMINI_MODEL } from "./gemini";

export interface LLMCompleteOptions {
  /** System / instruction prompt (role: system). */
  systemPrompt?: string;
  /** User message content. */
  userPrompt: string;
  /** If true, request JSON output (response_format / responseMimeType). */
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Run a single completion. Uses Gemini if GOOGLE_AI_API_KEY or GEMINI_API_KEY
 * is set, otherwise Groq (GROQ_API_KEY required).
 */
export async function llmComplete(options: LLMCompleteOptions): Promise<string> {
  const {
    systemPrompt,
    userPrompt,
    jsonMode = false,
    temperature = 0.3,
    maxTokens = 1000,
  } = options;

  if (hasGeminiKey()) {
    return completeWithGemini({
      systemPrompt,
      userPrompt,
      jsonMode,
      temperature,
      maxTokens,
    });
  }
  return completeWithGroq({
    systemPrompt,
    userPrompt,
    jsonMode,
    temperature,
    maxTokens,
  });
}

async function completeWithGemini(options: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode: boolean;
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, jsonMode, temperature, maxTokens } = options;
  const ai = getGemini();
  const config: {
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
  } = {
    temperature,
    maxOutputTokens: maxTokens,
  };
  if (systemPrompt) config.systemInstruction = systemPrompt;
  if (jsonMode) config.responseMimeType = "application/json";

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config,
  });

  const text = response.text;
  if (text == null || text === "") throw new Error("No response from Gemini");
  return text;
}

async function completeWithGroq(options: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode: boolean;
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, jsonMode, temperature, maxTokens } = options;
  const groq = getGroq();
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  const params: Parameters<typeof groq.chat.completions.create>[0] = {
    model: GROQ_MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) params.response_format = { type: "json_object" };

  const response = await groq.chat.completions.create(params);
  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from Groq");
  return content;
}

async function completeWithOpenAI(options: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode: boolean;
  temperature: number;
  maxTokens: number;
}): Promise<string> {
  const { systemPrompt, userPrompt, jsonMode, temperature, maxTokens } = options;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey });
  const messages: { role: "system" | "user"; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });

  const params: Parameters<typeof openai.chat.completions.create>[0] = {
    model: "gpt-4o-mini",
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) params.response_format = { type: "json_object" };

  const completion = await openai.chat.completions.create(params);
  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");
  return content;
}

/**
 * Returns true if any LLM provider is configured (Gemini, Groq, or OpenAI).
 */
export function hasAnyLLMKey(): boolean {
  return (
    hasGeminiKey() ||
    !!process.env.GROQ_API_KEY?.trim() ||
    !!process.env.OPENAI_API_KEY?.trim()
  );
}
