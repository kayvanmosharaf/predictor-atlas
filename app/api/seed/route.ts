import { NextResponse } from "next/server";
import { query, stringField, numberOrNull } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

interface SeedOutcome {
  label: string;
  probability?: number;
}

interface SeedPrediction {
  title: string;
  description: string;
  category?: string;
  status?: string;
  visibility?: string;
  resolutionDate?: string;
  outcomes: SeedOutcome[];
}

// POST /api/seed — admin-only bulk seed
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAdmin(request);
  } catch (res) {
    return res as Response;
  }

  try {
    const predictions: SeedPrediction[] = await request.json();

    if (!Array.isArray(predictions)) {
      return NextResponse.json(
        { error: "Body must be a JSON array of predictions" },
        { status: 400 }
      );
    }

    // Check for existing titles to skip duplicates
    const existingResult = (
      await query(`SELECT "title" FROM "Prediction"`)
    ).records;
    const existingTitles = new Set(existingResult.map((p) => p.title as string));

    let created = 0;
    let skipped = 0;

    for (const p of predictions) {
      if (!p.title || !p.description || !Array.isArray(p.outcomes)) {
        continue;
      }

      if (existingTitles.has(p.title)) {
        skipped++;
        continue;
      }

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await query(
        `INSERT INTO "Prediction" ("id", "title", "description", "category", "status", "visibility", "resolutionDate", "owner", "createdAt", "updatedAt")
         VALUES (:id, :title, :description, :category, :status, :visibility, :resolutionDate, :owner, :now, :now)`,
        [
          { name: "id", value: stringField(id) },
          { name: "title", value: stringField(p.title) },
          { name: "description", value: stringField(p.description) },
          {
            name: "category",
            value: stringField(p.category || "OTHER"),
          },
          { name: "status", value: stringField(p.status || "OPEN") },
          {
            name: "visibility",
            value: stringField(p.visibility || "PUBLIC"),
          },
          {
            name: "resolutionDate",
            value: p.resolutionDate
              ? stringField(p.resolutionDate)
              : { isNull: true },
          },
          { name: "owner", value: stringField(user.sub) },
          { name: "now", value: stringField(now) },
        ]
      );

      for (const o of p.outcomes) {
        await query(
          `INSERT INTO "Outcome" ("id", "predictionId", "label", "probability", "owner", "createdAt", "updatedAt")
           VALUES (:id, :predictionId, :label, :probability, :owner, :now, :now)`,
          [
            { name: "id", value: stringField(crypto.randomUUID()) },
            { name: "predictionId", value: stringField(id) },
            { name: "label", value: stringField(o.label) },
            { name: "probability", value: numberOrNull(o.probability) },
            { name: "owner", value: stringField(user.sub) },
            { name: "now", value: stringField(now) },
          ]
        );
      }

      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
