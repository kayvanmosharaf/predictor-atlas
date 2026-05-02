/**
 * @jest-environment node
 */
import type Anthropic from "@anthropic-ai/sdk";
import { runResearchAgent } from "@/lib/forecast/agents/research";
import { iranWarPlaybook } from "@/lib/forecast/playbooks/iran-war";

interface FakeResponse {
  content: Array<{ type: "text"; text: string } | { type: "tool_use" }>;
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

describe("runResearchAgent", () => {
  it("parses the JSON evidence array, normalizes fields, and returns token usage + cost", async () => {
    const fakeEvidence = {
      evidence: [
        {
          source_name: "AAA Gas Prices",
          content: "Gas at $4.08/gal nationally; up $1.08 since war start.",
          key_signals: ["$4.08/gal", "+36% since 2026-02-28"],
          weight: 1.0,
          citations: [{ url: "https://gasprices.aaa.com/", title: "AAA" }],
        },
        {
          source_name: "Brent Crude",
          content: "Brent expected $118 at Monday open.",
          key_signals: ["$118/bbl"],
          weight: 1.2,
          citations: [{ url: "https://example.com/brent" }],
        },
      ],
    };

    const client = fakeClient({
      content: [{ type: "text", text: JSON.stringify(fakeEvidence) }],
      usage: { input_tokens: 1200, output_tokens: 800 },
    });

    const result = await runResearchAgent(prediction, iranWarPlaybook, client);

    expect(result.evidence).toHaveLength(2);
    expect(result.evidence[0].source_name).toBe("AAA Gas Prices");
    expect(result.evidence[0].key_signals).toEqual([
      "$4.08/gal",
      "+36% since 2026-02-28",
    ]);
    expect(result.evidence[0].citations[0].url).toBe(
      "https://gasprices.aaa.com/"
    );
    expect(result.inputTokens).toBe(1200);
    expect(result.outputTokens).toBe(800);
    // $3/M input + $15/M output = 0.0036 + 0.012 = 0.0156
    expect(result.costUsd).toBeCloseTo(0.0156, 4);
  });

  it("strips surrounding prose and parses just the JSON object", async () => {
    const wrapped = `Here is the evidence I gathered:\n\n${JSON.stringify({
      evidence: [
        {
          source_name: "Trump Truth Social",
          content: "N3 ultimatum at peak intensity.",
          key_signals: ["All Hell"],
          weight: 1.5,
          citations: [],
        },
      ],
    })}\n\nThat completes the research.`;

    const client = fakeClient({
      content: [{ type: "text", text: wrapped }],
      usage: { input_tokens: 100, output_tokens: 200 },
    });

    const result = await runResearchAgent(prediction, iranWarPlaybook, client);
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0].source_name).toBe("Trump Truth Social");
  });

  it("throws when the response contains no JSON", async () => {
    const client = fakeClient({
      content: [{ type: "text", text: "I could not complete the research." }],
      usage: { input_tokens: 50, output_tokens: 20 },
    });

    await expect(
      runResearchAgent(prediction, iranWarPlaybook, client)
    ).rejects.toThrow("did not return valid JSON");
  });

  it("throws when JSON is missing the evidence array", async () => {
    const client = fakeClient({
      content: [{ type: "text", text: JSON.stringify({ result: "ok" }) }],
      usage: { input_tokens: 50, output_tokens: 20 },
    });

    await expect(
      runResearchAgent(prediction, iranWarPlaybook, client)
    ).rejects.toThrow("missing evidence array");
  });

  it("calls Claude with the configured model, web_search tool, and prompt cache", async () => {
    const captured: { args?: Record<string, unknown> } = {};
    const client = fakeClient(
      {
        content: [{ type: "text", text: JSON.stringify({ evidence: [] }) }],
        usage: { input_tokens: 10, output_tokens: 10 },
      },
      captured
    );

    await runResearchAgent(prediction, iranWarPlaybook, client);

    const args = captured.args as {
      model: string;
      tools: Array<{ type: string; name: string }>;
      system: Array<{ cache_control?: { type: string } }>;
    };
    expect(args.model).toBe("claude-sonnet-4-6");
    expect(args.tools[0].name).toBe("web_search");
    expect(args.system[0].cache_control?.type).toBe("ephemeral");
  });
});
