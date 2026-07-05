/**
 * Neuralwatt model registry.
 *
 * Every model shares the same OpenAI-compat shape; per-model uniqueness is
 * small (cost tier, context window, family thinking config, reasoning on/off,
 * input modality). The helpers below capture each recurring shape once so
 * the array reads as "what's actually different per model".
 */

import type { ProviderModelConfig } from "@oh-my-pi/pi-coding-agent";
import type { Effort } from "@oh-my-pi/pi-catalog/effort";

// --- Shared constants -------------------------------------------------------

/** Cap applied to every Neuralwatt model. */
const MAX_TOKENS = 65536;

/** Base OpenAI-compat flags — every Neuralwatt model uses these. */
const COMPAT = {
  supportsDeveloperRole: false,
  maxTokensField: "max_tokens" as const,
};

/**
 * Compat for reasoning models — Neuralwatt surfaces reasoning content under
 * the assistant field named `reasoning` (verified by live API probes across
 * the GLM, Kimi, and Qwen families; the canonical Z.AI-flavored
 * `reasoning_content` is NOT used here). Tool-call turns must round-trip the
 * reasoning field so multi-step agentic requests keep their chain-of-thought
 * slot intact (avoids a 400 from providers that validate its presence).
 */
const REASONING_COMPAT = {
  ...COMPAT,
  reasoningContentField: "reasoning" as const,
  requiresReasoningContentForToolCalls: true,
};

// --- Thinking configs -------------------------------------------------------
// v16 `thinking` shape: `mode: "effort"` advertises a ladder of user-facing
// effort levels (least → most intensive). `effortMap` remaps a pi effort
// onto a provider-specific wire value for `reasoning_effort`; efforts
// missing from the map pass through as their own name. Reasoning-off is
// handled by the runtime via `compat.reasoningDisableMode` (derived from
// `thinkingFormat`, which we leave at the OpenAI default for Neuralwatt's
// OpenAI-compat API).
//
// (`Effort` is a `declare const enum` in @oh-my-pi/pi-catalog — it is a
// type-only import: runtime value-side access (inlining the enum members)
// fails under Bun's `node_modules` type-stripping, so the values are string
// literals cast to `readonly Effort[]` at the type level.)
/**
 * GLM family: Neuralwatt's GLM-5.2 deployment honors the full OpenAI
 * `reasoning_effort` ladder (`minimal` … `xhigh`), identity-mapped — every
 * advertised effort is sent as its own name. Live probes also confirmed that
 * `reasoning_effort: "none"` is accepted as a true thinking-off, but v16 has
 * no native disable mode for that wire value, so disable falls back to the
 * OpenAI-compat default (`lowest-effort`, sending `reasoning_effort:
 * "minimal"`).
 */
const THINKING_GLM = {
  mode: "effort" as const,
  efforts: ["minimal", "low", "medium", "high", "xhigh"] as const as readonly Effort[],
};

/**
 * Kimi / Qwen3.5 family: Neuralwatt's Kimi K2.6, Kimi K2.7 Code, and Qwen3.5
 * deployments all honor the full OpenAI `reasoning_effort` ladder
 * (`minimal` … `xhigh`), identity-mapped — every advertised effort is sent as
 * its own name. (The canonical Moonshot catalog spec drops `xhigh` because
 * the upstream K2.x caps at `high`; Neuralwatt accepts `xhigh` directly, so
 * we advertise it.)
 */
const THINKING_KIMI = {
  mode: "effort" as const,
  efforts: ["minimal", "low", "medium", "high", "xhigh"] as const as readonly Effort[],
};

/**
 * Qwen3.6 35B: Neuralwatt's deployment is backed by vLLM with a strict enum
 * that accepts only `low`, `medium`, and `high` (`minimal` and `xhigh` return
 * HTTP 400). We advertise exactly that restricted ladder, identity-mapped —
 * selecting `:minimal` or `:xhigh` for this model will fail at the runtime's
 * effort-selection step before any wire call is made.
 */
const THINKING_QWEN36 = {
  mode: "effort" as const,
  efforts: ["low", "medium", "high"] as const as readonly Effort[],
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
    thinking: THINKING_GLM,
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
    thinking: THINKING_GLM,
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
    thinking: THINKING_KIMI,
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
    thinking: THINKING_KIMI,
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
    thinking: THINKING_QWEN36,
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
    thinking: THINKING_KIMI,
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
    thinking: THINKING_GLM,
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
    thinking: THINKING_KIMI,
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
    thinking: THINKING_KIMI,
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
    thinking: THINKING_GLM,
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
