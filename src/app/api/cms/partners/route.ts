import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cms/partners - Public partners list (no auth required)
export async function GET() {
    const partners = await prisma.cmsPartner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            name: true,
            logoUrl: true,
            websiteUrl: true
        }
    })

    return NextResponse.json(partners, {
        headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
    })
}
