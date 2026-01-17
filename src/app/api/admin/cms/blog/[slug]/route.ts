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

// GET /api/admin/cms/blog/[slug]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { slug } = await params
    const post = await prisma.cmsBlogPost.findUnique({ where: { slug } })

    if (!post) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json(post)
}

// PUT /api/admin/cms/blog/[slug]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { slug } = await params

    try {
        const body = await request.json()
        const { titleTH, titleLA, excerptTH, excerptLA, contentTH, contentLA, coverImage, category, tags, isPublished, isFeatured } = body

        const existingPost = await prisma.cmsBlogPost.findUnique({ where: { slug } })
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        // If publishing for first time, set publishedAt
        let publishedAt = existingPost.publishedAt
        if (isPublished && !existingPost.isPublished) {
            publishedAt = new Date()
        }

        const post = await prisma.cmsBlogPost.update({
            where: { slug },
            data: {
                titleTH,
                titleLA,
                excerptTH,
                excerptLA,
                contentTH,
                contentLA,
                coverImage,
                category,
                tags,
                isPublished,
                isFeatured,
                publishedAt
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error updating blog post:', error)
        return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/blog/[slug]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { slug } = await params

    try {
        await prisma.cmsBlogPost.delete({ where: { slug } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting blog post:', error)
        return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 })
    }
}
