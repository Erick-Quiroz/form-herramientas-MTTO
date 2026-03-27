import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check if parts already exist
    const existingParts = await prisma.part.count();
    
    if (existingParts > 0) {
      return NextResponse.json(
        { message: "Las partes ya fueron inicializadas" },
        { status: 200 }
      );
    }

    // Create the parts
    const parts = await Promise.all([
      prisma.part.create({
        data: {
          id: "part-a",
          level: "A",
          label: "A - Nivel 1",
          color: "#90EE90" // Light green
        }
      }),
      prisma.part.create({
        data: {
          id: "part-b",
          level: "B",
          label: "B - Nivel 2",
          color: "#FFA500" // Orange
        }
      }),
      prisma.part.create({
        data: {
          id: "part-c",
          level: "C",
          label: "C - Parte Inferior",
          color: "#87CEEB" // Sky blue
        }
      }),
      prisma.part.create({
        data: {
          id: "part-d",
          level: "D",
          label: "D - Nivel 2",
          color: "#FFA500" // Orange
        }
      }),
      prisma.part.create({
        data: {
          id: "part-e",
          level: "E",
          label: "E - Nivel 1",
          color: "#90EE90" // Light green
        }
      })
    ]);

    return NextResponse.json(
      { message: "Partes inicializadas correctamente", parts },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/init/parts]", error);
    return NextResponse.json(
      { error: "Error al inicializar partes" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const parts = await prisma.part.findMany({
      orderBy: { level: "asc" }
    });

    return NextResponse.json(parts);
  } catch (error) {
    console.error("[GET /api/init/parts]", error);
    return NextResponse.json(
      { error: "Error al obtener partes" },
      { status: 500 }
    );
  }
}
