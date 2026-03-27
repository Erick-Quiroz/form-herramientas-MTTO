import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;

    const technician = await prisma.technician.findUnique({
      where: { id: technicianId },
      include: {
        assignments: {
          include: { material: true },
        },
        lockers: {
          include: {
            tools: {
              include: { toolCatalog: { include: { part: true } } },
            },
          },
        },
        tools: {
          include: { toolCatalog: { include: { part: true } } },
        },
      },
    });

    if (!technician) {
      return NextResponse.json(
        { error: "Técnico no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(technician);
  } catch (error) {
    console.error("[GET /api/technicians/[technicianId]]", error);
    return NextResponse.json(
      { error: "Error al obtener técnico" },
      { status: 500 }
    );
  }
}

// PUT update technician
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const body = await request.json();
    const { name, specialty, employeeCode } = body;

    const technician = await prisma.technician.update({
      where: { id: technicianId },
      data: {
        ...(name && { name }),
        ...(specialty && { specialty }),
        ...(employeeCode && { employeeCode }),
      },
    });

    return NextResponse.json(technician);
  } catch (error) {
    console.error("[PUT /api/technicians/[technicianId]]", error);
    return NextResponse.json(
      { error: "Error al actualizar técnico" },
      { status: 500 }
    );
  }
}

// DELETE technician
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;

    await prisma.technician.delete({
      where: { id: technicianId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/technicians/[technicianId]]", error);
    return NextResponse.json(
      { error: "Error al eliminar técnico" },
      { status: 500 }
    );
  }
}
