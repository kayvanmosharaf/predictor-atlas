export interface ModelConfig {
  id: string;
  inputUsdPerMtok: number;
  outputUsdPerMtok: number;
}

const MODELS: Record<string, ModelConfig> = {
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    inputUsdPerMtok: 3.0,
    outputUsdPerMtok: 15.0,
  },
  "claude-haiku-4-5-20251001": {
    id: "claude-haiku-4-5-20251001",
    inputUsdPerMtok: 1.0,
    outputUsdPerMtok: 5.0,
  },
};

const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

export function getModelConfig(): ModelConfig {
  const id = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL_ID;
  const config = MODELS[id];
  if (!config) {
    const supported = Object.keys(MODELS).join(", ");
    throw new Error(
      `Unknown ANTHROPIC_MODEL "${id}". Supported: ${supported}`
    );
  }
  return config;
}

export function computeCostUsd(
  inputTokens: number,
  outputTokens: number,
  config: ModelConfig = getModelConfig()
): number {
  return (
    (inputTokens * config.inputUsdPerMtok +
      outputTokens * config.outputUsdPerMtok) /
    1_000_000
  );
}
