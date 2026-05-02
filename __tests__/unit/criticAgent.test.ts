/**
 * @jest-environment node
 */
import type Anthropic from "@anthropic-ai/sdk";
import { runCriticAgent } from "@/lib/forecast/agents/critic";
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
    { label: "Energy strikes", probability: 38 },
    { label: "Extension", probability: 25 },
    { label: "Deal", probability: 10 },
  ],
};

const proposed = {
  "Energy strikes": 45,
  Extension: 30,
  Deal: 25,
};

const evidence: EvidenceItem[] = [
  {
    source_name: "AAA Gas Prices",
    content: "Gas at $4.08/gal.",
    key_signals: ["$4.08/gal"],
    weight: 1.0,
    citations: [{ url: "https://gasprices.aaa.com/" }],
  },
];

const reasoning = "Updated based on AAA Gas Prices and Trump Truth Social.";

describe("runCriticAgent", () => {
  it("parses an approve verdict with notes", async () => {
    const client = fakeClient({
      content: [
        {
          type: "text",
          text: JSON.stringify({ verdict: "approve", notes: "No issues" }),
        },
      ],
      usage: { input_tokens: 500, output_tokens: 100 },
    });

    const result = await runCriticAgent(
      prediction,
      evidence,
      proposed,
      reasoning,
      iranWarPlaybook,
      client
    );

    expect(result.verdict).toBe("approve");
    expect(result.notes).toBe("No issues");
    expect(result.inputTokens).toBe(500);
    expect(result.outputTokens).toBe(100);
    // $3/M input + $15/M output = 0.0015 + 0.0015 = 0.003
    expect(result.costUsd).toBeCloseTo(0.003, 4);
  });

  it("normalises uppercase / whitespace verdicts", async () => {
    const client = fakeClient({
      content: [
        {
          type: "text",
          text: JSON.stringify({ verdict: "  REVISE  ", notes: "sum is 99" }),
        },
      ],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    const result = await runCriticAgent(
      prediction,
      evidence,
      proposed,
      reasoning,
      iranWarPlaybook,
      client
    );
    expect(result.verdict).toBe("revise");
  });

  it("strips surrounding prose and parses just the JSON object", async () => {
    const wrapped = `Verdict ready:\n${JSON.stringify({
      verdict: "reject",
      notes: "missing outcome coverage",
    })}\nThanks.`;

    const client = fakeClient({
      content: [{ type: "text", text: wrapped }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    const result = await runCriticAgent(
      prediction,
      evidence,
      proposed,
      reasoning,
      iranWarPlaybook,
      client
    );
    expect(result.verdict).toBe("reject");
    expect(result.notes).toBe("missing outcome coverage");
  });

  it("throws when the response contains no JSON", async () => {
    const client = fakeClient({
      content: [{ type: "text", text: "Could not produce verdict." }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    await expect(
      runCriticAgent(
        prediction,
        evidence,
        proposed,
        reasoning,
        iranWarPlaybook,
        client
      )
    ).rejects.toThrow("did not return valid JSON");
  });

  it("throws when verdict is unknown", async () => {
    const client = fakeClient({
      content: [
        {
          type: "text",
          text: JSON.stringify({ verdict: "maybe", notes: "" }),
        },
      ],
      usage: { input_tokens: 10, output_tokens: 10 },
    });

    await expect(
      runCriticAgent(
        prediction,
        evidence,
        proposed,
        reasoning,
        iranWarPlaybook,
        client
      )
    ).rejects.toThrow("invalid verdict");
  });

  it("renders an arrow line per outcome including missing labels", async () => {
    const captured: { args?: Record<string, unknown> } = {};
    const client = fakeClient(
      {
        content: [
          {
            type: "text",
            text: JSON.stringify({ verdict: "approve", notes: "ok" }),
          },
        ],
        usage: { input_tokens: 10, output_tokens: 10 },
      },
      captured
    );

    const partialProposed = { "Energy strikes": 45, Extension: 30 }; // Deal omitted
    await runCriticAgent(
      prediction,
      evidence,
      partialProposed,
      reasoning,
      iranWarPlaybook,
      client
    );

    const args = captured.args as {
      messages: Array<{ role: string; content: string }>;
    };
    const userText = args.messages[0].content;
    expect(userText).toMatch(/Energy strikes.*38% → 45%/);
    expect(userText).toMatch(/Deal.*\(missing\)/);
  });

  it("calls Claude with sonnet-4-6 and prompt cache, no web tool", async () => {
    const captured: { args?: Record<string, unknown> } = {};
    const client = fakeClient(
      {
        content: [
          {
            type: "text",
            text: JSON.stringify({ verdict: "approve", notes: "ok" }),
          },
        ],
        usage: { input_tokens: 10, output_tokens: 10 },
      },
      captured
    );

    await runCriticAgent(
      prediction,
      evidence,
      proposed,
      reasoning,
      iranWarPlaybook,
      client
    );

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
