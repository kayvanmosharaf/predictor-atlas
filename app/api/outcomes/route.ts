import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    // Check prediction access
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
    });

    if (!prediction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (
      prediction.visibility !== "PUBLIC" &&
      prediction.owner !== user?.sub &&
      !user?.isAdmin
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const outcomes = await prisma.outcome.findMany({
      where: { predictionId },
      orderBy: { createdAt: "asc" },
    });

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

    // Verify prediction ownership
    const prediction = await prisma.prediction.findUnique({
      where: { id: predictionId },
    });
    if (!prediction) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 });
    }
    if (prediction.owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const outcome = await prisma.outcome.create({
      data: {
        predictionId,
        label: label.trim(),
        probability: probability ?? null,
        owner: user.sub,
      },
    });

    return NextResponse.json(outcome, { status: 201 });
  } catch (error) {
    console.error("Failed to create outcome:", error);
    return NextResponse.json(
      { error: "Failed to create outcome" },
      { status: 500 }
    );
  }
}
