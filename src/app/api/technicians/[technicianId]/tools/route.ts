import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const tools = await prisma.tool.findMany({
      where: { technicianId },
      include: {
        toolCatalog: true,
        part: true
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error("[GET /api/technicians/[technicianId]/tools]", error);
    return NextResponse.json(
      { error: "Error al obtener herramientas" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const body = await request.json();
    const { toolCatalogId, quantity = 1, complement, partLabel } = body;

    console.log('[POST /api/technicians/[technicianId]/tools] Recibido:', { toolCatalogId, quantity, complement, partLabel });

    if (!toolCatalogId) {
      return NextResponse.json(
        { error: "toolCatalogId es requerido" },
        { status: 400 }
      );
    }

    const tool = await prisma.tool.create({
      data: {
        id: cuid(),
        toolCatalogId,
        partLabel: partLabel || null,  // Guardar texto libre de la parte
        quantity: parseInt(quantity) || 1,
        complement: complement || null,
        technicianId,
      },
      include: {
        toolCatalog: true,
        part: true
      },
    });

    console.log('[POST] Tool creada con datos:', {
      id: tool.id,
      toolCatalogId: tool.toolCatalogId,
      quantity: tool.quantity,
      partLabel: tool.partLabel
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error("[POST /api/technicians/[technicianId]/tools]", error);
    return NextResponse.json(
      { error: "Error al crear herramienta" },
      { status: 500 }
    );
  }
}
