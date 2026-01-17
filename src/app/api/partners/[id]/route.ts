// =====================================================
// Partner API - Single Partner (GET/PUT/DELETE)
// =====================================================

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logUpdate, logDelete } from '@/lib/audit'

// GET /api/partners/[id] - Get single partner
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params

    try {
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true } },
                _count: { select: { workers: true } },
            },
        })

        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        return NextResponse.json(partner)
    } catch (error) {
        console.error('Get Partner Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT /api/partners/[id] - Update partner
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    try {
        // Get current partner data for audit log
        const currentPartner = await prisma.partner.findUnique({
            where: { id },
        })

        if (!currentPartner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        const body = await request.json()

        // Update partner
        const updatedPartner = await prisma.partner.update({
            where: { id },
            data: {
                name: body.name,
                nickname: body.nickname || null,
                phoneNumber: body.phoneNumber,
                address: body.address || null,
                village: body.village || null,
                district: body.district || null,
                province: body.province || null,
                status: body.status || 'ACTIVE',
                notes: body.notes || null,
            },
        })

        // Log the update
        const user = session.user as any
        await logUpdate(
            { id: user.id, email: user.email, name: user.name },
            'partner',
            updatedPartner.partnerId,
            currentPartner,
            updatedPartner
        )

        return NextResponse.json(updatedPartner)
    } catch (error) {
        console.error('Update Partner Error:', error)
        return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 })
    }
}

// DELETE /api/partners/[id] - Delete partner
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    try {
        // Get partner data for audit log
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: { _count: { select: { workers: true } } },
        })

        if (!partner) {
            return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
        }

        // Check if partner has workers
        if (partner._count.workers > 0) {
            return NextResponse.json(
                { error: 'ไม่สามารถลบพาร์ทเนอร์ที่มีแรงงานได้' },
                { status: 400 }
            )
        }

        // Delete partner
        await prisma.partner.delete({ where: { id } })

        // Log the deletion
        const user = session.user as any
        await logDelete(
            { id: user.id, email: user.email, name: user.name },
            'partner',
            partner.partnerId,
            partner
        )

        return NextResponse.json({ success: true, message: 'ลบพาร์ทเนอร์สำเร็จ' })
    } catch (error) {
        console.error('Delete Partner Error:', error)
        return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 })
    }
}
