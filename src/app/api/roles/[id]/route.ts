// =====================================================
// Role API Route (Single)
// GET: Get role by ID
// PUT: Update role
// DELETE: Delete role
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check permission
        const userRole = (session.user as any).role?.name
        if (!['SUPER_ADMIN'].includes(userRole)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                permissions: {
                    include: {
                        permission: true,
                    },
                },
                _count: {
                    select: { users: true },
                },
            },
        })

        if (!role) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(role)

    } catch (error) {
        console.error('Error fetching role:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check permission
        const userRole = (session.user as any).role?.name
        if (!['SUPER_ADMIN'].includes(userRole)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        const body = await request.json()

        // Get existing role
        const existingRole = await prisma.role.findUnique({
            where: { id },
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        // Prevent editing system roles' name
        if (existingRole.isSystem && body.name !== existingRole.name) {
            return NextResponse.json(
                { error: 'ไม่สามารถเปลี่ยนชื่อ Role ระบบได้' },
                { status: 400 }
            )
        }

        // Check if new name already exists
        if (body.name !== existingRole.name) {
            const nameExists = await prisma.role.findUnique({
                where: { name: body.name },
            })
            if (nameExists) {
                return NextResponse.json(
                    { error: 'ชื่อ Role นี้มีอยู่แล้ว' },
                    { status: 400 }
                )
            }
        }

        // Update role
        const role = await prisma.role.update({
            where: { id },
            data: {
                name: existingRole.isSystem ? existingRole.name : body.name,
                displayName: body.displayName,
                displayNameLA: body.displayNameLA,
                companyAccess: body.companyAccess || [],
            },
        })

        // Update permissions if provided
        if (body.permissionIds !== undefined) {
            // Delete existing permissions
            await prisma.rolePermission.deleteMany({
                where: { roleId: id },
            })

            // Add new permissions
            if (body.permissionIds.length > 0) {
                await prisma.rolePermission.createMany({
                    data: body.permissionIds.map((permId: string) => ({
                        roleId: id,
                        permissionId: permId,
                    })),
                })
            }
        }

        return NextResponse.json(role)

    } catch (error) {
        console.error('Error updating role:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check permission
        const userRole = (session.user as any).role?.name
        if (!['SUPER_ADMIN'].includes(userRole)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Get existing role
        const existingRole = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true } },
            },
        })

        if (!existingRole) {
            return NextResponse.json(
                { error: 'Role not found' },
                { status: 404 }
            )
        }

        // Prevent deleting system roles
        if (existingRole.isSystem) {
            return NextResponse.json(
                { error: 'ไม่สามารถลบ Role ระบบได้' },
                { status: 400 }
            )
        }

        // Prevent deleting roles with users
        if (existingRole._count.users > 0) {
            return NextResponse.json(
                { error: `ไม่สามารถลบได้ มีผู้ใช้ ${existingRole._count.users} คนใช้ Role นี้อยู่` },
                { status: 400 }
            )
        }

        // Delete permissions first
        await prisma.rolePermission.deleteMany({
            where: { roleId: id },
        })

        // Delete role
        await prisma.role.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error deleting role:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
