import { NextResponse } from "next/server";
import { query, stringField } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/runs/[id] — return run + evidence items
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  const { id } = await context.params;

  const runs = (
    await query(
      `SELECT pr.*, p."owner" AS prediction_owner
         FROM prediction_runs pr
         JOIN "Prediction" p ON p."id" = pr.prediction_id
        WHERE pr.id = :id`,
      [{ name: "id", value: stringField(id) }]
    )
  ).records as Array<Record<string, unknown> & { prediction_owner: string }>;

  if (runs.length === 0) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  const run = runs[0];
  if (!user.isAdmin && run.prediction_owner !== user.sub) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const evidence = (
    await query(
      `SELECT id, source_name, content, key_signals, weight, citations, created_at
         FROM evidence_items
        WHERE run_id = :run_id
        ORDER BY created_at ASC`,
      [{ name: "run_id", value: stringField(id) }]
    )
  ).records;

  const { prediction_owner: _, ...runWithoutOwner } = run;
  return NextResponse.json({ ...runWithoutOwner, evidence });
}
