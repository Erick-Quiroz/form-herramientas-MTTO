import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

// GET all assignments or GET by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const technicianId = searchParams.get("technicianId");

    if (id) {
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          material: true,
          technician: true,
        },
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "Asignación no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(assignment);
    }

    if (technicianId) {
      const assignments = await prisma.assignment.findMany({
        where: { technicianId },
        include: {
          material: true,
          technician: true,
        },
      });

      return NextResponse.json(assignments);
    }

    const assignments = await prisma.assignment.findMany({
      include: {
        material: true,
        technician: true,
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("[GET /api/assignments]", error);
    return NextResponse.json(
      { error: "Error al obtener asignaciones" },
      { status: 500 }
    );
  }
}

// POST create assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technicianId, materialId } = body;

    if (!technicianId || !materialId) {
      return NextResponse.json(
        { error: "Técnico y material son requeridos" },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        id: cuid(),
        technicianId,
        materialId,
      },
      include: {
        material: true,
        technician: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error("[POST /api/assignments]", error);
    return NextResponse.json(
      { error: "Error al crear asignación" },
      { status: 500 }
    );
  }
}

// DELETE assignment
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

    await prisma.assignment.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Asignación eliminada" });
  } catch (error) {
    console.error("[DELETE /api/assignments]", error);
    return NextResponse.json(
      { error: "Error al eliminar asignación" },
      { status: 500 }
    );
  }
}
