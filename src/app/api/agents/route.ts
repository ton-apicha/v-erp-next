import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    // For dropdowns, we might want a lighter query
    const minimal = searchParams.get('minimal') === 'true'

    try {
        const where: any = {}
        if (status) where.status = status
        if (search) {
            where.OR = [
                { companyName: { contains: search, mode: 'insensitive' } },
                { contactPerson: { contains: search, mode: 'insensitive' } },
                { agentId: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (minimal) {
            const agents = await prisma.agent.findMany({
                where,
                select: { id: true, companyName: true, agentId: true },
                orderBy: { companyName: 'asc' },
            })
            return NextResponse.json(agents)
        }

        const agents = await prisma.agent.findMany({
            where,
            include: {
                _count: { select: { workers: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(agents)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Generate Agent ID
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.agent.count()
        const agentId = `AG-${date}-${(count + 1).toString().padStart(3, '0')}`

        const agent = await prisma.agent.create({
            data: {
                agentId,
                companyName: body.companyName,
                contactPerson: body.contactPerson,
                phoneNumber: body.phoneNumber,
                email: body.email,
                address: body.address, // This will come from AddressSelector
                taxId: body.taxId,
                commissionRate: body.commissionRate || 0,
                createdById: (session.user as any).id,
            },
        })

        return NextResponse.json(agent, { status: 201 })
    } catch (error) {
        console.error('Create Agent Error:', error)
        return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }
}
