import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest, requireAuth } from "@/lib/auth";

// GET /api/predictions/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await authenticateRequest(request);

  try {
    const prediction = await prisma.prediction.findUnique({
      where: { id },
      include: { outcomes: true, gameTheoryModel: true },
    });

    if (!prediction) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check access: public, owner, or admin
    if (
      prediction.visibility !== "PUBLIC" &&
      prediction.owner !== user?.sub &&
      !user?.isAdmin
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(prediction);
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
    const existing = await prisma.prediction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, category, status, visibility, resolutionDate } =
      body;

    const prediction = await prisma.prediction.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(status !== undefined && { status }),
        ...(visibility !== undefined && { visibility }),
        ...(resolutionDate !== undefined && { resolutionDate }),
      },
      include: { outcomes: true },
    });

    return NextResponse.json(prediction);
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
    const existing = await prisma.prediction.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cascade delete handles outcomes, forecasts, and game theory model
    await prisma.prediction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete prediction:", error);
    return NextResponse.json(
      { error: "Failed to delete prediction" },
      { status: 500 }
    );
  }
}
