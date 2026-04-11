import type { Handler } from "aws-lambda";
import Anthropic from "@anthropic-ai/sdk";

const APPSYNC_URL = process.env.API_ENDPOINT!;
const API_KEY = process.env.API_KEY!;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;

interface Prediction {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
}

interface Outcome {
  id: string;
  predictionId: string;
  label: string;
  probability: number | null;
}

interface AnalysisResult {
  outcomes: { label: string; probability: number }[];
  players: string[];
  payoffMatrix: Record<string, Record<string, number>>;
  nashEquilibria: string[];
  dominantStrategies: string[];
  analysis: string;
}

// GraphQL helper
async function graphql(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(APPSYNC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) {
    console.error("GraphQL errors:", JSON.stringify(json.errors));
  }
  return json.data;
}

async function listPredictions(): Promise<Prediction[]> {
  const data = await graphql(`
    query {
      listPredictions {
        items {
          id title description category status
        }
      }
    }
  `);
  return data?.listPredictions?.items ?? [];
}

async function listOutcomes(): Promise<Outcome[]> {
  const data = await graphql(`
    query {
      listOutcomes {
        items {
          id predictionId label probability
        }
      }
    }
  `);
  return data?.listOutcomes?.items ?? [];
}

async function updateOutcomeProbability(id: string, probability: number) {
  await graphql(
    `mutation UpdateOutcome($input: UpdateOutcomeInput!) {
      updateOutcome(input: $input) { id probability }
    }`,
    { input: { id, probability } }
  );
}

async function upsertGameTheoryModel(
  predictionId: string,
  existingId: string | null,
  result: AnalysisResult
) {
  const input = {
    ...(existingId ? { id: existingId } : {}),
    predictionId,
    players: JSON.stringify(result.players),
    payoffMatrix: JSON.stringify(result.payoffMatrix),
    nashEquilibria: JSON.stringify(result.nashEquilibria),
    dominantStrategies: JSON.stringify(result.dominantStrategies),
    analysis: result.analysis,
  };

  if (existingId) {
    await graphql(
      `mutation UpdateGameTheoryModel($input: UpdateGameTheoryModelInput!) {
        updateGameTheoryModel(input: $input) { id }
      }`,
      { input }
    );
  } else {
    await graphql(
      `mutation CreateGameTheoryModel($input: CreateGameTheoryModelInput!) {
        createGameTheoryModel(input: $input) { id }
      }`,
      { input }
    );
  }
}

async function getExistingModel(predictionId: string): Promise<string | null> {
  const data = await graphql(`
    query {
      listGameTheoryModels {
        items { id predictionId }
      }
    }
  `);
  const models = data?.listGameTheoryModels?.items ?? [];
  const match = models.find((m: { predictionId: string }) => m.predictionId === predictionId);
  return match?.id ?? null;
}

async function analyzePrediction(
  prediction: Prediction,
  outcomes: Outcome[]
): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const outcomesDesc = outcomes
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
    throw new Error(`No JSON found in response for "${prediction.title}"`);
  }

  const result: AnalysisResult = JSON.parse(jsonMatch[0]);

  // Normalize probabilities to sum to 100
  const total = result.outcomes.reduce((sum, o) => sum + o.probability, 0);
  if (total !== 100) {
    result.outcomes = result.outcomes.map((o) => ({
      ...o,
      probability: Math.round((o.probability / total) * 100),
    }));
    // Fix rounding
    const newTotal = result.outcomes.reduce((sum, o) => sum + o.probability, 0);
    if (newTotal !== 100) {
      result.outcomes[0].probability += 100 - newTotal;
    }
  }

  return result;
}

export const handler: Handler = async (event) => {
  console.log("Starting prediction analysis...");

  const targetPredictionId = event?.predictionId as string | undefined;

  const predictions = await listPredictions();
  const allOutcomes = await listOutcomes();

  let openPredictions = predictions.filter((p) => p.status === "OPEN");
  if (targetPredictionId) {
    openPredictions = openPredictions.filter((p) => p.id === targetPredictionId);
  }
  console.log(`Found ${openPredictions.length} open predictions to analyze`);

  const results: Array<{
    predictionId: string;
    title: string;
    outcomes: Array<{ label: string; probability: number }>;
    analysis: string;
    nashEquilibria: string[];
    dominantStrategies: string[];
  }> = [];

  for (const prediction of openPredictions) {
    const outcomes = allOutcomes.filter((o) => o.predictionId === prediction.id);
    if (outcomes.length === 0) {
      console.log(`Skipping "${prediction.title}" — no outcomes`);
      continue;
    }

    console.log(`\nAnalyzing: ${prediction.title}`);
    try {
      const result = await analyzePrediction(prediction, outcomes);

      // Update outcome probabilities in DB
      for (const updated of result.outcomes) {
        const outcome = outcomes.find((o) => o.label === updated.label);
        if (outcome) {
          await updateOutcomeProbability(outcome.id, updated.probability);
          console.log(`  Updated "${updated.label}": ${outcome.probability}% → ${updated.probability}%`);
        }
      }

      // Upsert game theory model
      const existingModelId = await getExistingModel(prediction.id);
      await upsertGameTheoryModel(prediction.id, existingModelId, result);
      console.log(`  Saved game theory analysis`);

      results.push({
        predictionId: prediction.id,
        title: prediction.title,
        outcomes: result.outcomes,
        analysis: result.analysis,
        nashEquilibria: result.nashEquilibria,
        dominantStrategies: result.dominantStrategies,
      });
    } catch (err) {
      console.error(`  Failed to analyze "${prediction.title}":`, err);
    }
  }

  console.log("\nAnalysis complete!");
  return { statusCode: 200, body: JSON.stringify({ results }) };
};
