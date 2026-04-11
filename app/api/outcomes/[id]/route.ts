import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PATCH /api/outcomes/[id]
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
    const existing = await prisma.outcome.findUnique({
      where: { id },
      include: { prediction: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.prediction.owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { label, probability, nashEquilibriumScore } = body;

    const outcome = await prisma.outcome.update({
      where: { id },
      data: {
        ...(label !== undefined && { label }),
        ...(probability !== undefined && { probability }),
        ...(nashEquilibriumScore !== undefined && { nashEquilibriumScore }),
      },
    });

    return NextResponse.json(outcome);
  } catch (error) {
    console.error("Failed to update outcome:", error);
    return NextResponse.json(
      { error: "Failed to update outcome" },
      { status: 500 }
    );
  }
}

// DELETE /api/outcomes/[id]
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
    const existing = await prisma.outcome.findUnique({
      where: { id },
      include: { prediction: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (existing.prediction.owner !== user.sub && !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.outcome.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete outcome:", error);
    return NextResponse.json(
      { error: "Failed to delete outcome" },
      { status: 500 }
    );
  }
}
