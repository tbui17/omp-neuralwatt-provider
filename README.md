# @tbui17/omp-neuralwatt-provider

Neuralwatt OpenAI-compatible provider plugin for [oh-my-pi](https://github.com/can1357/oh-my-pi).

Provides GLM, Kimi, and Qwen models hosted on the Neuralwatt API (`https://api.neuralwatt.com/v1`).

## Install

```
omp install @tbui17/omp-neuralwatt-provider
```

## Set your API key

```
export NEURALWATT_API_KEY=your-key-here
```

The plugin reads the key from the `NEURALWATT_API_KEY` environment variable. Set it before starting `omp`.

## Models

16 models are registered under the `neuralwatt` provider:

| Model ID | Family | Reasoning | Input |
|---|---|---|---|
| `glm-5.2` | GLM | yes | text |
| `glm-5.2-fast` | GLM | no | text |
| `glm-5.2-short` | GLM (200K ctx) | yes | text |
| `glm-5.2-short-fast` | GLM (200K ctx) | no | text |
| `kimi-k2.6` | Kimi | yes | text + image |
| `kimi-k2.6-fast` | Kimi | no | text + image |
| `qwen3.5-397b` | Qwen | yes | text |
| `qwen3.5-397b-fast` | Qwen | no | text |
| `qwen3.6-35b` | Qwen | yes | text + image |
| `kimi-k2.7-code` | Kimi | yes | text + image |
| `glm-5.2-short-fast-flex` | GLM flex | no | text |
| `glm-5.2-short-flex` | GLM flex | yes | text |
| `kimi-k2.6-flex` | Kimi flex | yes | text + image |
| `kimi-k2.7-code-flex` | Kimi flex | yes | text + image |
| `glm-5.2-flex` | GLM flex | yes | text |
| `qwen3.6-35b-fast` | Qwen | no | text + image |

Use with: `omp -p --model neuralwatt/glm-5.2 "your prompt"`

## License

MIT
