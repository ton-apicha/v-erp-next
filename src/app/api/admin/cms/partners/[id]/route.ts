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

// PUT /api/admin/cms/partners/[id]
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
        const { name, logoUrl, websiteUrl, order, isActive } = body

        const partner = await prisma.cmsPartner.update({
            where: { id },
            data: { name, logoUrl, websiteUrl, order, isActive }
        })

        return NextResponse.json(partner)
    } catch (error) {
        console.error('Error updating partner:', error)
        return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/partners/[id]
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
        await prisma.cmsPartner.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting partner:', error)
        return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 })
    }
}
