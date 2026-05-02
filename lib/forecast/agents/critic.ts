import Anthropic from "@anthropic-ai/sdk";
import type { Playbook } from "../playbooks/types";
import type { EvidenceItem } from "./research";
import { computeCostUsd, getModelConfig } from "../model";

export type CriticVerdict = "approve" | "reject" | "revise";

export interface CriticAgentResult {
  verdict: CriticVerdict;
  notes: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface CriticPredictionContext {
  title: string;
  description: string;
  category: string;
  outcomes: { label: string; probability: number }[];
}

export async function runCriticAgent(
  prediction: CriticPredictionContext,
  evidence: EvidenceItem[],
  proposedByLabel: Record<string, number>,
  reasoning: string,
  playbook: Playbook,
  client: Anthropic = defaultClient()
): Promise<CriticAgentResult> {
  const evidenceBlock = evidence
    .map(
      (e) =>
        `- Source: ${e.source_name} (weight ${e.weight})\n  Content: ${e.content}\n  Key signals: ${e.key_signals.join("; ") || "(none)"}\n  Citations: ${e.citations.length}`
    )
    .join("\n");

  const updateBlock = prediction.outcomes
    .map((o) => {
      const proposed = proposedByLabel[o.label];
      const arrow =
        proposed === undefined ? "(missing)" : `${o.probability}% → ${proposed}%`;
      return `- "${o.label}" — ${arrow}`;
    })
    .join("\n");

  const checklistBlock = playbook.criticChecklist
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  const systemText = `You are a skeptical critic reviewing a Bayesian probability update produced by an LLM modeling agent. Catch errors before they reach the database.

Playbook: ${playbook.label}

Output schema (return EXACTLY this shape, no code fences, no commentary):
{
  "verdict": "approve" | "reject" | "revise",
  "notes": "<2-3 sentence summary of issues found, or 'No issues' on approve>"
}

Verdict guidance:
- approve: probabilities sum to 100, every outcome is covered, reasoning cites evidence, all playbook checks pass.
- revise: minor issues (sum is 99 or 101, weak reasoning) — modeling should retry.
- reject: substantive issues (missing outcome, contradicts evidence, fails a playbook check) — discard the update.`;

  const userText = `Prediction:
Title: ${prediction.title}
Category: ${prediction.category}
Description: ${prediction.description}

Evidence:
${evidenceBlock}

Proposed update:
${updateBlock}

Modeling reasoning:
${reasoning}

Playbook checklist:
${checklistBlock}

Review the update and return your verdict.`;

  const modelConfig = getModelConfig();
  const response = await client.messages.create({
    model: modelConfig.id,
    max_tokens: 1500,
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
    throw new Error("Critic agent did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    verdict?: string;
    notes?: string;
  };

  const verdict = normalizeVerdict(parsed.verdict);
  if (!verdict) {
    throw new Error(`Critic returned invalid verdict: ${parsed.verdict}`);
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUsd = computeCostUsd(inputTokens, outputTokens, modelConfig);

  return {
    verdict,
    notes: String(parsed.notes ?? ""),
    inputTokens,
    outputTokens,
    costUsd,
  };
}

function normalizeVerdict(raw: unknown): CriticVerdict | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "approve" || v === "reject" || v === "revise") return v;
  return null;
}

function defaultClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}
