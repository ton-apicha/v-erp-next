import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cms/blog - Public blog posts (no auth required)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const locale = searchParams.get('locale') || 'th'
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')

    const where: Record<string, unknown> = { isPublished: true }
    if (category) where.category = category
    if (featured === 'true') where.isFeatured = true

    const [posts, total] = await Promise.all([
        prisma.cmsBlogPost.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                slug: true,
                titleTH: true,
                titleLA: true,
                excerptTH: true,
                excerptLA: true,
                coverImage: true,
                category: true,
                tags: true,
                publishedAt: true,
                isFeatured: true,
                viewCount: true
            }
        }),
        prisma.cmsBlogPost.count({ where })
    ])

    // Transform to locale-specific response
    const transformedPosts = posts.map(post => ({
        id: post.id,
        slug: post.slug,
        title: locale === 'la' ? (post.titleLA || post.titleTH) : post.titleTH,
        excerpt: locale === 'la' ? (post.excerptLA || post.excerptTH) : post.excerptTH,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        publishedAt: post.publishedAt,
        isFeatured: post.isFeatured,
        viewCount: post.viewCount
    }))

    return NextResponse.json({
        data: transformedPosts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
        }
    })
}
