'use server'

import { prisma } from '@/lib/db'
import { uploadFile, deleteFile, getDownloadUrl } from '@/lib/minio'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface UploadDocumentInput {
    file: File
    category: string
    workerId?: string
    agentId?: string
    clientId?: string
    expiryDate?: string
}

export async function uploadDocument(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const workerId = formData.get('workerId') as string | null
    const agentId = formData.get('agentId') as string | null
    const clientId = formData.get('clientId') as string | null
    const expiryDate = formData.get('expiryDate') as string | null

    if (!file || !category) {
        throw new Error('File and category are required')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const prefix = workerId ? `workers/${workerId}` : agentId ? `agents/${agentId}` : clientId ? `clients/${clientId}` : 'general'
    const filename = `${prefix}/${category}/${timestamp}.${ext}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to MinIO
    const url = await uploadFile(buffer, filename, file.type)

    // Create document record
    const document = await prisma.document.create({
        data: {
            documentId: `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
            type: workerId ? 'WORKER_DOC' : agentId ? 'AGENT_DOC' : clientId ? 'CLIENT_DOC' : 'SYSTEM_DOC',
            category,
            title: file.name,
            fileUrl: url,
            fileName: filename,
            fileSize: file.size,
            mimeType: file.type,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            workerId: workerId || undefined,
            agentId: agentId || undefined,
            clientId: clientId || undefined,
            uploadedById: (session.user as any).id,
        },
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Document',
            entityId: document.id,
            newValue: {
                filename: file.name,
                category,
            },
        },
    })

    // Revalidate paths
    if (workerId) revalidatePath(`/dashboard/workers/${workerId}`)
    if (agentId) revalidatePath(`/dashboard/agents/${agentId}`)
    if (clientId) revalidatePath(`/dashboard/clients/${clientId}`)

    return document
}

export async function getDocumentUrl(documentId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const document = await prisma.document.findUnique({
        where: { id: documentId },
    })

    if (!document) {
        throw new Error('Document not found')
    }

    // Get presigned URL (valid for 1 hour)
    const url = await getDownloadUrl(document.fileName, 3600)
    return url
}

export async function deleteDocument(documentId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const document = await prisma.document.findUnique({
        where: { id: documentId },
    })

    if (!document) {
        throw new Error('Document not found')
    }

    // Delete document
    await prisma.document.delete({
        where: { id: documentId },
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'DELETE',
            entity: 'Document',
            entityId: document.id,
            oldValue: {
                filename: document.fileName,
                category: document.category,
            },
        },
    })

    // Revalidate paths
    if (document.workerId) revalidatePath(`/dashboard/workers/${document.workerId}`)
    if (document.agentId) revalidatePath(`/dashboard/agents/${document.agentId}`)
    if (document.clientId) revalidatePath(`/dashboard/clients/${document.clientId}`)

    return { success: true }
}

export async function getDocumentVersions(
    workerId: string,
    category: string
) {
    const documents = await prisma.document.findMany({
        where: {
            workerId,
            category: category as any,
        },
        orderBy: { createdAt: 'desc' },
    })

    return documents
}
