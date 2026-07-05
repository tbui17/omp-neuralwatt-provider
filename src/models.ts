/**
 * Neuralwatt model registry.
 *
 * Every model shares the same OpenAI-compat shape; per-model uniqueness is
 * small (cost tier, context window, family thinking map, reasoning on/off,
 * input modality). The helpers below capture each recurring shape once so
 * the array reads as "what's actually different per model".
 */

import type { ProviderModelConfig } from "@earendil-works/pi-coding-agent";

// --- Shared constants -------------------------------------------------------

/** Cap applied to every Neuralwatt model. */
const MAX_TOKENS = 65536;

/** Base OpenAI-compat flags — every Neuralwatt model uses these. */
const COMPAT = {
  supportsDeveloperRole: false,
  maxTokensField: "max_tokens" as const,
};

/** Compat for reasoning models — adds the assistant reasoning-content flag. */
const REASONING_COMPAT = {
  ...COMPAT,
  requiresReasoningContentOnAssistantMessages: true,
};

// --- Thinking maps ----------------------------------------------------------

/** GLM family: maps host effort levels onto Neuralwatt's none/high/max. */
const THINKING_GLM = {
  off: "none",
  minimal: null,
  low: null,
  medium: null,
  high: "high",
  xhigh: "max",
};

/** Kimi / Qwen family: medium is the only explicit level; others pass through. */
const THINKING_KIMI = {
  minimal: null,
  low: null,
  medium: "medium",
  high: null,
  xhigh: null,
};

/** Kimi K2.7 Code also accepts an explicit off (kept as null). */
const THINKING_KIMI_WITH_OFF = {
  off: null,
  ...THINKING_KIMI,
};

// --- Cost tiers (per $/Mtok) ------------------------------------------------

const GLM_COST = { input: 1.45, output: 4.5, cacheRead: 0.3625, cacheWrite: 0 };
const KIMI_K2_6_COST = { input: 0.69, output: 3.22, cacheRead: 0.1725, cacheWrite: 0 };
const QWEN_3_5_COST = { input: 0.69, output: 4.14, cacheRead: 0.1725, cacheWrite: 0 };
const QWEN_3_6_COST = { input: 0.29, output: 1.15, cacheRead: 0.0725, cacheWrite: 0 };
const KIMI_K2_7_CODE_COST = { input: 0.95, output: 4.0, cacheRead: 0.2375, cacheWrite: 0 };

// --- Context windows --------------------------------------------------------

const CTX_GLM_FULL = 1048560;
const CTX_GLM_SHORT = 199984;
const CTX_KIMI_QWEN35 = 262128;
const CTX_QWEN36 = 131056;

// --- Model registry ---------------------------------------------------------

export const NEURALWATT_MODELS: ProviderModelConfig[] = [
  // GLM-5.2 — ZhipuAI
  {
    id: "glm-5.2",
    name: "GLM-5.2",
    reasoning: true,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_FULL,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_GLM,
    compat: REASONING_COMPAT,
  },
  {
    id: "glm-5.2-fast",
    name: "GLM-5.2 Fast",
    reasoning: false,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_FULL,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
  // GLM-5.2 Short — ZhipuAI (200K context, bounded reasoning budget)
  {
    id: "glm-5.2-short",
    name: "GLM-5.2 Short",
    reasoning: true,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_SHORT,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_GLM,
    compat: REASONING_COMPAT,
  },
  {
    id: "glm-5.2-short-fast",
    name: "GLM-5.2 Short Fast",
    reasoning: false,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_SHORT,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
  // Kimi K2.6 — MoonshotAI
  {
    id: "kimi-k2.6",
    name: "Kimi K2.6",
    reasoning: true,
    input: ["text", "image"],
    cost: KIMI_K2_6_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI,
    compat: REASONING_COMPAT,
  },
  {
    id: "kimi-k2.6-fast",
    name: "Kimi K2.6 Fast",
    reasoning: false,
    input: ["text", "image"],
    cost: KIMI_K2_6_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
  // Qwen3.5 397B — Qwen
  {
    id: "qwen3.5-397b",
    name: "Qwen3.5 397B",
    reasoning: true,
    input: ["text"],
    cost: QWEN_3_5_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI,
    compat: REASONING_COMPAT,
  },
  {
    id: "qwen3.5-397b-fast",
    name: "Qwen3.5 397B Fast",
    reasoning: false,
    input: ["text"],
    cost: QWEN_3_5_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
  // Qwen3.6 35B — Qwen
  {
    id: "qwen3.6-35b",
    name: "Qwen3.6 35B",
    reasoning: true,
    input: ["text", "image"],
    cost: QWEN_3_6_COST,
    contextWindow: CTX_QWEN36,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI,
    compat: REASONING_COMPAT,
  },
  // Kimi K2.7 Code — MoonshotAI
  {
    id: "kimi-k2.7-code",
    name: "Kimi K2.7 Code",
    reasoning: true,
    input: ["text", "image"],
    cost: KIMI_K2_7_CODE_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI_WITH_OFF,
    compat: REASONING_COMPAT,
  },
  // GLM-5.2 Short Flex — ZhipuAI (flex variant)
  {
    id: "glm-5.2-short-flex",
    name: "GLM-5.2 (short, flex)",
    reasoning: true,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_SHORT,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_GLM,
    compat: REASONING_COMPAT,
  },
  {
    id: "glm-5.2-short-fast-flex",
    name: "GLM-5.2 (short, fast, flex)",
    reasoning: false,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_SHORT,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
  // Kimi K2.6 Flex — MoonshotAI (flex variant)
  {
    id: "kimi-k2.6-flex",
    name: "Kimi K2.6 (flex)",
    reasoning: true,
    input: ["text", "image"],
    cost: KIMI_K2_6_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI,
    compat: REASONING_COMPAT,
  },
  // Kimi K2.7 Code Flex — MoonshotAI (flex variant)
  {
    id: "kimi-k2.7-code-flex",
    name: "Kimi K2.7 Code (flex)",
    reasoning: true,
    input: ["text", "image"],
    cost: KIMI_K2_7_CODE_COST,
    contextWindow: CTX_KIMI_QWEN35,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_KIMI_WITH_OFF,
    compat: REASONING_COMPAT,
  },
  // GLM-5.2 Flex — ZhipuAI (flex variant)
  {
    id: "glm-5.2-flex",
    name: "GLM-5.2 (flex)",
    reasoning: true,
    input: ["text"],
    cost: GLM_COST,
    contextWindow: CTX_GLM_FULL,
    maxTokens: MAX_TOKENS,
    thinkingLevelMap: THINKING_GLM,
    compat: REASONING_COMPAT,
  },
  // Qwen3.6 35B Fast — Qwen
  {
    id: "qwen3.6-35b-fast",
    name: "Qwen3.6 35B Fast",
    reasoning: false,
    input: ["text", "image"],
    cost: QWEN_3_6_COST,
    contextWindow: CTX_QWEN36,
    maxTokens: MAX_TOKENS,
    compat: COMPAT,
  },
];
