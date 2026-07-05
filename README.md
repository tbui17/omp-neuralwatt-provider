# @tbui17/omp-neuralwatt-provider

Neuralwatt OpenAI-compatible provider plugin for [oh-my-pi](https://github.com/can1357/oh-my-pi).

[![](https://img.shields.io/npm/v/@tbui17/omp-neuralwatt-provider.svg)](https://www.npmjs.com/package/@tbui17/omp-neuralwatt-provider)

## About Neuralwatt

[Neuralwatt](https://www.neuralwatt.com) is an energy-optimized AI inference cloud. Its API is OpenAI-compatible and accessible at `https://api.neuralwatt.com/v1`, hosting frontier models from GLM (ZhipuAI), Kimi (MoonshotAI), and Qwen.

Neuralwatt's main differentiator is **energy-based pricing**: instead of per-token markups, you pay a flat **$5.00/kWh** for actual GPU compute consumed. One rate applies to every model, so efficient mixture-of-experts models (e.g. Kimi K2.6, Qwen3.5) cost up to 95% less than traditional per-token pricing. Per-token billing is also available if you prefer the familiar model. See the [pricing page](https://portal.neuralwatt.com/pricing) for details.

- **Company / technology:** [neuralwatt.com](https://www.neuralwatt.com) · [How optimization works](https://www.neuralwatt.com/technology)
- **Cloud portal:** [portal.neuralwatt.com](https://portal.neuralwatt.com) — dashboard, API keys, playground
- **Quickstart (raw API):** [portal.neuralwatt.com/docs/quickstart](https://portal.neuralwatt.com/docs/quickstart)

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) `>= 1.3.0`
- [`omp`](https://github.com/can1357/oh-my-pi) installed and on your `PATH`
- A Neuralwatt account and API key (starts with `sk-`)

### Get an API key

1. Sign up at [portal.neuralwatt.com](https://portal.neuralwatt.com).
2. Open **Dashboard → API Keys**.
3. Create a new key and copy it.

Keep your key secret — never commit it to version control.

### Install the provider

```
omp install @tbui17/omp-neuralwatt-provider
```

### Set your API key

The plugin reads the key from the `NEURALWATT_API_KEY` environment variable.

```sh
# Linux / macOS (current shell)
export NEURALWATT_API_KEY=sk-...

# Persist for future shells — add the line above to:
#   ~/.bashrc   (bash)
#   ~/.zshrc    (zsh)
```

```powershell
# Windows PowerShell (current session)
$env:NEURALWATT_API_KEY = "sk-..."

# Persist across sessions
[Environment]::SetEnvironmentVariable("NEURALWATT_API_KEY", "sk-...", "User")
```

### Smoke test

omp -p --model neuralwatt/glm-5.2 "Say hello."
```

If `omp` returns a response, the provider is wired up correctly.

## Models

16 canonical models are registered under the `neuralwatt` provider, spanning three families:

- **GLM-5.2** (ZhipuAI) — long-context reasoning, up to 1M token context window
- **Kimi K2.6 / K2.7** (MoonshotAI) — reasoning and vision, 256K context
- **Qwen3.5 / Qwen3.6** (Qwen) — reasoning and vision, up to 256K context

Naming conventions:

| Suffix | Meaning |
|---|---|
| `-fast` | Reasoning disabled — lower latency, lower cost |
| `-short` | 200K context window (vs 1M on full GLM-5.2) |
| `-flex` | Flex variant — power adjusts to grid demand |
| (none) | Standard variant, full reasoning |

Vision-capable models (accept `image` input in addition to text): `kimi-k2.6`, `kimi-k2.6-fast`, `kimi-k2.7-code`, `kimi-k2.6-flex`, `kimi-k2.7-code-flex`, `qwen3.6-35b`, `qwen3.6-35b-fast`.

For live per-model pricing, capabilities, and context windows, browse the catalog at [portal.neuralwatt.com/models](https://portal.neuralwatt.com/models). Energy-rate details live at [portal.neuralwatt.com/pricing](https://portal.neuralwatt.com/pricing).

## Usage

All examples use the `omp` CLI. Reference models as `neuralwatt/<model-id>`.

### Default reasoning

```sh
omp -p --model neuralwatt/glm-5.2 "Explain quicksort."
```

### Fast (no reasoning, lower latency)

```sh
omp -p --model neuralwatt/glm-5.2-fast "Summarize this thread."
```

### Long context (200K window)

```sh
omp -p --model neuralwatt/glm-5.2-short "Analyze this document."
```

### Vision-capable

```sh
# Kimi K2.6 accepts image input
omp -p --model neuralwatt/kimi-k2.6 "What's in this screenshot?"
```

### Reasoning effort

Reasoning models accept an effort level via `thinkingLevelMap`. Supported levels vary per model but generally include: `off`, `minimal`, `low`, `medium`, `high`, `xhigh`. Lower effort trades reasoning depth for speed and lower energy use. Refer to the model detail page on [portal.neuralwatt.com/models](https://portal.neuralwatt.com/models) for the levels each model honors.

## License

MIT
