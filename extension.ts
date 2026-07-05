/**
 * omp-neuralwatt-provider — Neuralwatt OpenAI-compatible provider for oh-my-pi.
 *
 * Neuralwatt exposes an OpenAI-compatible API at https://api.neuralwatt.com/v1
 * with GLM, Kimi, and Qwen models.
 */

import type { ExtensionAPI, ProviderConfig } from "@earendil-works/pi-coding-agent";
import { NEURALWATT_MODELS } from "./src/models";

export default function neuralwattExtension(pi: ExtensionAPI): void {
  const config: ProviderConfig = {
    baseUrl: "https://api.neuralwatt.com/v1",
    apiKey: "NEURALWATT_API_KEY",
    api: "openai-completions",
    authHeader: true,
    headers: {
      Referer: "https://pi.dev",
      "X-Title": "omp:@tbui17/omp-neuralwatt-provider",
    },
    models: NEURALWATT_MODELS,
  };

  pi.registerProvider("neuralwatt", config);
}
