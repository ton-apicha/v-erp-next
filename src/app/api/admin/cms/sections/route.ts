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

// GET /api/admin/cms/sections
export async function GET(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('pageId')

    if (!pageId) {
        return NextResponse.json({ error: 'pageId is required' }, { status: 400 })
    }

    const sections = await prisma.cmsSection.findMany({
        where: { pageId },
        orderBy: { order: 'asc' }
    })

    return NextResponse.json(sections)
}

// POST /api/admin/cms/sections
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { pageId, key, contentTH, contentLA, order, isVisible } = body

        if (!pageId || !key || !contentTH) {
            return NextResponse.json(
                { error: 'pageId, key, and contentTH are required' },
                { status: 400 }
            )
        }

        let newOrder = order
        if (newOrder === undefined) {
            const maxOrder = await prisma.cmsSection.findFirst({
                where: { pageId },
                orderBy: { order: 'desc' },
                select: { order: true }
            })
            newOrder = (maxOrder?.order || 0) + 1
        }

        const section = await prisma.cmsSection.create({
            data: {
                pageId,
                key,
                contentTH,
                contentLA,
                order: newOrder,
                isVisible: isVisible ?? true
            }
        })

        return NextResponse.json(section, { status: 201 })
    } catch (error) {
        console.error('Error creating section:', error)
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
    }
}

// PUT /api/admin/cms/sections - Bulk reorder
export async function PUT(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { items } = body as { items: { id: string; order: number }[] }

        await prisma.$transaction(
            items.map((item) =>
                prisma.cmsSection.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering sections:', error)
        return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 })
    }
}
