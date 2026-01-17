import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cms/estates - Public industrial estates (no auth required)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const locale = searchParams.get('locale') || 'th'

    const where: Record<string, unknown> = { isActive: true }
    if (region) where.region = region

    const estates = await prisma.cmsIndustrialEstate.findMany({
        where,
        orderBy: { nameTH: 'asc' },
        select: {
            id: true,
            nameTH: true,
            nameLA: true,
            region: true,
            latitude: true,
            longitude: true,
            workers: true,
            clients: true
        }
    })

    // Transform to locale-specific response
    const transformedEstates = estates.map(estate => ({
        id: estate.id,
        name: locale === 'la' ? (estate.nameLA || estate.nameTH) : estate.nameTH,
        region: estate.region,
        lat: estate.latitude,
        lng: estate.longitude,
        workers: estate.workers,
        clients: estate.clients
    }))

    return NextResponse.json(transformedEstates, {
        headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
        }
    })
}
