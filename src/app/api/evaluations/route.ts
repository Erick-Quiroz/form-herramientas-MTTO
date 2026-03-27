import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cuid from "cuid";

// GET all evaluations or GET by ID/technicianId
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const technicianId = searchParams.get("technicianId");

    if (id) {
      const evaluation = await prisma.evaluation.findUnique({
        where: { id },
        include: {
          evaluationItems: {
            include: {
              assignment: {
                include: { material: true },
              },
              tool: {
                include: { toolCatalog: true },
              },
              lockerTool: {
                include: { toolCatalog: true },
              },
            },
          },
          technician: true,
        },
      });

      if (!evaluation) {
        return NextResponse.json(
          { error: "Evaluación no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(evaluation);
    }

    if (technicianId) {
      const evaluations = await prisma.evaluation.findMany({
        where: { technicianId },
        include: {
          evaluationItems: {
            include: {
              assignment: {
                include: { material: true },
              },
              tool: {
                include: { toolCatalog: true },
              },
              lockerTool: {
                include: { toolCatalog: true },
              },
            },
          },
          technician: true,
        },
        orderBy: { date: "desc" },
      });

      return NextResponse.json(evaluations);
    }

    const evaluations = await prisma.evaluation.findMany({
      include: {
        evaluationItems: true,
        technician: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error("[GET /api/evaluations]", error);
    return NextResponse.json(
      { error: "Error al obtener evaluaciones" },
      { status: 500 }
    );
  }
}

// POST create evaluation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { technicianId, evaluatorName, observations, items } = body;

    if (!technicianId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Técnico e ítems de evaluación son requeridos" },
        { status: 400 }
      );
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        id: cuid(),
        technicianId,
        evaluatorName,
        observations: observations || null,
        evaluationItems: {
          createMany: {
            data: items.map(
              (item: {
                assignmentId?: string;
                toolId?: string;
                lockerToolId?: string;
                hasItem: boolean;
                isClean: boolean;
                quantityObserved?: number;
                complementObserved?: string;
                observations?: string;
              }) => {
                const mappedItem: any = {
                  id: cuid(),
                  hasItem: item.hasItem,
                  isClean: item.isClean,
                };

                // Only include fields that are defined
                if (item.assignmentId) mappedItem.assignmentId = item.assignmentId;
                if (item.toolId) mappedItem.toolId = item.toolId;
                if (item.lockerToolId) mappedItem.lockerToolId = item.lockerToolId;
                if (item.quantityObserved) mappedItem.quantityObserved = item.quantityObserved;
                if (item.complementObserved) mappedItem.complementObserved = item.complementObserved;
                if (item.observations) mappedItem.observations = item.observations;

                return mappedItem;
              }
            ),
          },
        },
      },
      include: {
        evaluationItems: {
          include: {
            assignment: {
              include: { material: true },
            },
            tool: {
              include: { toolCatalog: true },
            },
            lockerTool: {
              include: { toolCatalog: true },
            },
          },
        },
        technician: true,
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error) {
    console.error("[POST /api/evaluations]", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al crear evaluación", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE evaluation
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

    console.log("Eliminando evaluación con ID:", id);

    // Primero eliminar los evaluationItems asociados
    await prisma.evaluationItem.deleteMany({
      where: { evaluationId: id },
    });

    // Luego eliminar la evaluación
    const deleted = await prisma.evaluation.delete({
      where: { id },
    });

    console.log("Evaluación eliminada:", deleted.id);

    return NextResponse.json({ message: "Evaluación eliminada exitosamente", id });
  } catch (error) {
    console.error("[DELETE /api/evaluations]", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: "Error al eliminar evaluación", details: errorMessage },
      { status: 500 }
    );
  }
}
