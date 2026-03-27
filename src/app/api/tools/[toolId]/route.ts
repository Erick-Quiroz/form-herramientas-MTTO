import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ toolId: string }> }
) {
    try {
        const { toolId } = await params;

        await prisma.toolCatalog.delete({
            where: { id: toolId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tool:', error);
        return NextResponse.json({ error: 'Error deleting tool' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ toolId: string }> }
) {
    try {
        const { toolId } = await params;

        const tool = await prisma.toolCatalog.findUnique({
            where: { id: toolId },
            include: { part: true }
        });

        if (!tool) {
            return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
        }

        return NextResponse.json(tool);
    } catch (error) {
        console.error('Error fetching tool:', error);
        return NextResponse.json({ error: 'Error fetching tool' }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ toolId: string }> }
) {
    try {
        const { toolId } = await params;
        const body = await req.json();
        const { item } = body;

        if (!item || !item.trim()) {
            return NextResponse.json(
                { error: 'Tool name is required' },
                { status: 400 }
            );
        }

        const trimmedItem = item.trim();

        // Check if tool with new name already exists (excluding current tool)
        const existingTool = await prisma.toolCatalog.findFirst({
            where: {
                item: trimmedItem,
                id: { not: toolId }
            }
        });

        if (existingTool) {
            return NextResponse.json(
                { error: 'This tool name already exists' },
                { status: 400 }
            );
        }

        const updatedTool = await prisma.toolCatalog.update({
            where: { id: toolId },
            data: { item: trimmedItem }
        });

        return NextResponse.json(updatedTool);
    } catch (error) {
        console.error('Error updating tool:', error);
        return NextResponse.json(
            { error: 'Error updating tool' },
            { status: 500 }
        );
    }
}
