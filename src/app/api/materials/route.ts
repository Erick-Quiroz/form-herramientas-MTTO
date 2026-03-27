import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

// GET all materials or GET by ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (id) {
      const material = await prisma.material.findUnique({
        where: { id },
        include: {
          assignments: true,
        },
      });

      if (!material) {
        return NextResponse.json(
          { error: "Material no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(material);
    }

    const materials = await prisma.material.findMany({
      include: {
        assignments: true,
      },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error("[GET /api/materials]", error);
    return NextResponse.json(
      { error: "Error al obtener materiales" },
      { status: 500 }
    );
  }
}

// POST create material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, name, quantity, complement } = body;

    if (!category || !name || !quantity) {
      return NextResponse.json(
        { error: "Categoría, nombre y cantidad son requeridos" },
        { status: 400 }
      );
    }

    const material = await prisma.material.create({
      data: {
        id: cuid(),
        category,
        name,
        quantity,
        complement,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("[POST /api/materials]", error);
    return NextResponse.json(
      { error: "Error al crear material" },
      { status: 500 }
    );
  }
}

// PUT update material
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, category, name, quantity, complement } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    const material = await prisma.material.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(name && { name }),
        ...(quantity && { quantity }),
        ...(complement && { complement }),
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("[PUT /api/materials]", error);
    return NextResponse.json(
      { error: "Error al actualizar material" },
      { status: 500 }
    );
  }
}

// DELETE material
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

    await prisma.material.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Material eliminado" });
  } catch (error) {
    console.error("[DELETE /api/materials]", error);
    return NextResponse.json(
      { error: "Error al eliminar material" },
      { status: 500 }
    );
  }
}
