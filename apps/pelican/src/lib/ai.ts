/**
 * ai.ts — Shared AI model provider.
 *
 * Routes all AI calls through OpenRouter so you can swap models (Gemini,
 * Claude, Llama, etc.) from one place without touching the rest of the code.
 *
 * To switch models: change OPENROUTER_MODEL in your .env
 * Default: google/gemini-flash-1.5  (fast, multimodal, cost-efficient)
 *
 * OpenRouter model IDs: https://openrouter.ai/models
 */

import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  apiKey:   process.env.OPENROUTER_API_KEY ?? '',
  baseURL:  'https://openrouter.ai/api/v1',
  headers: {
    // NEXT_PUBLIC_APP_URL is the value passed by docker-compose from APP_URL in .env
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'https://pellito.app',
    'X-Title':      'Pellito | Deckhand',
  },
});

/** The default model used across the app. Override via OPENROUTER_MODEL env var. */
const modelId = process.env.OPENROUTER_MODEL ?? 'google/gemini-flash-1.5';

export const aiModel = openrouter(modelId);
