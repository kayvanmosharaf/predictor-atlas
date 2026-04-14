import { NextResponse } from "next/server";
import { query, stringField } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { Field } from "@aws-sdk/client-rds-data";

// PATCH /api/outcomes/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  try {
    // Fetch outcome with its prediction's owner
    const outcomes = (
      await query(
        `SELECT o.*, p."owner" as "predictionOwner" FROM "Outcome" o JOIN "Prediction" p ON o."predictionId" = p."id" WHERE o."id" = :id`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    if (outcomes.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (outcomes[0].predictionOwner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { label, probability, nashEquilibriumScore } = body;

    const sets: string[] = [];
    const params_list: { name: string; value: Field }[] = [
      { name: "id", value: stringField(id) },
    ];

    if (label !== undefined) {
      sets.push(`"label" = :label`);
      params_list.push({ name: "label", value: stringField(label) });
    }
    if (probability !== undefined) {
      sets.push(`"probability" = :probability`);
      params_list.push({
        name: "probability",
        value: probability != null ? { doubleValue: probability } : { isNull: true },
      });
    }
    if (nashEquilibriumScore !== undefined) {
      sets.push(`"nashEquilibriumScore" = :nashScore`);
      params_list.push({
        name: "nashScore",
        value:
          nashEquilibriumScore != null
            ? { doubleValue: nashEquilibriumScore }
            : { isNull: true },
      });
    }

    const now = new Date().toISOString();
    sets.push(`"updatedAt" = :now`);
    params_list.push({ name: "now", value: stringField(now) });

    if (sets.length > 1) {
      await query(
        `UPDATE "Outcome" SET ${sets.join(", ")} WHERE "id" = :id`,
        params_list
      );
    }

    const updated = (
      await query(`SELECT * FROM "Outcome" WHERE "id" = :id`, [
        { name: "id", value: stringField(id) },
      ])
    ).records;

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Failed to update outcome:", error);
    return NextResponse.json(
      { error: "Failed to update outcome" },
      { status: 500 }
    );
  }
}

// DELETE /api/outcomes/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  try {
    const outcomes = (
      await query(
        `SELECT o.*, p."owner" as "predictionOwner" FROM "Outcome" o JOIN "Prediction" p ON o."predictionId" = p."id" WHERE o."id" = :id`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    if (outcomes.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (outcomes[0].predictionOwner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete forecasts for this outcome first
    await query(`DELETE FROM "Forecast" WHERE "outcomeId" = :id`, [
      { name: "id", value: stringField(id) },
    ]);
    await query(`DELETE FROM "Outcome" WHERE "id" = :id`, [
      { name: "id", value: stringField(id) },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete outcome:", error);
    return NextResponse.json(
      { error: "Failed to delete outcome" },
      { status: 500 }
    );
  }
}
