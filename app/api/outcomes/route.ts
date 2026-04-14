import { NextResponse } from "next/server";
import { query, stringField, numberOrNull } from "@/lib/db";
import { authenticateRequest, requireAuth } from "@/lib/auth";

// GET /api/outcomes?predictionId=xxx
export async function GET(request: Request) {
  const user = await authenticateRequest(request);
  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get("predictionId");

  if (!predictionId) {
    return NextResponse.json(
      { error: "predictionId is required" },
      { status: 400 }
    );
  }

  try {
    const predictions = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(predictionId) },
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

    const outcomes = (
      await query(
        `SELECT * FROM "Outcome" WHERE "predictionId" = :predictionId ORDER BY "createdAt" ASC`,
        [{ name: "predictionId", value: stringField(predictionId) }]
      )
    ).records;

    return NextResponse.json(outcomes);
  } catch (error) {
    console.error("Failed to fetch outcomes:", error);
    return NextResponse.json(
      { error: "Failed to fetch outcomes" },
      { status: 500 }
    );
  }
}

// POST /api/outcomes
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await request.json();
    const { predictionId, label, probability } = body;

    if (!predictionId || !label?.trim()) {
      return NextResponse.json(
        { error: "predictionId and label are required" },
        { status: 400 }
      );
    }

    const predictions = (
      await query(`SELECT * FROM "Prediction" WHERE "id" = :id`, [
        { name: "id", value: stringField(predictionId) },
      ])
    ).records;

    if (predictions.length === 0) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 }
      );
    }
    if (predictions[0].owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await query(
      `INSERT INTO "Outcome" ("id", "predictionId", "label", "probability", "owner", "createdAt", "updatedAt")
       VALUES (:id, :predictionId, :label, :probability, :owner, :now, :now)`,
      [
        { name: "id", value: stringField(id) },
        { name: "predictionId", value: stringField(predictionId) },
        { name: "label", value: stringField(label.trim()) },
        { name: "probability", value: numberOrNull(probability) },
        { name: "owner", value: stringField(user.sub) },
        { name: "now", value: stringField(now) },
      ]
    );

    return NextResponse.json(
      {
        id,
        predictionId,
        label: label.trim(),
        probability: probability ?? null,
        owner: user.sub,
        createdAt: now,
        updatedAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create outcome:", error);
    return NextResponse.json(
      { error: "Failed to create outcome" },
      { status: 500 }
    );
  }
}
