import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logCreate } from '@/lib/audit'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const minimal = searchParams.get('minimal') === 'true'

    try {
        const where: any = { status: 'ACTIVE' }
        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { clientId: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (minimal) {
            const clients = await prisma.client.findMany({
                where,
                select: { id: true, companyName: true, personName: true, clientId: true },
                orderBy: { companyName: 'asc' },
            })
            return NextResponse.json(clients)
        }

        const clients = await prisma.client.findMany({
            where,
            include: {
                _count: { select: { workers: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(clients)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission check
    const userRole = (session.user as any)?.role?.name
    if (!['SUPER_ADMIN', 'MANAGER', 'TH_OPERATOR'].includes(userRole || '')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    try {
        const body = await request.json()

        // Generate Client ID
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.client.count()
        const clientId = `CL-${date}-${(count + 1).toString().padStart(3, '0')}`

        const client = await prisma.client.create({
            data: {
                clientId,
                companyName: body.companyName,
                personName: body.personName,
                type: body.type || 'FACTORY',
                contactPerson: body.contactPerson,
                phoneNumber: body.phoneNumber,
                email: body.email,
                address: body.address,
                taxId: body.taxId,
                industry: body.industry,
                employeeCount: body.employeeCount ? parseInt(body.employeeCount) : undefined,
                createdBy: { connect: { id: (session.user as any).id } },
            },
        })

        // Audit log
        await logCreate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'clients',
            client.id,
            client
        )

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        console.error('Create Client Error:', error)
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
    }
}
