import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; toolId: string }> }
) {
  try {
    const { technicianId, toolId } = await params;
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool || tool.technicianId !== technicianId) {
      return NextResponse.json(
        { error: "Herramienta no encontrada" },
        { status: 404 }
      );
    }

    await prisma.tool.delete({
      where: { id: toolId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/technicians/[technicianId]/tools/[toolId]]", error);
    return NextResponse.json(
      { error: "Error al eliminar herramienta" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; toolId: string }> }
) {
  try {
    const { technicianId, toolId } = await params;
    const body = await request.json();
    const { quantity, complement, partLabel } = body;

    console.log('[PUT /api/technicians/[technicianId]/tools/[toolId]]', {
      toolId,
      technicianId,
      quantity,
      complement,
      partLabel
    });

    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
    });

    if (!tool || tool.technicianId !== technicianId) {
      return NextResponse.json(
        { error: "Herramienta no encontrada" },
        { status: 404 }
      );
    }

    console.log('[PUT] Current tool data:', {
      id: tool.id,
      partLabel: tool.partLabel,
      quantity: tool.quantity,
      complement: tool.complement
    });

    const updatedTool = await prisma.tool.update({
      where: { id: toolId },
      data: {
        quantity: quantity !== undefined ? quantity : tool.quantity,
        complement: complement !== undefined ? complement : tool.complement,
        partLabel: partLabel !== undefined ? partLabel : tool.partLabel,
      },
      include: {
        toolCatalog: true,
        part: true
      },
    });

    console.log('[PUT] Updated tool:', {
      id: updatedTool.id,
      partLabel: updatedTool.partLabel,
      quantity: updatedTool.quantity,
      complement: updatedTool.complement
    });

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error("[PUT /api/technicians/[technicianId]/tools/[toolId]]", error);
    return NextResponse.json(
      { error: "Error al actualizar herramienta" },
      { status: 500 }
    );
  }
}
