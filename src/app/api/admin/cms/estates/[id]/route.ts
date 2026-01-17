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

// GET /api/admin/cms/estates/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params
    const estate = await prisma.cmsIndustrialEstate.findUnique({ where: { id } })

    if (!estate) {
        return NextResponse.json({ error: 'Estate not found' }, { status: 404 })
    }

    return NextResponse.json(estate)
}

// PUT /api/admin/cms/estates/[id]
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
        const { nameTH, nameLA, region, latitude, longitude, workers, clients, isActive } = body

        const estate = await prisma.cmsIndustrialEstate.update({
            where: { id },
            data: {
                nameTH,
                nameLA,
                region,
                latitude,
                longitude,
                workers,
                clients,
                isActive
            }
        })

        return NextResponse.json(estate)
    } catch (error) {
        console.error('Error updating estate:', error)
        return NextResponse.json({ error: 'Failed to update estate' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/estates/[id]
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
        await prisma.cmsIndustrialEstate.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting estate:', error)
        return NextResponse.json({ error: 'Failed to delete estate' }, { status: 500 })
    }
}
