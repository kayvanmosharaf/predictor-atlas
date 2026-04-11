import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

interface AnalysisResult {
  outcomes: { label: string; probability: number }[];
  players: string[];
  payoffMatrix: Record<string, Record<string, number>>;
  nashEquilibria: string[];
  dominantStrategies: string[];
  analysis: string;
}

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  const { predictionId } = await request.json();
  if (!predictionId) {
    return NextResponse.json({ error: "predictionId is required" }, { status: 400 });
  }

  const prediction = await prisma.prediction.findUnique({
    where: { id: predictionId },
    include: { outcomes: true },
  });

  if (!prediction) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  if (prediction.outcomes.length === 0) {
    return NextResponse.json({ error: "Prediction has no outcomes" }, { status: 400 });
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });

    const outcomesDesc = prediction.outcomes
      .map((o) => `- "${o.label}" (current probability: ${o.probability ?? 0}%)`)
      .join("\n");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      tools: [{ type: "web_search_20250305" as const, name: "web_search" as const, max_uses: 10 }],
      messages: [
        {
          role: "user",
          content: `You are a game theory and Bayesian analysis expert. Analyze this prediction by searching the web for the latest information, then build a Bayesian network to update the outcome probabilities.

## Prediction
**Title:** ${prediction.title}
**Category:** ${prediction.category}
**Description:** ${prediction.description}

## Current Outcomes
${outcomesDesc}

## Your Task

1. **Search the web** for the latest news, data, and expert analysis related to this prediction. Search for multiple perspectives and diverse sources (news, think tanks, academic, data).

2. **Identify key players/actors** involved in this scenario and their strategic interests.

3. **Build a Bayesian Network:**
   - Use current probabilities as priors
   - Identify new evidence from your web search
   - Update posterior probabilities based on the evidence
   - Ensure probabilities sum to 100%

4. **Game Theory Analysis:**
   - Identify the key strategic players
   - Construct a simplified payoff matrix
   - Identify Nash equilibria
   - Identify dominant strategies if any

5. **Return your analysis as JSON** (and nothing else outside the JSON) in this exact format:
\`\`\`json
{
  "outcomes": [
    { "label": "outcome name", "probability": <updated probability as number> }
  ],
  "players": ["Player 1", "Player 2"],
  "payoffMatrix": {
    "Player1_Strategy1 vs Player2_Strategy1": { "player1": 5, "player2": 3 },
    "Player1_Strategy1 vs Player2_Strategy2": { "player1": 2, "player2": 7 }
  },
  "nashEquilibria": ["Description of each Nash equilibrium"],
  "dominantStrategies": ["Any dominant strategies found"],
  "analysis": "2-3 paragraph summary of key findings, evidence gathered, and reasoning behind probability updates. Include specific sources and data points."
}
\`\`\`

IMPORTANT: The outcome probabilities MUST sum to 100. Return ONLY valid JSON.`,
        },
      ],
    });

    // Extract JSON from response
    const textBlocks = response.content.filter((b) => b.type === "text");
    const fullText = textBlocks.map((b) => b.text).join("\n");

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "No valid analysis returned from AI" }, { status: 500 });
    }

    const result: AnalysisResult = JSON.parse(jsonMatch[0]);

    // Normalize probabilities to sum to 100
    const total = result.outcomes.reduce((sum, o) => sum + o.probability, 0);
    if (total !== 100) {
      result.outcomes = result.outcomes.map((o) => ({
        ...o,
        probability: Math.round((o.probability / total) * 100),
      }));
      const newTotal = result.outcomes.reduce((sum, o) => sum + o.probability, 0);
      if (newTotal !== 100) {
        result.outcomes[0].probability += 100 - newTotal;
      }
    }

    // Update outcome probabilities in DB
    for (const updated of result.outcomes) {
      const outcome = prediction.outcomes.find((o) => o.label === updated.label);
      if (outcome) {
        await prisma.outcome.update({
          where: { id: outcome.id },
          data: { probability: updated.probability },
        });
      }
    }

    // Upsert game theory model
    await prisma.gameTheoryModel.upsert({
      where: { predictionId: prediction.id },
      update: {
        players: JSON.stringify(result.players),
        payoffMatrix: JSON.stringify(result.payoffMatrix),
        nashEquilibria: JSON.stringify(result.nashEquilibria),
        dominantStrategies: JSON.stringify(result.dominantStrategies),
        analysis: result.analysis,
      },
      create: {
        predictionId: prediction.id,
        players: JSON.stringify(result.players),
        payoffMatrix: JSON.stringify(result.payoffMatrix),
        nashEquilibria: JSON.stringify(result.nashEquilibria),
        dominantStrategies: JSON.stringify(result.dominantStrategies),
        analysis: result.analysis,
      },
    });

    return NextResponse.json({
      analysis: result.analysis,
      nashEquilibria: result.nashEquilibria,
      dominantStrategies: result.dominantStrategies,
    });
  } catch (err) {
    console.error("Analysis failed:", err);
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
