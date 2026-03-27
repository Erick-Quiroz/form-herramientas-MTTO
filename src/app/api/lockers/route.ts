import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

// GET all lockers or GET by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const locker = await prisma.locker.findUnique({
        where: { id },
        include: { technician: true },
      });

      if (!locker) {
        return NextResponse.json(
          { error: "Casillero no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(locker);
    }

    const lockers = await prisma.locker.findMany({
      include: { technician: true },
    });

    return NextResponse.json(lockers);
  } catch (error) {
    console.error("[GET /api/lockers]", error);
    return NextResponse.json(
      { error: "Error al obtener casilleros" },
      { status: 500 }
    );
  }
}

// POST create locker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, technicianId } = body;

    // Get the count of existing lockers for this technician
    const count = await prisma.locker.count({
      where: { technicianId },
    });

    // Auto-generate locker number and name
    const number = count + 1;
    const name = `CASILLERO-${String(number).padStart(3, '0')}`;

    const locker = await prisma.locker.create({
      data: {
        id: cuid(),
        number,
        name,
        location,
        technicianId,
      },
      include: { technician: true },
    });

    return NextResponse.json(locker, { status: 201 });
  } catch (error) {
    console.error("[POST /api/lockers]", error);
    return NextResponse.json(
      { error: "Error al crear casillero" },
      { status: 500 }
    );
  }
}

// PUT update locker
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, code, location, technicianId } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    const locker = await prisma.locker.update({
      where: { id },
      data: {
        ...(location && { location }),
        ...(technicianId && { technicianId }),
      },
      include: { technician: true },
    });

    return NextResponse.json(locker);
  } catch (error) {
    console.error("[PUT /api/lockers]", error);
    return NextResponse.json(
      { error: "Error al actualizar casillero" },
      { status: 500 }
    );
  }
}

// DELETE locker
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

    await prisma.locker.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Casillero eliminado" });
  } catch (error) {
    console.error("[DELETE /api/lockers]", error);
    return NextResponse.json(
      { error: "Error al eliminar casillero" },
      { status: 500 }
    );
  }
}
