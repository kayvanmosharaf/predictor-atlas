import { NextResponse } from "next/server";
import { query, stringField } from "@/lib/db";
import { authenticateRequest, requireAuth } from "@/lib/auth";

// GET /api/predictions/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await authenticateRequest(request);

  try {
    const predictions = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(id) },
      ])
    ).records;

    if (predictions.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prediction = predictions[0];

    if (
      prediction.visibility !== "PUBLIC" &&
      prediction.owner !== user?.sub &&
      !user?.isAdmin
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Fetch outcomes
    const outcomes = (
      await query(
        `SELECT * FROM "Outcome" WHERE "predictionId" = :id ORDER BY "createdAt" ASC`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    // Fetch game theory model
    const models = (
      await query(
        `SELECT * FROM "GameTheoryModel" WHERE "predictionId" = :id`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    return NextResponse.json({
      ...prediction,
      outcomes,
      gameTheoryModel: models[0] ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch prediction:", error);
    return NextResponse.json(
      { error: "Failed to fetch prediction" },
      { status: 500 }
    );
  }
}

// PATCH /api/predictions/[id]
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
    const existing = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(id) },
      ])
    ).records;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing[0].owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, status, visibility, resolutionDate } =
      body;

    const sets: string[] = [];
    const params_list: { name: string; value: import("@/lib/db").ParamValue }[] = [
      { name: "id", value: stringField(id) },
    ];

    if (title !== undefined) {
      sets.push(`"title" = :title`);
      params_list.push({ name: "title", value: stringField(title) });
    }
    if (description !== undefined) {
      sets.push(`"description" = :description`);
      params_list.push({ name: "description", value: stringField(description) });
    }
    if (category !== undefined) {
      sets.push(`"category" = :category`);
      params_list.push({ name: "category", value: stringField(category) });
    }
    if (status !== undefined) {
      sets.push(`"status" = :status`);
      params_list.push({ name: "status", value: stringField(status) });
    }
    if (visibility !== undefined) {
      sets.push(`"visibility" = :visibility`);
      params_list.push({ name: "visibility", value: stringField(visibility) });
    }
    if (resolutionDate !== undefined) {
      sets.push(`"resolutionDate" = :resolutionDate`);
      params_list.push({
        name: "resolutionDate",
        value: resolutionDate ?? null,
      });
    }

    const now = new Date().toISOString();
    sets.push(`"updatedAt" = :now`);
    params_list.push({ name: "now", value: stringField(now) });

    if (sets.length > 1) {
      await query(
        `UPDATE "Prediction" SET ${sets.join(", ")} WHERE "id" = :id`,
        params_list
      );
    }

    // Return updated prediction with outcomes
    const updated = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(id) },
      ])
    ).records;
    const outcomes = (
      await query(
        `SELECT * FROM "Outcome" WHERE "predictionId" = :id ORDER BY "createdAt" ASC`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    return NextResponse.json({ ...updated[0], outcomes });
  } catch (error) {
    console.error("Failed to update prediction:", error);
    return NextResponse.json(
      { error: "Failed to update prediction" },
      { status: 500 }
    );
  }
}

// DELETE /api/predictions/[id]
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
    const existing = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(id) },
      ])
    ).records;

    if (existing.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing[0].owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cascade: delete forecasts, outcomes, game theory model, then prediction
    await query(`DELETE FROM "Forecast" WHERE "predictionId" = :id`, [
      { name: "id", value: stringField(id) },
    ]);
    await query(`DELETE FROM "GameTheoryModel" WHERE "predictionId" = :id`, [
      { name: "id", value: stringField(id) },
    ]);
    await query(`DELETE FROM "Outcome" WHERE "predictionId" = :id`, [
      { name: "id", value: stringField(id) },
    ]);
    await query(`DELETE FROM "Prediction" WHERE "id" = :id`, [
      { name: "id", value: stringField(id) },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete prediction:", error);
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 }
    );
  }
}
