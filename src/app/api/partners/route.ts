// ===========================================
// Partners API Route
// GET: List all partners
// POST: Create new partner
// ===========================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logCreate } from '@/lib/audit'

// =========================================
// GET - List Partners
// =========================================

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
        const minimal = searchParams.get('minimal') === 'true'
        const status = searchParams.get('status')
        const search = searchParams.get('search')
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        // Minimal response for dropdowns
        if (minimal) {
            const partners = await prisma.partner.findMany({
                where: { status: 'ACTIVE' },
                select: {
                    id: true,
                    partnerId: true,
                    name: true,
                },
                orderBy: { name: 'asc' },
            })
            return NextResponse.json(partners)
        }

        // Build where clause
        const where: any = {}

        if (status) {
            where.status = status
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { nickname: { contains: search, mode: 'insensitive' } },
                { partnerId: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search } },
            ]
        }

        // Fetch partners with worker count
        const [partners, total] = await Promise.all([
            prisma.partner.findMany({
                where,
                include: {
                    _count: {
                        select: { workers: true }
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.partner.count({ where }),
        ])

        return NextResponse.json({
            partners,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        })

    } catch (error) {
        console.error('Error fetching partners:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// =========================================
// POST - Create Partner
// =========================================

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

        // Validate required fields
        if (!body.name || !body.phoneNumber) {
            return NextResponse.json(
                { error: 'Name and phone number are required' },
                { status: 400 }
            )
        }

        // Generate partner ID
        const lastPartner = await prisma.partner.findFirst({
            orderBy: { partnerId: 'desc' },
            select: { partnerId: true },
        })

        let nextNumber = 1
        if (lastPartner) {
            const match = lastPartner.partnerId.match(/P-(\d+)/)
            if (match) {
                nextNumber = parseInt(match[1]) + 1
            }
        }
        const partnerId = `P-${String(nextNumber).padStart(4, '0')}`

        // Create partner
        const partner = await prisma.partner.create({
            data: {
                partnerId,
                name: body.name,
                nickname: body.nickname || null,
                phoneNumber: body.phoneNumber,
                address: body.address || null,
                village: body.village || null,
                district: body.district || null,
                province: body.province || null,
                status: body.status || 'ACTIVE',
                notes: body.notes || null,
                createdById: session.user.id,
            },
            include: {
                _count: {
                    select: { workers: true }
                }
            }
        })

        // Create audit log
        await logCreate(
            {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'partners',
            partner.id,
            partner
        )

        return NextResponse.json(partner, { status: 201 })

    } catch (error) {
        console.error('Error creating partner:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
