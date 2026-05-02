import Anthropic from "@anthropic-ai/sdk";
import type { Playbook } from "../playbooks/types";
import type { EvidenceItem } from "./research";
import { computeCostUsd, getModelConfig } from "../model";

export interface ModelingAgentResult {
  proposedByLabel: Record<string, number>;
  reasoning: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface ModelingPredictionContext {
  title: string;
  description: string;
  category: string;
  outcomes: { id: string; label: string; probability: number }[];
}

export async function runModelingAgent(
  prediction: ModelingPredictionContext,
  evidence: EvidenceItem[],
  playbook: Playbook,
  client: Anthropic = defaultClient()
): Promise<ModelingAgentResult> {
  const evidenceBlock = evidence
    .map(
      (e) =>
        `- Source: ${e.source_name} (weight ${e.weight})\n  Content: ${e.content}\n  Key signals: ${e.key_signals.join("; ") || "(none)"}`
    )
    .join("\n");

  const outcomesBlock = prediction.outcomes
    .map((o) => `- "${o.label}" — prior ${o.probability}%`)
    .join("\n");

  const systemText = `You are a Bayesian forecasting analyst. Given priors and weighted evidence, produce posterior probabilities.

Playbook: ${playbook.label}
Model template: ${playbook.modelTemplate}

Output schema (return EXACTLY this shape, no code fences, no commentary):
{
  "proposed_probabilities": {
    "<exact outcome label>": <number 0-100>,
    "...": ...
  },
  "reasoning": "<2-3 paragraphs explaining the update; cite evidence by source name>"
}

Rules:
- Use the listed prior probabilities as your starting point.
- Update each outcome based on the evidence, weighting each source by the provided weight.
- The proposed_probabilities object must include EVERY outcome label exactly as given.
- Probabilities must sum to 100 (rounded integers OK).
- Reasoning must reference at least 2 source names from the evidence.`;

  const userText = `Prediction:
Title: ${prediction.title}
Category: ${prediction.category}
Description: ${prediction.description}

Outcomes (priors):
${outcomesBlock}

Evidence:
${evidenceBlock}

Produce the posterior update now.`;

  const modelConfig = getModelConfig();
  const response = await client.messages.create({
    model: modelConfig.id,
    max_tokens: 4000,
    system: [
      {
        type: "text",
        text: systemText,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userText }],
  });

  const fullText = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Modeling agent did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    proposed_probabilities?: Record<string, number>;
    reasoning?: string;
  };

  if (
    !parsed.proposed_probabilities ||
    typeof parsed.proposed_probabilities !== "object"
  ) {
    throw new Error("Modeling output missing proposed_probabilities object");
  }

  const proposedByLabel: Record<string, number> = {};
  for (const [label, prob] of Object.entries(parsed.proposed_probabilities)) {
    if (typeof prob !== "number" || Number.isNaN(prob)) continue;
    proposedByLabel[label] = prob;
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUsd = computeCostUsd(inputTokens, outputTokens, modelConfig);

  return {
    proposedByLabel,
    reasoning: String(parsed.reasoning ?? ""),
    inputTokens,
    outputTokens,
    costUsd,
  };
}

export function normalizeProbabilities(
  proposed: Record<string, number>
): Record<string, number> {
  const labels = Object.keys(proposed);
  if (labels.length === 0) return {};
  const total = labels.reduce((sum, l) => sum + proposed[l], 0);
  if (total === 0) return proposed;
  const scaled: Record<string, number> = {};
  for (const l of labels) {
    scaled[l] = Math.round((proposed[l] / total) * 100);
  }
  const newTotal = labels.reduce((sum, l) => sum + scaled[l], 0);
  if (newTotal !== 100) {
    scaled[labels[0]] += 100 - newTotal;
  }
  return scaled;
}

function defaultClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}
