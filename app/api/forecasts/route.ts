import { NextResponse } from "next/server";
import { query, stringField, numberOrNull, stringOrNull } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET /api/forecasts?predictionId=xxx (optional filter)
export async function GET(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get("predictionId");

  try {
    let forecasts;
    if (predictionId) {
      forecasts = (
        await query(
          `SELECT f.*, row_to_json(o.*) as "outcome"
           FROM "Forecast" f
           JOIN "Outcome" o ON f."outcomeId" = o."id"
           WHERE f."owner" = :owner AND f."predictionId" = :predictionId
           ORDER BY f."createdAt" DESC`,
          [
            { name: "owner", value: stringField(user.sub) },
            { name: "predictionId", value: stringField(predictionId) },
          ]
        )
      ).records;
    } else {
      forecasts = (
        await query(
          `SELECT f.*, row_to_json(o.*) as "outcome"
           FROM "Forecast" f
           JOIN "Outcome" o ON f."outcomeId" = o."id"
           WHERE f."owner" = :owner
           ORDER BY f."createdAt" DESC`,
          [{ name: "owner", value: stringField(user.sub) }]
        )
      ).records;
    }

    // Parse the outcome JSON string from row_to_json
    for (const f of forecasts) {
      if (typeof f.outcome === "string") {
        f.outcome = JSON.parse(f.outcome);
      }
    }

    return NextResponse.json(forecasts);
  } catch (error) {
    console.error("Failed to fetch forecasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecasts" },
      { status: 500 }
    );
  }
}

// POST /api/forecasts — upsert a forecast
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await request.json();
    const { predictionId, outcomeId, confidence, reasoning } = body;

    if (!predictionId || !outcomeId || confidence === undefined) {
      return NextResponse.json(
        { error: "predictionId, outcomeId, and confidence are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if forecast exists for this owner+outcome
    const existing = (
      await query(
        `SELECT * FROM "Forecast" WHERE "owner" = :owner AND "outcomeId" = :outcomeId`,
        [
          { name: "owner", value: stringField(user.sub) },
          { name: "outcomeId", value: stringField(outcomeId) },
        ]
      )
    ).records;

    let forecast;
    if (existing.length > 0) {
      // Update
      await query(
        `UPDATE "Forecast" SET "confidence" = :confidence, "reasoning" = :reasoning, "updatedAt" = :now
         WHERE "owner" = :owner AND "outcomeId" = :outcomeId`,
        [
          { name: "confidence", value: confidence },
          { name: "reasoning", value: stringOrNull(reasoning) },
          { name: "now", value: stringField(now) },
          { name: "owner", value: stringField(user.sub) },
          { name: "outcomeId", value: stringField(outcomeId) },
        ]
      );
      forecast = { ...existing[0], confidence, reasoning: reasoning ?? null, updatedAt: now };
    } else {
      // Insert
      const id = crypto.randomUUID();
      await query(
        `INSERT INTO "Forecast" ("id", "predictionId", "outcomeId", "confidence", "reasoning", "owner", "createdAt", "updatedAt")
         VALUES (:id, :predictionId, :outcomeId, :confidence, :reasoning, :owner, :now, :now)`,
        [
          { name: "id", value: stringField(id) },
          { name: "predictionId", value: stringField(predictionId) },
          { name: "outcomeId", value: stringField(outcomeId) },
          { name: "confidence", value: confidence },
          { name: "reasoning", value: stringOrNull(reasoning) },
          { name: "owner", value: stringField(user.sub) },
          { name: "now", value: stringField(now) },
        ]
      );
      forecast = {
        id,
        predictionId,
        outcomeId,
        confidence,
        reasoning: reasoning ?? null,
        owner: user.sub,
        createdAt: now,
        updatedAt: now,
      };
    }

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    console.error("Failed to upsert forecast:", error);
    return NextResponse.json(
      { error: "Failed to save forecast" },
      { status: 500 }
    );
  }
}
