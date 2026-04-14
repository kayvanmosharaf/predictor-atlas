import { NextResponse } from "next/server";
import { query, stringField, stringOrNull } from "@/lib/db";
import { authenticateRequest, requireAuth } from "@/lib/auth";

// GET /api/predictions?scope=public|mine|all
export async function GET(request: Request) {
  const user = await authenticateRequest(request);
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "public";

  try {
    let predictions;

    if (scope === "all") {
      if (!user?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      predictions = (
        await query(
          `SELECT * FROM "Prediction" ORDER BY "createdAt" DESC`
        )
      ).records;
    } else if (scope === "mine") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      predictions = (
        await query(
          `SELECT * FROM "Prediction" WHERE "owner" = :owner ORDER BY "createdAt" DESC`,
          [{ name: "owner", value: stringField(user.sub) }]
        )
      ).records;
    } else {
      // scope === "public" (default, no auth required)
      predictions = (
        await query(
          `SELECT * FROM "Prediction" WHERE "visibility" = 'PUBLIC' AND "status" = 'OPEN' ORDER BY "createdAt" DESC`
        )
      ).records;
    }

    // Fetch outcomes for all predictions
    const predictionIds = predictions.map((p) => p.id as string);
    if (predictionIds.length > 0) {
      const placeholders = predictionIds.map((_, i) => `:id${i}`).join(", ");
      const params = predictionIds.map((id, i) => ({
        name: `id${i}`,
        value: stringField(id),
      }));
      const outcomes = (
        await query(
          `SELECT * FROM "Outcome" WHERE "predictionId" IN (${placeholders}) ORDER BY "createdAt" ASC`,
          params
        )
      ).records;

      const outcomeMap = new Map<string, typeof outcomes>();
      for (const o of outcomes) {
        const pid = o.predictionId as string;
        if (!outcomeMap.has(pid)) outcomeMap.set(pid, []);
        outcomeMap.get(pid)!.push(o);
      }
      for (const p of predictions) {
        (p as Record<string, unknown>).outcomes =
          outcomeMap.get(p.id as string) ?? [];
      }
    }

    return NextResponse.json(predictions);
  } catch (error) {
    console.error("Failed to fetch predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch predictions" },
      { status: 500 }
    );
  }
}

// POST /api/predictions
export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as Response;
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      status,
      visibility,
      resolutionDate,
      outcomes,
    } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await query(
      `INSERT INTO "Prediction" ("id", "title", "description", "category", "status", "visibility", "resolutionDate", "owner", "createdAt", "updatedAt")
       VALUES (:id, :title, :description, :category, :status, :visibility, :resolutionDate, :owner, :now, :now)`,
      [
        { name: "id", value: stringField(id) },
        { name: "title", value: stringField(title.trim()) },
        { name: "description", value: stringField(description.trim()) },
        { name: "category", value: stringField(category || "OTHER") },
        { name: "status", value: stringField(status || "OPEN") },
        { name: "visibility", value: stringField(visibility || "PRIVATE") },
        { name: "resolutionDate", value: stringOrNull(resolutionDate) },
        { name: "owner", value: stringField(user.sub) },
        { name: "now", value: stringField(now) },
      ]
    );

    // Create outcomes if provided
    const createdOutcomes = [];
    if (outcomes?.length) {
      for (const o of outcomes as {
        label: string;
        probability?: number;
      }[]) {
        const oid = crypto.randomUUID();
        await query(
          `INSERT INTO "Outcome" ("id", "predictionId", "label", "probability", "owner", "createdAt", "updatedAt")
           VALUES (:id, :predictionId, :label, :probability, :owner, :now, :now)`,
          [
            { name: "id", value: stringField(oid) },
            { name: "predictionId", value: stringField(id) },
            { name: "label", value: stringField(o.label.trim()) },
            {
              name: "probability",
              value:
                o.probability != null
                  ? { doubleValue: o.probability }
                  : { isNull: true },
            },
            { name: "owner", value: stringField(user.sub) },
            { name: "now", value: stringField(now) },
          ]
        );
        createdOutcomes.push({
          id: oid,
          predictionId: id,
          label: o.label.trim(),
          probability: o.probability ?? null,
          owner: user.sub,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    const prediction = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: category || "OTHER",
      status: status || "OPEN",
      visibility: visibility || "PRIVATE",
      resolutionDate: resolutionDate || null,
      owner: user.sub,
      createdAt: now,
      updatedAt: now,
      outcomes: createdOutcomes,
    };

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error("Failed to create prediction:", error);
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    );
  }
}
