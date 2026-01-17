import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { minio, BUCKET_NAME, uploadFile } from '@/lib/minio'

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

// GET /api/admin/cms/media
export async function GET(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder')
    const mimeType = searchParams.get('mimeType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}
    if (folder) where.folder = folder
    if (mimeType) where.mimeType = { startsWith: mimeType }

    const [media, total] = await Promise.all([
        prisma.cmsMedia.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.cmsMedia.count({ where })
    ])

    return NextResponse.json({
        data: media,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
}

// POST /api/admin/cms/media - Upload file
export async function POST(request: NextRequest) {
    const authCheck = await checkSuperAdmin()
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = (formData.get('folder') as string) || 'general'
        const altTextTH = formData.get('altTextTH') as string
        const altTextLA = formData.get('altTextLA') as string

        if (!file) {
            return NextResponse.json({ error: 'File is required' }, { status: 400 })
        }

        // Generate unique filename
        const ext = file.name.split('.').pop()
        const fileName = `cms/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to MinIO
        await minio.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
            'Content-Type': file.type
        })

        // Generate URL
        const fileUrl = `${process.env.MINIO_PUBLIC_URL || '/api/files'}/${BUCKET_NAME}/${fileName}`

        // Save to database
        const media = await prisma.cmsMedia.create({
            data: {
                fileName,
                originalName: file.name,
                fileUrl,
                fileSize: file.size,
                mimeType: file.type,
                folder,
                altTextTH,
                altTextLA,
                uploadedById: authCheck.user.id
            }
        })

        return NextResponse.json(media, { status: 201 })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
