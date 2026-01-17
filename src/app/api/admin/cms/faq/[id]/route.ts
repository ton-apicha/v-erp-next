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

// GET /api/admin/cms/faq/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params
    const faq = await prisma.cmsFaq.findUnique({ where: { id } })

    if (!faq) {
        return NextResponse.json({ error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json(faq)
}

// PUT /api/admin/cms/faq/[id]
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
        const { questionTH, questionLA, answerTH, answerLA, category, order, isActive } = body

        const faq = await prisma.cmsFaq.update({
            where: { id },
            data: {
                questionTH,
                questionLA,
                answerTH,
                answerLA,
                category,
                order,
                isActive
            }
        })

        return NextResponse.json(faq)
    } catch (error) {
        console.error('Error updating FAQ:', error)
        return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/faq/[id]
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
        await prisma.cmsFaq.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting FAQ:', error)
        return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 })
    }
}
