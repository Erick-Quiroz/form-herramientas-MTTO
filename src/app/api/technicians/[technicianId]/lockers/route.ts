import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import cuid from 'cuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const lockers = await prisma.locker.findMany({
      where: { technicianId },
      include: {
        tools: {
          include: { toolCatalog: { include: { part: true } } },
        },
      },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(lockers);
  } catch (error) {
    console.error('Error fetching lockers:', error);
    return NextResponse.json({ error: 'Error fetching lockers' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ technicianId: string }> }
) {
  try {
    const { technicianId } = await params;
    const { location } = await request.json();

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
        technicianId
      },
      include: {
        tools: {
          include: { toolCatalog: true },
        },
      },
    });

    return NextResponse.json(locker, { status: 201 });
  } catch (error) {
    console.error('Error creating locker:', error);
    return NextResponse.json(
      { error: 'Error creating locker' },
      { status: 500 }
    );
  }
}
