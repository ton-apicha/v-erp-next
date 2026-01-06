import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country') || 'TH'

    try {
        const provinces = await prisma.province.findMany({
            where: {
                countryCode: countryCode.toUpperCase(),
            },
            orderBy: {
                nameEN: 'asc',
            },
        })

        return NextResponse.json(provinces)
    } catch (error) {
        console.error('Error fetching provinces:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
