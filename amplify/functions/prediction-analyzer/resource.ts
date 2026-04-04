import { defineFunction, secret } from "@aws-amplify/backend";

export const predictionAnalyzer = defineFunction({
  name: "prediction-analyzer",
  entry: "./handler.ts",
  timeoutSeconds: 300,
  memoryMB: 512,
  environment: {
    ANTHROPIC_API_KEY: secret("ANTHROPIC_API_KEY"),
  },
  schedule: "every 1h",
});
