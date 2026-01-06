import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const provinceCode = searchParams.get('provinceCode')

    if (!provinceCode) {
        return NextResponse.json({ error: 'Province code is required' }, { status: 400 })
    }

    try {
        const districts = await prisma.district.findMany({
            where: {
                provinceCode: provinceCode,
            },
            orderBy: {
                nameEN: 'asc',
            },
        })

        return NextResponse.json(districts)
    } catch (error) {
        console.error('Error fetching districts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
