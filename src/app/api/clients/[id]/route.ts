import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logUpdate, logDelete } from '@/lib/audit'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            _count: { select: { workers: true } },
            createdBy: { select: { name: true } }
        }
    })

    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(client)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Permission check
    const userRole = (session.user as any)?.role?.name
    if (!['SUPER_ADMIN', 'MANAGER', 'TH_OPERATOR'].includes(userRole || '')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params

    try {
        // Get original for audit
        const original = await prisma.client.findUnique({ where: { id } })
        if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const body = await request.json()
        const client = await prisma.client.update({
            where: { id },
            data: {
                companyName: body.companyName,
                personName: body.personName,
                contactPerson: body.contactPerson,
                phoneNumber: body.phoneNumber,
                email: body.email,
                address: body.address,
                taxId: body.taxId,
                industry: body.industry,
                employeeCount: body.employeeCount ? parseInt(body.employeeCount) : undefined,
                status: body.status,
                notes: body.notes
            }
        })

        // Audit log
        await logUpdate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'clients',
            id,
            original,
            client
        )

        return NextResponse.json(client)
    } catch (error) {
        console.error('Update Client Error:', error)
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Permission check - only SUPER_ADMIN and MANAGER can delete
    const userRole = (session.user as any)?.role?.name
    if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole || '')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { id } = await params

    try {
        // Get original for audit
        const original = await prisma.client.findUnique({ where: { id } })
        if (!original) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        await prisma.client.delete({ where: { id } })

        // Audit log
        await logDelete(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'clients',
            id,
            original
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete Client Error:', error)
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
