import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, requireAuth } from "@/lib/auth";

// GET /api/predictions?scope=public|mine|all
export async function GET(request: Request) {
  const user = await authenticateRequest(request);
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get("scope") ?? "public";

  try {
    if (scope === "all") {
      if (!user?.isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const predictions = await prisma.prediction.findMany({
        include: { outcomes: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(predictions);
    }

    if (scope === "mine") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const predictions = await prisma.prediction.findMany({
        where: { owner: user.sub },
        include: { outcomes: true },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(predictions);
    }

    // scope === "public" (default, no auth required)
    const predictions = await prisma.prediction.findMany({
      where: { visibility: "PUBLIC", status: "OPEN" },
      include: { outcomes: true },
      orderBy: { createdAt: "desc" },
    });
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
    const { title, description, category, status, visibility, resolutionDate, outcomes } = body;

    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const prediction = await prisma.prediction.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category || "OTHER",
        status: status || "OPEN",
        visibility: visibility || "PRIVATE",
        resolutionDate: resolutionDate || null,
        owner: user.sub,
        outcomes: outcomes?.length
          ? {
              create: outcomes.map(
                (o: { label: string; probability?: number }) => ({
                  label: o.label.trim(),
                  probability: o.probability ?? null,
                  owner: user.sub,
                })
              ),
            }
          : undefined,
      },
      include: { outcomes: true },
    });

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error("Failed to create prediction:", error);
    return NextResponse.json(
      { error: "Failed to create prediction" },
      { status: 500 }
    );
  }
}
