import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cms/faq - Public FAQ list (no auth required)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const locale = searchParams.get('locale') || 'th'

    const where: Record<string, unknown> = { isActive: true }
    if (category) where.category = category

    const faqs = await prisma.cmsFaq.findMany({
        where,
        orderBy: { order: 'asc' },
        select: {
            id: true,
            questionTH: true,
            questionLA: true,
            answerTH: true,
            answerLA: true,
            category: true,
            order: true
        }
    })

    // Transform to locale-specific response
    const transformedFaqs = faqs.map(faq => ({
        id: faq.id,
        question: locale === 'la' ? (faq.questionLA || faq.questionTH) : faq.questionTH,
        answer: locale === 'la' ? (faq.answerLA || faq.answerTH) : faq.answerTH,
        category: faq.category
    }))

    return NextResponse.json(transformedFaqs, {
        headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
    })
}
