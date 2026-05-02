import Anthropic from "@anthropic-ai/sdk";
import type { Playbook } from "../playbooks/types";

export interface EvidenceCitation {
  url: string;
  title?: string;
}

export interface EvidenceItem {
  source_name: string;
  content: string;
  key_signals: string[];
  weight: number;
  citations: EvidenceCitation[];
}

export interface ResearchAgentResult {
  evidence: EvidenceItem[];
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface PredictionContext {
  title: string;
  category: string;
  description: string;
  outcomes: { label: string; probability: number }[];
}

const SONNET_INPUT_USD_PER_MTOK = 3.0;
const SONNET_OUTPUT_USD_PER_MTOK = 15.0;

export async function runResearchAgent(
  prediction: PredictionContext,
  playbook: Playbook,
  client: Anthropic = defaultClient()
): Promise<ResearchAgentResult> {
  const sourcesList = playbook.sources
    .map(
      (s, i) =>
        `${i + 1}. ${s.name} (weight ${s.weight})\n   ${s.description}${
          s.searchHints?.length
            ? `\n   Search hints: ${s.searchHints.join(" | ")}`
            : ""
        }`
    )
    .join("\n\n");

  const systemText = `You are a research analyst gathering evidence for a forecast.

Playbook: ${playbook.label}
Domain context: ${playbook.systemContext}

For each source below, use the web_search tool to find the most recent relevant information. Then return a single JSON object with all evidence findings.

Sources:
${sourcesList}

Output schema (return EXACTLY this shape, nothing else, no code fences):
{
  "evidence": [
    {
      "source_name": "<exact name from sources list>",
      "content": "<2-3 sentence summary of what was found>",
      "key_signals": ["<specific data point>", "<specific data point>"],
      "weight": <copy from playbook>,
      "citations": [{ "url": "<source url>", "title": "<page title>" }]
    }
  ]
}

Rules:
- Include one evidence object per source, in the same order as the sources list.
- key_signals must be concrete (numbers, dates, named actors). No vague language.
- citations must be real URLs returned by web_search.
- Return ONLY the JSON object.`;

  const userText = `Prediction:
Title: ${prediction.title}
Category: ${prediction.category}
Description: ${prediction.description}

Current outcomes:
${prediction.outcomes.map((o) => `- ${o.label} (${o.probability}%)`).join("\n")}

Run the research now and return the JSON.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: systemText,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 10 },
    ],
    messages: [{ role: "user", content: userText }],
  });

  const fullText = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const jsonMatch = fullText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Research agent did not return valid JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as { evidence?: EvidenceItem[] };
  if (!Array.isArray(parsed.evidence)) {
    throw new Error("Research output missing evidence array");
  }

  const evidence = parsed.evidence.map((e) => ({
    source_name: String(e.source_name ?? ""),
    content: String(e.content ?? ""),
    key_signals: Array.isArray(e.key_signals) ? e.key_signals.map(String) : [],
    weight: typeof e.weight === "number" ? e.weight : 1.0,
    citations: Array.isArray(e.citations)
      ? e.citations.map((c) => ({
          url: String(c.url ?? ""),
          title: c.title ? String(c.title) : undefined,
        }))
      : [],
  }));

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const costUsd =
    (inputTokens * SONNET_INPUT_USD_PER_MTOK +
      outputTokens * SONNET_OUTPUT_USD_PER_MTOK) /
    1_000_000;

  return { evidence, inputTokens, outputTokens, costUsd };
}

function defaultClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");
  return new Anthropic({ apiKey });
}
