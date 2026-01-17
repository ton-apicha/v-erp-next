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

// GET /api/admin/cms/pages/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params
    const page = await prisma.cmsPage.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { order: 'asc' }
            }
        }
    })

    if (!page) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
}

// PUT /api/admin/cms/pages/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params

    try {
        const body = await request.json()
        const { titleTH, titleLA, metaTH, metaLA, isPublished } = body

        const existingPage = await prisma.cmsPage.findUnique({ where: { id } })
        if (!existingPage) {
            return NextResponse.json({ error: 'Page not found' }, { status: 404 })
        }

        let publishedAt = existingPage.publishedAt
        if (isPublished && !existingPage.isPublished) {
            publishedAt = new Date()
        }

        const page = await prisma.cmsPage.update({
            where: { id },
            data: {
                titleTH,
                titleLA,
                metaTH,
                metaLA,
                isPublished,
                publishedAt
            },
            include: {
                sections: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return NextResponse.json(page)
    } catch (error) {
        console.error('Error updating page:', error)
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/pages/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params

    try {
        await prisma.cmsPage.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting page:', error)
        return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 })
    }
}
