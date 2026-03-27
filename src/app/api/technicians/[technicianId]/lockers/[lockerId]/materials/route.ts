import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string }> }
) {
  try {
    const { technicianId, lockerId } = await params;
    const { materialId, quantity } = await request.json();

    const lockerMaterial = await prisma.lockerMaterial.create({
      data: {
        id: `locker-material-${Date.now()}`,
        lockerId: lockerId,
        materialId: materialId,
        quantity: quantity || 1
      },
      include: { material: true }
    });

    return NextResponse.json(lockerMaterial, { status: 201 });
  } catch (error) {
    console.error('Error adding material to locker:', error);
    return NextResponse.json(
      { error: 'Error adding material to locker' },
      { status: 500 }
    );
  }
}
