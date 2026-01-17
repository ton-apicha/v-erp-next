import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper to check SUPER_ADMIN access
async function checkSuperAdmin() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return { error: 'Unauthorized', status: 401 }
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    })

    if (!user || user.role.name !== 'SUPER_ADMIN') {
        return { error: 'Forbidden - SUPER_ADMIN only', status: 403 }
    }

    return { user }
}

// GET /api/admin/cms/blog - List blog posts
export async function GET(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')
    const isPublished = searchParams.get('isPublished')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (isPublished !== null) where.isPublished = isPublished === 'true'

    const [posts, total] = await Promise.all([
        prisma.cmsBlogPost.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.cmsBlogPost.count({ where })
    ])

    return NextResponse.json({
        data: posts,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
}

// POST /api/admin/cms/blog - Create blog post
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { titleTH, titleLA, excerptTH, excerptLA, contentTH, contentLA, coverImage, category, tags, isPublished, isFeatured } = body

        if (!titleTH || !contentTH) {
            return NextResponse.json({ error: 'titleTH and contentTH are required' }, { status: 400 })
        }

        // Generate slug from title
        const slug = titleTH
            .toLowerCase()
            .replace(/[^a-z0-9ก-๙\s]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 100) + '-' + Date.now()

        const post = await prisma.cmsBlogPost.create({
            data: {
                slug,
                titleTH,
                titleLA,
                excerptTH,
                excerptLA,
                contentTH,
                contentLA,
                coverImage,
                category,
                tags: tags || [],
                isPublished: isPublished || false,
                isFeatured: isFeatured || false,
                publishedAt: isPublished ? new Date() : null,
                authorId: authCheck.user.id
            }
        })

        return NextResponse.json(post, { status: 201 })
    } catch (error) {
        console.error('Error creating blog post:', error)
        return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 })
    }
}
