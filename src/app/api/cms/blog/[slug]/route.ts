import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/cms/blog/[slug] - Public single blog post
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'th'

    const post = await prisma.cmsBlogPost.findUnique({
        where: { slug, isPublished: true }
    })

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Increment view count
    await prisma.cmsBlogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
    })

    // Transform to locale-specific response
    const transformedPost = {
        id: post.id,
        slug: post.slug,
        title: locale === 'la' ? (post.titleLA || post.titleTH) : post.titleTH,
        excerpt: locale === 'la' ? (post.excerptLA || post.excerptTH) : post.excerptTH,
        content: locale === 'la' ? (post.contentLA || post.contentTH) : post.contentTH,
        coverImage: post.coverImage,
        category: post.category,
        tags: post.tags,
        publishedAt: post.publishedAt,
        viewCount: post.viewCount + 1
    }

    return NextResponse.json(transformedPost, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
        }
    })
}
