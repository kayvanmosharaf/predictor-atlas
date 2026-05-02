import { NextResponse } from "next/server";
import { query, stringField } from "@/lib/db";
import { authenticateRequest } from "@/lib/auth";

function safeJsonParse(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

    const models = (
      await query(
        `SELECT * FROM "GameTheoryModel" WHERE "predictionId" = :id`,
        [{ name: "id", value: stringField(id) }]
      )
    ).records;

    if (models.length === 0) {
      return NextResponse.json({ error: "No analysis yet" }, { status: 404 });
    }

    const m = models[0];
    return NextResponse.json({
      players: safeJsonParse(m.players as string),
      nashEquilibria: safeJsonParse(m.nashEquilibria as string),
      dominantStrategies: safeJsonParse(m.dominantStrategies as string),
      analysis: m.analysis ?? "",
      updatedAt: m.updatedAt,
    });
  } catch (error) {
    console.error("Failed to fetch analysis:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}
