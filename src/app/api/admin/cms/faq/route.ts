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

// GET /api/admin/cms/faq - List FAQs
export async function GET() {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const faqs = await prisma.cmsFaq.findMany({
        orderBy: { order: 'asc' }
    })

    return NextResponse.json(faqs)
}

// POST /api/admin/cms/faq - Create FAQ
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { questionTH, questionLA, answerTH, answerLA, category, order, isActive } = body

        if (!questionTH || !answerTH) {
            return NextResponse.json({ error: 'questionTH and answerTH are required' }, { status: 400 })
        }

        // Get max order if not provided
        let newOrder = order
        if (newOrder === undefined) {
            const maxOrder = await prisma.cmsFaq.findFirst({
                orderBy: { order: 'desc' },
                select: { order: true }
            })
            newOrder = (maxOrder?.order || 0) + 1
        }

        const faq = await prisma.cmsFaq.create({
            data: {
                questionTH,
                questionLA,
                answerTH,
                answerLA,
                category,
                order: newOrder,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(faq, { status: 201 })
    } catch (error) {
        console.error('Error creating FAQ:', error)
        return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 })
    }
}

// PUT /api/admin/cms/faq - Bulk reorder
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
                prisma.cmsFaq.update({
                    where: { id: item.id },
                    data: { order: item.order }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering FAQs:', error)
        return NextResponse.json({ error: 'Failed to reorder FAQs' }, { status: 500 })
    }
}
