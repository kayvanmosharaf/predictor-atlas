import { NextResponse } from "next/server";
import { query, stringField } from "@/lib/db";
import { authenticateRequest, requireAuth } from "@/lib/auth";
import { getPlaybookForCategory } from "@/lib/forecast/playbooks";
import { runResearchAgent } from "@/lib/forecast/agents/research";
import {
  runModelingAgent,
  normalizeProbabilities,
} from "@/lib/forecast/agents/modeling";
import { runCriticAgent } from "@/lib/forecast/agents/critic";
import { anthropicErrorResponse } from "@/lib/forecast/anthropic-errors";

export const maxDuration = 120;

// POST /api/runs — kick off a forecast run for a prediction
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  let body: { prediction_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const predictionId = body.prediction_id;
  if (!predictionId) {
    return NextResponse.json(
      { error: "prediction_id is required" },
      { status: 400 }
    );
  }

  const predictions = (
    await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
      { name: "id", value: stringField(predictionId) },
    ])
  ).records;

  if (predictions.length === 0) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  const prediction = predictions[0] as {
    id: string;
    title: string;
    description: string;
    category: string;
    owner: string;
  };

  if (!user.isAdmin && prediction.owner !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const playbook = getPlaybookForCategory(prediction.category);
  if (!playbook) {
    return NextResponse.json(
      { error: `No playbook configured for category "${prediction.category}"` },
      { status: 400 }
    );
  }

  const outcomes = (
    await query(
      `SELECT * FROM "Outcome" WHERE "predictionId" = :id ORDER BY "createdAt" ASC`,
      [{ name: "id", value: stringField(predictionId) }]
    )
  ).records as { id: string; label: string; probability: number | null }[];

  if (outcomes.length === 0) {
    return NextResponse.json(
      { error: "Prediction has no outcomes" },
      { status: 400 }
    );
  }

  const runId = crypto.randomUUID();
  await query(
    `INSERT INTO prediction_runs (id, prediction_id, playbook_key, status, triggered_by)
     VALUES (:id, :prediction_id, :playbook_key, 'researching', :triggered_by)`,
    [
      { name: "id", value: stringField(runId) },
      { name: "prediction_id", value: stringField(predictionId) },
      { name: "playbook_key", value: stringField(playbook.key) },
      { name: "triggered_by", value: stringField(user.sub) },
    ]
  );

  const predictionContext = {
    title: prediction.title,
    description: prediction.description,
    category: prediction.category,
  };

  try {
    const research = await runResearchAgent(
      {
        ...predictionContext,
        outcomes: outcomes.map((o) => ({
          label: o.label,
          probability: o.probability ?? 0,
        })),
      },
      playbook
    );

    for (const ev of research.evidence) {
      await query(
        `INSERT INTO evidence_items
           (run_id, source_name, content, key_signals, weight, citations)
         VALUES (:run_id, :source_name, :content, :key_signals::jsonb, :weight, :citations::jsonb)`,
        [
          { name: "run_id", value: stringField(runId) },
          { name: "source_name", value: stringField(ev.source_name) },
          { name: "content", value: stringField(ev.content) },
          {
            name: "key_signals",
            value: stringField(JSON.stringify(ev.key_signals)),
          },
          { name: "weight", value: ev.weight },
          {
            name: "citations",
            value: stringField(JSON.stringify(ev.citations)),
          },
        ]
      );
    }

    await query(
      `UPDATE prediction_runs SET status = 'modeling' WHERE id = :id`,
      [{ name: "id", value: stringField(runId) }]
    );

    const modeling = await runModelingAgent(
      {
        ...predictionContext,
        outcomes: outcomes.map((o) => ({
          id: o.id,
          label: o.label,
          probability: o.probability ?? 0,
        })),
      },
      research.evidence,
      playbook
    );

    const normalized = normalizeProbabilities(modeling.proposedByLabel);

    await query(
      `INSERT INTO model_outputs (run_id, proposed_probabilities, reasoning)
       VALUES (:run_id, :proposed::jsonb, :reasoning)`,
      [
        { name: "run_id", value: stringField(runId) },
        { name: "proposed", value: stringField(JSON.stringify(normalized)) },
        { name: "reasoning", value: stringField(modeling.reasoning) },
      ]
    );

    await query(
      `UPDATE prediction_runs SET status = 'reviewing' WHERE id = :id`,
      [{ name: "id", value: stringField(runId) }]
    );

    const critic = await runCriticAgent(
      {
        ...predictionContext,
        outcomes: outcomes.map((o) => ({
          label: o.label,
          probability: o.probability ?? 0,
        })),
      },
      research.evidence,
      normalized,
      modeling.reasoning,
      playbook
    );

    await query(
      `INSERT INTO critic_reviews (run_id, verdict, notes)
       VALUES (:run_id, :verdict, :notes)`,
      [
        { name: "run_id", value: stringField(runId) },
        { name: "verdict", value: stringField(critic.verdict) },
        { name: "notes", value: stringField(critic.notes) },
      ]
    );

    const inputTokens =
      research.inputTokens + modeling.inputTokens + critic.inputTokens;
    const outputTokens =
      research.outputTokens + modeling.outputTokens + critic.outputTokens;
    const costUsd = research.costUsd + modeling.costUsd + critic.costUsd;

    await query(
      `UPDATE prediction_runs
         SET status = 'completed',
             input_tokens = :input_tokens,
             output_tokens = :output_tokens,
             cost_usd = :cost_usd,
             completed_at = now()
       WHERE id = :id`,
      [
        { name: "input_tokens", value: inputTokens },
        { name: "output_tokens", value: outputTokens },
        { name: "cost_usd", value: costUsd },
        { name: "id", value: stringField(runId) },
      ]
    );

    return NextResponse.json(
      {
        run_id: runId,
        prediction_id: predictionId,
        playbook_key: playbook.key,
        status: "completed",
        evidence_count: research.evidence.length,
        proposed_probabilities: normalized,
        verdict: critic.verdict,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost_usd: costUsd,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Run failed:", err);
    const message = err instanceof Error ? err.message : "Run failed";
    await query(
      `UPDATE prediction_runs
         SET status = 'failed', error = :error, completed_at = now()
       WHERE id = :id`,
      [
        { name: "error", value: stringField(message) },
        { name: "id", value: stringField(runId) },
      ]
    );
    const anthropicResponse = anthropicErrorResponse(err);
    if (anthropicResponse) {
      const body = await anthropicResponse.json();
      return NextResponse.json(
        { ...body, run_id: runId },
        { status: anthropicResponse.status }
      );
    }
    return NextResponse.json({ error: message, run_id: runId }, { status: 500 });
  }
}

// GET /api/runs?prediction_id=...  — list runs for a prediction
export async function GET(request: Request) {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get("prediction_id");
  if (!predictionId) {
    return NextResponse.json(
      { error: "prediction_id query param is required" },
      { status: 400 }
    );
  }

  const predictions = (
    await query(`SELECT "owner" FROM "Prediction" WHERE "id" = :id`, [
      { name: "id", value: stringField(predictionId) },
    ])
  ).records as { owner: string }[];

  if (predictions.length === 0) {
    return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
  }

  if (!user.isAdmin && predictions[0].owner !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const runs = (
    await query(
      `SELECT id, prediction_id, playbook_key, status, triggered_by,
              error, input_tokens, output_tokens, cost_usd,
              started_at, completed_at, created_at
         FROM prediction_runs
        WHERE prediction_id = :prediction_id
        ORDER BY created_at DESC`,
      [{ name: "prediction_id", value: stringField(predictionId) }]
    )
  ).records;

  return NextResponse.json(runs);
}
