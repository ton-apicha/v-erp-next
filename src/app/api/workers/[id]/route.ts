import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workers/[id]
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const worker = await prisma.worker.findUnique({
            where: { id },
            include: {
                createdBy: { select: { name: true, email: true } },
                agent: true,
                client: true,
                documents: true,
            },
        })

        if (!worker) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 })
        }

        return NextResponse.json(worker)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT /api/workers/[id]
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        // Clean up data for update
        // We'll trust the body structure matches the creation, but handle nulls
        const updateData: any = { ...body }
        delete updateData.id
        delete updateData.workerId
        delete updateData.createdAt
        delete updateData.updatedAt
        delete updateData.createdBy

        const worker = await prisma.worker.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(worker)
    } catch (error) {
        console.error('Update Worker Error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' },
            { status: 500 }
        )
    }
}

// DELETE /api/workers/[id]
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await prisma.worker.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'ลบข้อมูลสำเร็จ' })
    } catch (error) {
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการลบข้อมูล' },
            { status: 500 }
        )
    }
}
