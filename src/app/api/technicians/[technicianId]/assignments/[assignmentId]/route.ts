import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  {
    params
  }: {
    params: Promise<{ technicianId: string; assignmentId: string }>;
  }
) {
  const { technicianId, assignmentId } = await params;
  try {
    await prisma.assignment.delete({
      where: { id: assignmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Error deleting assignment' },
      { status: 500 }
    );
  }
}
