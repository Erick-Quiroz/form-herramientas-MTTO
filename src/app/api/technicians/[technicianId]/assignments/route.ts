import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const assignments = await prisma.assignment.findMany({
      where: { technicianId },
      include: { material: true },
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      material: assignment.material
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Error fetching assignments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const { materialId } = await request.json();

    const assignment = await prisma.assignment.create({
      data: {
        id: `${technicianId}-${materialId}`,
        technicianId,
        materialId: materialId
      },
      include: { material: true }
    });

    return NextResponse.json(
      {
        id: assignment.id,
        material: assignment.material
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Error creating assignment' },
      { status: 500 }
    );
  }
}
