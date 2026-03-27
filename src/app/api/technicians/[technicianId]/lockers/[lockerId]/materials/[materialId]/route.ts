import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ technicianId: string; lockerId: string; materialId: string }>;
  }
) {
  try {
    const { lockerId, materialId } = await params;
    await prisma.lockerMaterial.deleteMany({
      where: {
        lockerId,
        materialId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing material from locker:', error);
    return NextResponse.json(
      { error: 'Error removing material from locker' },
      { status: 500 }
    );
  }
}
