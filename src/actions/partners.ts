'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Generate unique agent ID
async function generateAgentId(): Promise<string> {
    const today = new Date()
    const prefix = `AG-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

    const lastAgent = await prisma.agent.findFirst({
        where: { agentId: { startsWith: prefix } },
        orderBy: { agentId: 'desc' },
    })

    const sequence = lastAgent
        ? parseInt(lastAgent.agentId.split('-').pop() || '0') + 1
        : 1

    return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Generate unique client ID
async function generateClientId(): Promise<string> {
    const today = new Date()
    const prefix = `CL-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

    const lastClient = await prisma.client.findFirst({
        where: { clientId: { startsWith: prefix } },
        orderBy: { clientId: 'desc' },
    })

    const sequence = lastClient
        ? parseInt(lastClient.clientId.split('-').pop() || '0') + 1
        : 1

    return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Create agent - using correct schema field names
export async function createAgent(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const agentId = await generateAgentId()

    const agent = await prisma.agent.create({
        data: {
            agentId,
            companyName: formData.get('companyName') as string,
            contactPerson: formData.get('contactName') as string || '',
            phoneNumber: formData.get('phone') as string || '',
            email: formData.get('email') as string || undefined,
            address: formData.get('address') as string || undefined,
            taxId: formData.get('registrationNo') as string || undefined,
            commissionRate: parseFloat(formData.get('commissionRate') as string) || 5,
            notes: formData.get('notes') as string || undefined,
            status: 'ACTIVE',
            createdById: (session.user as any).id,
        },
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Agent',
            entityId: agent.id,
            newValue: { agentId, companyName: agent.companyName },
        },
    })

    revalidatePath('/dashboard/agents')
    return agent
}

// Update agent
export async function updateAgent(agentId: string, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const agent = await prisma.agent.update({
        where: { id: agentId },
        data: {
            companyName: formData.get('companyName') as string,
            contactPerson: formData.get('contactName') as string || undefined,
            phoneNumber: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
            address: formData.get('address') as string || undefined,
            taxId: formData.get('registrationNo') as string || undefined,
            commissionRate: parseFloat(formData.get('commissionRate') as string) || 5,
            notes: formData.get('notes') as string || undefined,
        },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'Agent',
            entityId: agent.id,
            newValue: { companyName: agent.companyName },
        },
    })

    revalidatePath('/dashboard/agents')
    revalidatePath(`/dashboard/agents/${agentId}`)
    return agent
}

// Archive agent (soft delete) - use status
export async function archiveAgent(agentId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    await prisma.agent.update({
        where: { id: agentId },
        data: { status: 'SUSPENDED' },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'DELETE',
            entity: 'Agent',
            entityId: agentId,
            newValue: { archived: true },
        },
    })

    revalidatePath('/dashboard/agents')
}

// Create client - using correct schema field names
export async function createClient(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const clientId = await generateClientId()

    const client = await prisma.client.create({
        data: {
            clientId,
            companyName: formData.get('companyName') as string,
            companyNameEN: formData.get('companyNameEN') as string || undefined,
            contactPerson: formData.get('contactName') as string || '',
            phoneNumber: formData.get('phone') as string || '',
            email: formData.get('email') as string || undefined,
            address: formData.get('address') as string || undefined,
            industry: formData.get('industry') as string || undefined,
            taxId: formData.get('taxId') as string || undefined,
            notes: formData.get('notes') as string || undefined,
            createdById: (session.user as any).id,
        },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Client',
            entityId: client.id,
            newValue: { clientId, companyName: client.companyName },
        },
    })

    revalidatePath('/dashboard/clients')
    return client
}

// Update client
export async function updateClient(clientId: string, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const client = await prisma.client.update({
        where: { id: clientId },
        data: {
            companyName: formData.get('companyName') as string,
            companyNameEN: formData.get('companyNameEN') as string || undefined,
            contactPerson: formData.get('contactName') as string || undefined,
            phoneNumber: formData.get('phone') as string || undefined,
            email: formData.get('email') as string || undefined,
            address: formData.get('address') as string || undefined,
            industry: formData.get('industry') as string || undefined,
            taxId: formData.get('taxId') as string || undefined,
            notes: formData.get('notes') as string || undefined,
        },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'Client',
            entityId: client.id,
            newValue: { companyName: client.companyName },
        },
    })

    revalidatePath('/dashboard/clients')
    revalidatePath(`/dashboard/clients/${clientId}`)
    return client
}

// Archive client (soft delete) - use status
export async function archiveClient(clientId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    await prisma.client.update({
        where: { id: clientId },
        data: { status: 'INACTIVE' },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'DELETE',
            entity: 'Client',
            entityId: clientId,
            newValue: { archived: true },
        },
    })

    revalidatePath('/dashboard/clients')
}

// Get agents for dropdown - use status
export async function getAgentsForSelect() {
    const agents = await prisma.agent.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            agentId: true,
            companyName: true,
        },
        orderBy: { companyName: 'asc' },
    })
    return agents
}

// Get clients for dropdown - use status
export async function getClientsForSelect() {
    const clients = await prisma.client.findMany({
        where: { status: 'ACTIVE' },
        select: {
            id: true,
            clientId: true,
            companyName: true,
        },
        orderBy: { companyName: 'asc' },
    })
    return clients
}
