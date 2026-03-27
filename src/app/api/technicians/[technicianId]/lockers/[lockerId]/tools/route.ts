import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string }> }
) {
  try {
    const { technicianId, lockerId } = await params;
    const tools = await prisma.lockerTool.findMany({
      where: {
        lockerId,
        locker: { technicianId },
      },
      include: { toolCatalog: { include: { part: true } } },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error("[GET /api/technicians/[technicianId]/lockers/[lockerId]/tools]", error);
    return NextResponse.json(
      { error: "Error al obtener herramientas del casillero" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string }> }
) {
  try {
    const { technicianId, lockerId } = await params;
    const body = await request.json();
    const { toolCatalogId, quantity = 1, complement, partLabel } = body;

    if (!toolCatalogId) {
      return NextResponse.json(
        { error: "toolCatalogId es requerido" },
        { status: 400 }
      );
    }

    // Verify the locker belongs to the technician
    const locker = await prisma.locker.findUnique({
      where: { id: lockerId },
    });

    if (!locker || locker.technicianId !== technicianId) {
      return NextResponse.json(
        { error: "Casillero no encontrado" },
        { status: 404 }
      );
    }

    // Verify the tool exists
    const tool = await prisma.toolCatalog.findUnique({
      where: { id: toolCatalogId },
    });

    if (!tool) {
      return NextResponse.json(
        { error: "Herramienta no encontrada" },
        { status: 404 }
      );
    }

    const lockerTool = await prisma.lockerTool.create({
      data: {
        id: cuid(),
        lockerId,
        toolCatalogId,
        partLabel: partLabel || null,
        quantity: parseInt(quantity) || 1,
        complement: complement || null,
      },
      include: { toolCatalog: { include: { part: true } } },
    });

    return NextResponse.json(lockerTool, { status: 201 });
  } catch (error) {
    console.error("[POST /api/technicians/[technicianId]/lockers/[lockerId]/tools]", error);
    return NextResponse.json(
      { error: "Error al agregar herramienta al casillero" },
      { status: 500 }
    );
  }
}
