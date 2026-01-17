// =====================================================
// Contract Templates API Route
// GET: List all templates
// POST: Create new template
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logCreate } from '@/lib/audit'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse query params
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const activeOnly = searchParams.get('activeOnly') !== 'false'

        // Build where clause
        const where: any = {}

        if (category) {
            where.category = category
        }

        if (activeOnly) {
            where.isActive = true
        }

        const templates = await prisma.contractTemplate.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        })

        return NextResponse.json(templates)

    } catch (error) {
        console.error('Error fetching contract templates:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Validate
        if (!body.name || !body.category) {
            return NextResponse.json(
                { error: 'Name and category are required' },
                { status: 400 }
            )
        }

        // Create template
        const template = await prisma.contractTemplate.create({
            data: {
                name: body.name,
                nameLA: body.nameLA || null,
                category: body.category,
                contentTH: body.contentTH || null,
                contentLA: body.contentLA || null,
                variables: body.variables || [],
                isActive: body.isActive !== false,
                createdById: (session.user as any).id,
            },
        })

        // Audit log
        await logCreate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'contractTemplates',
            template.id,
            template
        )

        return NextResponse.json(template, { status: 201 })

    } catch (error) {
        console.error('Error creating contract template:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
