import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    const where: { owner: string; predictionId?: string } = {
      owner: user.sub,
    };
    if (predictionId) {
      where.predictionId = predictionId;
    }

    const forecasts = await prisma.forecast.findMany({
      where,
      include: { outcome: true },
      orderBy: { createdAt: "desc" },
    });

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

    const forecast = await prisma.forecast.upsert({
      where: {
        owner_outcomeId: {
          owner: user.sub,
          outcomeId,
        },
      },
      update: {
        confidence,
        reasoning: reasoning ?? null,
      },
      create: {
        predictionId,
        outcomeId,
        confidence,
        reasoning: reasoning ?? null,
        owner: user.sub,
      },
    });

    return NextResponse.json(forecast, { status: 201 });
  } catch (error) {
    console.error("Failed to upsert forecast:", error);
    return NextResponse.json(
      { error: "Failed to save forecast" },
      { status: 500 }
    );
  }
}
