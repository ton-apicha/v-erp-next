import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const districtCode = searchParams.get('districtCode')

    if (!districtCode) {
        return NextResponse.json({ error: 'District code is required' }, { status: 400 })
    }

    try {
        const subdistricts = await prisma.subdistrict.findMany({
            where: {
                districtCode: districtCode,
            },
            orderBy: {
                nameEN: 'asc',
            },
        })

        return NextResponse.json(subdistricts)
    } catch (error) {
        console.error('Error fetching subdistricts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
