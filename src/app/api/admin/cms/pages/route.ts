import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

// GET /api/admin/cms/pages
export async function GET() {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const pages = await prisma.cmsPage.findMany({
        include: {
            sections: {
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(pages)
}

// POST /api/admin/cms/pages
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const body = await request.json()
        const { slug, titleTH, titleLA, metaTH, metaLA, isPublished } = body

        if (!slug || !titleTH) {
            return NextResponse.json({ error: 'slug and titleTH are required' }, { status: 400 })
        }

        // Check slug uniqueness
        const existing = await prisma.cmsPage.findUnique({ where: { slug } })
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
        }

        const page = await prisma.cmsPage.create({
            data: {
                slug,
                titleTH,
                titleLA,
                metaTH,
                metaLA,
                isPublished: isPublished || false,
                publishedAt: isPublished ? new Date() : null,
                createdById: authCheck.user.id
            },
            include: {
                sections: true
            }
        })

        return NextResponse.json(page, { status: 201 })
    } catch (error) {
        console.error('Error creating page:', error)
        return NextResponse.json({ error: 'Failed to create page' }, { status: 500 })
    }
}
