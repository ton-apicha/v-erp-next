'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { hash } from 'bcryptjs'

/**
 * Create a new user
 * Only SUPER_ADMIN and MANAGER can create users
 */
export async function createUser(data: {
    name: string
    email: string
    password: string
    role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF'
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUser = session.user as any
    if (!['SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) {
        throw new Error('Permission denied')
    }

    // Only SUPER_ADMIN can create another SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can create SUPER_ADMIN users')
    }

    try {
        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        })

        if (existing) {
            throw new Error('Email already exists')
        }

        // Hash password
        const hashedPassword = await hash(data.password, 12)

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role as any,
            },
        })

        // Log the action
        await prisma.auditLog.create({
            data: {
                userId: currentUser.id,
                action: 'CREATE',
                entity: 'User',
                entityId: user.id,
                newValue: { name: user.name, email: user.email, role: user.role },
            },
        })

        revalidatePath('/dashboard/users')

        return { success: true, user: { id: user.id, name: user.name, email: user.email } }
    } catch (error) {
        console.error('Create user error:', error)
        throw error
    }
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: {
    name?: string
    email?: string
    password?: string
    role?: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF'
}) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUser = session.user as any
    if (!['SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) {
        throw new Error('Permission denied')
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
        throw new Error('User not found')
    }

    // Only SUPER_ADMIN can modify SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can modify SUPER_ADMIN users')
    }

    // Only SUPER_ADMIN can change role to SUPER_ADMIN
    if (data.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can assign SUPER_ADMIN role')
    }

    try {
        const updateData: any = {}

        if (data.name) updateData.name = data.name
        if (data.email) updateData.email = data.email
        if (data.role) updateData.role = data.role
        if (data.password) updateData.password = await hash(data.password, 12)

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        })

        await prisma.auditLog.create({
            data: {
                userId: currentUser.id,
                action: 'UPDATE',
                entity: 'User',
                entityId: user.id,
                oldValue: { name: targetUser.name, email: targetUser.email, role: targetUser.role },
                newValue: { name: user.name, email: user.email, role: user.role },
            },
        })

        revalidatePath('/dashboard/users')

        return { success: true }
    } catch (error) {
        console.error('Update user error:', error)
        throw error
    }
}

/**
 * Delete a user
 * Only SUPER_ADMIN can delete users
 */
export async function deleteUser(id: string) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const currentUser = session.user as any
    if (currentUser.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can delete users')
    }

    // Cannot delete self
    if (currentUser.id === id) {
        throw new Error('Cannot delete yourself')
    }

    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) {
            throw new Error('User not found')
        }

        await prisma.user.delete({ where: { id } })

        await prisma.auditLog.create({
            data: {
                userId: currentUser.id,
                action: 'DELETE',
                entity: 'User',
                entityId: id,
                oldValue: { name: user.name, email: user.email, role: user.role },
            },
        })

        revalidatePath('/dashboard/users')

        return { success: true }
    } catch (error) {
        console.error('Delete user error:', error)
        throw error
    }
}
