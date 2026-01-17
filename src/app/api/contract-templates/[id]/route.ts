// =====================================================
// Contract Template API Route (Single)
// GET: Get template by ID
// PUT: Update template
// DELETE: Delete template
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logUpdate, logDelete } from '@/lib/audit'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const template = await prisma.contractTemplate.findUnique({
            where: { id },
        })

        if (!template) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(template)

    } catch (error) {
        console.error('Error fetching contract template:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Get existing template
        const existingTemplate = await prisma.contractTemplate.findUnique({
            where: { id },
        })

        if (!existingTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // Update template
        const template = await prisma.contractTemplate.update({
            where: { id },
            data: {
                name: body.name,
                nameLA: body.nameLA,
                category: body.category,
                contentTH: body.contentTH,
                contentLA: body.contentLA,
                variables: body.variables || [],
                isActive: body.isActive,
            },
        })

        // Audit log
        await logUpdate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'contractTemplates',
            template.id,
            existingTemplate,
            template
        )

        return NextResponse.json(template)

    } catch (error) {
        console.error('Error updating contract template:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get existing template
        const existingTemplate = await prisma.contractTemplate.findUnique({
            where: { id },
        })

        if (!existingTemplate) {
            return NextResponse.json(
                { error: 'Template not found' },
                { status: 404 }
            )
        }

        // Delete template
        await prisma.contractTemplate.delete({
            where: { id },
        })

        // Audit log
        await logDelete(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'contractTemplates',
            id,
            existingTemplate
        )

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting contract template:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
