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

// GET /api/admin/cms/partners
export async function GET() {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const partners = await prisma.cmsPartner.findMany({
        orderBy: { order: 'asc' }
    })

    return NextResponse.json(partners)
}

// POST /api/admin/cms/partners
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { name, logoUrl, websiteUrl, order, isActive } = body

        if (!name || !logoUrl) {
            return NextResponse.json({ error: 'name and logoUrl are required' }, { status: 400 })
        }

        let newOrder = order
        if (newOrder === undefined) {
            const maxOrder = await prisma.cmsPartner.findFirst({
                orderBy: { order: 'desc' },
                select: { order: true }
            })
            newOrder = (maxOrder?.order || 0) + 1
        }

        const partner = await prisma.cmsPartner.create({
            data: {
                name,
                logoUrl,
                websiteUrl,
                order: newOrder,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(partner, { status: 201 })
    } catch (error) {
        console.error('Error creating partner:', error)
        return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 })
    }
}

// PUT /api/admin/cms/partners - Bulk reorder
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
                prisma.cmsPartner.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering partners:', error)
        return NextResponse.json({ error: 'Failed to reorder partners' }, { status: 500 })
    }
}
