import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string; toolId: string }> }
) {
  try {
    const { technicianId, lockerId, toolId } = await params;
    const body = await request.json();
    const { quantity, complement, partLabel } = body;

    const lockerTool = await prisma.lockerTool.findUnique({
      where: { id: toolId },
      include: { locker: true },
    });

    if (!lockerTool || lockerTool.locker.technicianId !== technicianId) {
      return NextResponse.json(
        { error: "Relación no encontrada" },
        { status: 404 }
      );
    }

    const updated = await prisma.lockerTool.update({
      where: { id: toolId },
      data: {
        quantity: quantity !== undefined ? quantity : lockerTool.quantity,
        complement: complement !== undefined ? complement : lockerTool.complement,
        partLabel: partLabel !== undefined ? partLabel : lockerTool.partLabel,
      },
      include: { toolCatalog: { include: { part: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(
      "[PUT /api/technicians/[technicianId]/lockers/[lockerId]/tools/[toolId]]",
      error
    );
    return NextResponse.json(
      { error: "Error al actualizar herramienta del casillero" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string; toolId: string }> }
) {
  try {
    const { technicianId, lockerId, toolId } = await params;
    const lockerTool = await prisma.lockerTool.findUnique({
      where: { id: toolId },
      include: { locker: true },
    });

    if (!lockerTool || lockerTool.locker.technicianId !== technicianId) {
      return NextResponse.json(
        { error: "Relación no encontrada" },
        { status: 404 }
      );
    }

    await prisma.lockerTool.delete({
      where: { id: toolId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "[DELETE /api/technicians/[technicianId]/lockers/[lockerId]/tools/[toolId]]",
      error
    );
    return NextResponse.json(
      { error: "Error al eliminar herramienta del casillero" },
      { status: 500 }
    );
  }
}
