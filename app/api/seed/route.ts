import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const existingTitles = new Set(
      (await prisma.prediction.findMany({ select: { title: true } })).map(
        (p) => p.title
      )
    );

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

      await prisma.prediction.create({
        data: {
          title: p.title,
          description: p.description,
          category: (p.category as "POLITICS" | "ECONOMICS" | "SPORTS" | "GEOPOLITICS" | "TECHNOLOGY" | "OTHER") || "OTHER",
          status: (p.status as "OPEN" | "CLOSED" | "RESOLVED") || "OPEN",
          visibility: (p.visibility as "PRIVATE" | "PUBLIC") || "PUBLIC",
          resolutionDate: p.resolutionDate || null,
          owner: user.sub,
          outcomes: {
            create: p.outcomes.map((o) => ({
              label: o.label,
              probability: o.probability ?? null,
              owner: user.sub,
            })),
          },
        },
      });
      created++;
    }

    return NextResponse.json({ created, skipped });
  } catch (error) {
    console.error("Seed failed:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
