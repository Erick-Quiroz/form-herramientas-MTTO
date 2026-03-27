import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import cuid from 'cuid';

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const search = url.searchParams.get('search');
        const partId = url.searchParams.get('partId');

        const where: any = {};
        if (search) {
            const trimmedSearch = search.trim();
            where.item = { contains: trimmedSearch, mode: 'insensitive' };
        }
        if (partId) {
            where.partId = partId;
        }

        const tools = await prisma.toolCatalog.findMany({
            where,
            orderBy: { item: 'asc' }
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Error fetching tools:', error);
        return NextResponse.json({ error: 'Error fetching tools' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { item } = body;

        if (!item || !item.trim()) {
            return NextResponse.json(
                { error: 'El nombre de la herramienta es requerido' },
                { status: 400 }
            );
        }

        const trimmedItem = item.trim();

        // Check if tool already exists (case insensitive)
        const existingTool = await (prisma.toolCatalog.findFirst as any)({
            where: {
                item: {
                    equals: trimmedItem,
                    mode: 'insensitive'
                }
            }
        });

        if (existingTool) {
            return NextResponse.json(
                { error: 'Esta herramienta ya existe' },
                { status: 400 }
            );
        }

        const newId = cuid();

        const tool = await prisma.toolCatalog.create({
            data: {
                id: newId,
                item: trimmedItem
                // partId es opcional - se asigna cuando se usa en técnico/casillero
            }
        });

        return NextResponse.json(tool, { status: 201 });
    } catch (error) {
        console.error('[POST /api/tools] Error:', error);

        // Proporcionar más detalles del error
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }

        return NextResponse.json(
            { error: 'Error al crear la herramienta. Intenta nuevamente.' },
            { status: 500 }
        );
    }
}
