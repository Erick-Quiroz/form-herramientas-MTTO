import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

// GET all technicians or GET by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const technician = await prisma.technician.findUnique({
        where: { id },
        include: {
          assignments: {
            include: { material: true },
          },
          lockers: true,
        },
      });

      if (!technician) {
        return NextResponse.json(
          { error: "Técnico no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(technician);
    }

    const technicians = await prisma.technician.findMany({
      include: {
        assignments: {
          include: { material: true },
        },
        lockers: true,
      },
    });

    return NextResponse.json(technicians);
  } catch (error) {
    console.error("[GET /api/technicians]", error);
    return NextResponse.json(
      { error: "Error al obtener técnicos" },
      { status: 500 }
    );
  }
}

// POST create technician
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, initial, specialty, employeeCode } = body;

    if (!name || !specialty) {
      return NextResponse.json(
        { error: "Nombre y especialidad son requeridos" },
        { status: 400 }
      );
    }

    const technician = await (prisma.technician.create as any)({
      data: {
        id: cuid(),
        name,
        initial,
        specialty,
        employeeCode,
      },
    });

    return NextResponse.json(technician, { status: 201 });
  } catch (error) {
    console.error("[POST /api/technicians]", error);
    return NextResponse.json(
      { error: "Error al crear técnico" },
      { status: 500 }
    );
  }
}

// PUT update technician
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, initial, specialty, employeeCode } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    const technician = await prisma.technician.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(initial && { initial }),
        ...(specialty && { specialty }),
        ...(employeeCode && { employeeCode }),
      } as any,
    });

    return NextResponse.json(technician);
  } catch (error) {
    console.error("[PUT /api/technicians]", error);
    return NextResponse.json(
      { error: "Error al actualizar técnico" },
      { status: 500 }
    );
  }
}

// DELETE technician
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    await prisma.technician.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Técnico eliminado" });
  } catch (error) {
    console.error("[DELETE /api/technicians]", error);
    return NextResponse.json(
      { error: "Error al eliminar técnico" },
      { status: 500 }
    );
  }
}
