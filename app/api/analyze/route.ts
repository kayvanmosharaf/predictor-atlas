import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { query, stringField } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { anthropicErrorResponse } from "@/lib/forecast/anthropic-errors";
import { getModelConfig } from "@/lib/forecast/model";

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

  const body = (await request.json()) as { predictionId?: string; force?: boolean };
  const { predictionId, force = false } = body;
  if (!predictionId) {
    return NextResponse.json({ error: "predictionId is required" }, { status: 400 });
  }

  const predictions = (
    await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
      { name: "id", value: stringField(predictionId) },
    ])
  ).records;

  if (predictions.length === 0) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  const prediction = predictions[0];

  const outcomes = (
    await query(
      `SELECT * FROM "Outcome" WHERE "predictionId" = :id ORDER BY "createdAt" ASC`,
      [{ name: "id", value: stringField(predictionId) }]
    )
  ).records;

  if (outcomes.length === 0) {
    return NextResponse.json({ error: "Prediction has no outcomes" }, { status: 400 });
  }

  const existingModel = (
    await query(
      `SELECT * FROM "GameTheoryModel" WHERE "predictionId" = :predictionId`,
      [{ name: "predictionId", value: stringField(predictionId) }]
    )
  ).records;

  if (!force && existingModel.length > 0) {
    const cached = existingModel[0];
    const ttlHours = Number(process.env.ANALYSIS_CACHE_TTL_HOURS ?? 6);
    const ttlMs = ttlHours * 60 * 60 * 1000;
    const modelTime = new Date(cached.updatedAt as string).getTime();
    const predictionTime = new Date(prediction.updatedAt as string).getTime();
    const age = Date.now() - modelTime;
    if (modelTime > predictionTime && age < ttlMs) {
      return NextResponse.json({
        analysis: cached.analysis,
        nashEquilibria: JSON.parse(cached.nashEquilibria as string),
        dominantStrategies: JSON.parse(cached.dominantStrategies as string),
        players: JSON.parse(cached.players as string),
        cached: true,
        cachedAt: cached.updatedAt,
      });
    }
  }

  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const client = new Anthropic({ apiKey: anthropicApiKey });

    const outcomesDesc = outcomes
      .map((o) => `- "${o.label}" (current probability: ${o.probability ?? 0}%)`)
      .join("\n");

    const response = await client.messages.create({
      model: getModelConfig().id,
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
      const outcome = outcomes.find((o) => o.label === updated.label);
      if (outcome) {
        await query(
          `UPDATE "Outcome" SET "probability" = :probability, "updatedAt" = :now WHERE "id" = :id`,
          [
            { name: "probability", value: updated.probability },
            { name: "now", value: stringField(new Date().toISOString()) },
            { name: "id", value: stringField(outcome.id as string) },
          ]
        );
      }
    }

    // Upsert game theory model
    const now = new Date().toISOString();
    if (existingModel.length > 0) {
      await query(
        `UPDATE "GameTheoryModel" SET "players" = :players, "payoffMatrix" = :payoffMatrix, "nashEquilibria" = :nashEquilibria, "dominantStrategies" = :dominantStrategies, "analysis" = :analysis, "updatedAt" = :now WHERE "predictionId" = :predictionId`,
        [
          { name: "players", value: stringField(JSON.stringify(result.players)) },
          { name: "payoffMatrix", value: stringField(JSON.stringify(result.payoffMatrix)) },
          { name: "nashEquilibria", value: stringField(JSON.stringify(result.nashEquilibria)) },
          { name: "dominantStrategies", value: stringField(JSON.stringify(result.dominantStrategies)) },
          { name: "analysis", value: stringField(result.analysis) },
          { name: "now", value: stringField(now) },
          { name: "predictionId", value: stringField(predictionId) },
        ]
      );
    } else {
      await query(
        `INSERT INTO "GameTheoryModel" ("id", "predictionId", "players", "payoffMatrix", "nashEquilibria", "dominantStrategies", "analysis", "createdAt", "updatedAt")
         VALUES (:id, :predictionId, :players, :payoffMatrix, :nashEquilibria, :dominantStrategies, :analysis, :now, :now)`,
        [
          { name: "id", value: stringField(crypto.randomUUID()) },
          { name: "predictionId", value: stringField(predictionId) },
          { name: "players", value: stringField(JSON.stringify(result.players)) },
          { name: "payoffMatrix", value: stringField(JSON.stringify(result.payoffMatrix)) },
          { name: "nashEquilibria", value: stringField(JSON.stringify(result.nashEquilibria)) },
          { name: "dominantStrategies", value: stringField(JSON.stringify(result.dominantStrategies)) },
          { name: "analysis", value: stringField(result.analysis) },
          { name: "now", value: stringField(now) },
        ]
      );
    }

    return NextResponse.json({
      analysis: result.analysis,
      nashEquilibria: result.nashEquilibria,
      dominantStrategies: result.dominantStrategies,
      players: result.players,
    });
  } catch (err) {
    console.error("Analysis failed:", err);
    const anthropicResponse = anthropicErrorResponse(err);
    if (anthropicResponse) return anthropicResponse;
    const message = err instanceof Error ? err.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
