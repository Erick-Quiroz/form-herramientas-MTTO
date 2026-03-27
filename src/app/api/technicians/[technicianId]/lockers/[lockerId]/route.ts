import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string; lockerId: string }> }
) {
  try {
    const { lockerId } = await params;
    await prisma.locker.delete({
      where: { id: lockerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting locker:', error);
    return NextResponse.json(
      { error: 'Error deleting locker' },
      { status: 500 }
    );
  }
}
