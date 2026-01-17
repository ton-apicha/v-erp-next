import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { minio, BUCKET_NAME, deleteFile } from '@/lib/minio'

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

// GET /api/admin/cms/media/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { id } = await params
    const media = await prisma.cmsMedia.findUnique({ where: { id } })

    if (!media) {
        return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json(media)
}

// PUT /api/admin/cms/media/[id] - Update alt text/folder
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
        const { altTextTH, altTextLA, folder } = body

        const media = await prisma.cmsMedia.update({
            where: { id },
            data: { altTextTH, altTextLA, folder }
        })

        return NextResponse.json(media)
    } catch (error) {
        console.error('Error updating media:', error)
        return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }
}

// DELETE /api/admin/cms/media/[id]
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
        const media = await prisma.cmsMedia.findUnique({ where: { id } })
        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 })
        }

        // Delete from MinIO
        try {
            await minio.removeObject(BUCKET_NAME, media.fileName)
        } catch (minioError) {
            console.error('Error deleting from MinIO:', minioError)
        }

        // Delete from database
        await prisma.cmsMedia.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting media:', error)
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
    }
}
