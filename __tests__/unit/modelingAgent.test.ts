/**
 * @jest-environment node
 */
import type Anthropic from "@anthropic-ai/sdk";
import {
  runModelingAgent,
  normalizeProbabilities,
} from "@/lib/forecast/agents/modeling";
import { iranWarPlaybook } from "@/lib/forecast/playbooks/iran-war";
import type { EvidenceItem } from "@/lib/forecast/agents/research";

interface FakeResponse {
  content: Array<{ type: "text"; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
}

function fakeClient(response: FakeResponse, captured?: { args?: unknown }) {
  return {
    messages: {
      create: jest.fn(async (args: unknown) => {
        if (captured) captured.args = args;
        return response;
      }),
    },
  } as unknown as Anthropic;
}

const prediction = {
  title: "Iran War — April 6 deadline outcome",
  description: "Will Trump's April 6 deadline result in energy strikes?",
  category: "geopolitics",
  outcomes: [
    { id: "o1", label: "Energy strikes", probability: 38 },
    { id: "o2", label: "Extension", probability: 25 },
    { id: "o3", label: "Deal", probability: 10 },
  ],
};

const evidence: EvidenceItem[] = [
  {
    source_name: "AAA Gas Prices",
    content: "Gas at $4.08/gal nationally; up $1.08 since war start.",
    key_signals: ["$4.08/gal"],
    weight: 1.0,
    citations: [{ url: "https://gasprices.aaa.com/" }],
  },
  {
    source_name: "Trump Truth Social",
    content: "N3 ultimatum at peak intensity.",
    key_signals: ["All Hell"],
    weight: 1.5,
    citations: [],
  },
];

describe("runModelingAgent", () => {
  it("parses probabilities + reasoning and returns token usage + cost", async () => {
    const fakeOutput = {
      proposed_probabilities: {
        "Energy strikes": 45,
        Extension: 30,
        Deal: 25,
      },
      reasoning:
        "Trump Truth Social N3 peak strengthens energy strikes; AAA Gas confirms market pricing risk.",
    };

    const client = fakeClient({
      content: [{ type: "text", text: JSON.stringify(fakeOutput) }],
      usage: { input_tokens: 1200, output_tokens: 800 },
    });

    const result = await runModelingAgent(
      prediction,
      evidence,
      iranWarPlaybook,
      client
    );

    expect(result.proposedByLabel["Energy strikes"]).toBe(45);
    expect(result.proposedByLabel["Extension"]).toBe(30);
    expect(result.proposedByLabel["Deal"]).toBe(25);
    expect(result.reasoning).toContain("Trump Truth Social");
    expect(result.inputTokens).toBe(1200);
    expect(result.outputTokens).toBe(800);
    // $3/M input + $15/M output = 0.0036 + 0.012 = 0.0156
    expect(result.costUsd).toBeCloseTo(0.0156, 4);
  });

  it("strips surrounding prose and parses just the JSON object", async () => {
    const wrapped = `Here is the update:\n\n${JSON.stringify({
      proposed_probabilities: { "Energy strikes": 50, Extension: 30, Deal: 20 },
      reasoning: "Cites AAA Gas Prices and Trump Truth Social.",
    })}\n\nDone.`;

    const client = fakeClient({
      content: [{ type: "text", text: wrapped }],
      usage: { input_tokens: 50, output_tokens: 50 },
    });

    const result = await runModelingAgent(
      prediction,
      evidence,
      iranWarPlaybook,
      client
    );
    expect(result.proposedByLabel["Energy strikes"]).toBe(50);
    expect(result.reasoning).toMatch(/AAA Gas Prices/);
  });

  it("throws when the response contains no JSON", async () => {
    const client = fakeClient({
      content: [{ type: "text", text: "I cannot complete this update." }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    await expect(
      runModelingAgent(prediction, evidence, iranWarPlaybook, client)
    ).rejects.toThrow("did not return valid JSON");
  });

  it("throws when JSON is missing proposed_probabilities", async () => {
    const client = fakeClient({
      content: [{ type: "text", text: JSON.stringify({ reasoning: "ok" }) }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    await expect(
      runModelingAgent(prediction, evidence, iranWarPlaybook, client)
    ).rejects.toThrow("missing proposed_probabilities");
  });

  it("calls Claude with sonnet-4-6 and prompt cache, no web tool", async () => {
    const captured: { args?: Record<string, unknown> } = {};
    const client = fakeClient(
      {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              proposed_probabilities: { "Energy strikes": 33, Extension: 33, Deal: 34 },
              reasoning: "AAA Gas Prices and Trump Truth Social cited.",
            }),
          },
        ],
        usage: { input_tokens: 10, output_tokens: 10 },
      },
      captured
    );

    await runModelingAgent(prediction, evidence, iranWarPlaybook, client);

    const args = captured.args as {
      model: string;
      tools?: unknown[];
      system: Array<{ cache_control?: { type: string } }>;
    };
    expect(args.model).toBe("claude-sonnet-4-6");
    expect(args.tools).toBeUndefined();
    expect(args.system[0].cache_control?.type).toBe("ephemeral");
  });
});

describe("normalizeProbabilities", () => {
  it("scales values that don't sum to 100 and absorbs rounding into the first label", () => {
    const out = normalizeProbabilities({ A: 50, B: 30, C: 19 }); // sum 99
    expect(out.A + out.B + out.C).toBe(100);
  });

  it("returns empty for an empty input", () => {
    expect(normalizeProbabilities({})).toEqual({});
  });

  it("returns the input unchanged if every value is 0", () => {
    expect(normalizeProbabilities({ A: 0, B: 0 })).toEqual({ A: 0, B: 0 });
  });
});
