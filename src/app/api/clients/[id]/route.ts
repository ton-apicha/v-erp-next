import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { id } = await params

    try {
        const body = await request.json()
        const client = await prisma.client.update({
            where: { id },
            data: {
                companyName: body.companyName,
                companyNameEN: body.companyNameEN,
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
        return NextResponse.json(client)
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    try {
        await prisma.client.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
}
