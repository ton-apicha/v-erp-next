import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkSuperAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    })

    if (!user || user.role.name !== 'SUPER_ADMIN') {
        return { error: 'Forbidden - SUPER_ADMIN only', status: 403 }
    }

    return { user }
}

// GET /api/admin/cms/sections/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params
    const section = await prisma.cmsSection.findUnique({ where: { id } })

    if (!section) {
        return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    return NextResponse.json(section)
}

// PUT /api/admin/cms/sections/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params

    try {
        const body = await request.json()
        const { contentTH, contentLA, order, isVisible } = body

        const section = await prisma.cmsSection.update({
            where: { id },
            data: {
                contentTH,
                contentLA,
                order,
                isVisible
            }
        })

        return NextResponse.json(section)
    } catch (error) {
        console.error('Error updating section:', error)
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/sections/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params

    try {
        await prisma.cmsSection.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting section:', error)
        return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
    }
}
