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

// GET /api/admin/cms/estates
export async function GET(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')

    const where: Record<string, unknown> = {}
    if (region) where.region = region

    const estates = await prisma.cmsIndustrialEstate.findMany({
        where,
        orderBy: { nameTH: 'asc' }
    })

    return NextResponse.json(estates)
}

// POST /api/admin/cms/estates
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { nameTH, nameLA, region, latitude, longitude, workers, clients, isActive } = body

        if (!nameTH || !region || latitude === undefined || longitude === undefined) {
            return NextResponse.json(
                { error: 'nameTH, region, latitude, and longitude are required' },
                { status: 400 }
            )
        }

        const estate = await prisma.cmsIndustrialEstate.create({
            data: {
                nameTH,
                nameLA,
                region,
                latitude,
                longitude,
                workers: workers || 0,
                clients: clients || 0,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(estate, { status: 201 })
    } catch (error) {
        console.error('Error creating estate:', error)
        return NextResponse.json({ error: 'Failed to create estate' }, { status: 500 })
    }
}
