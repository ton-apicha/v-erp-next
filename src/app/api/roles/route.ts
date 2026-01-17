// =====================================================
// Roles API Route
// GET: List all roles with permissions
// POST: Create new role
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

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

        const roles = await prisma.role.findMany({
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
            orderBy: { createdAt: 'asc' },
        })

        return NextResponse.json(roles)

    } catch (error) {
        console.error('Error fetching roles:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

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

        // Validate
        if (!body.name || !body.displayName) {
            return NextResponse.json(
                { error: 'Name and displayName are required' },
                { status: 400 }
            )
        }

        // Check if role name exists
        const existingRole = await prisma.role.findUnique({
            where: { name: body.name },
        })

        if (existingRole) {
            return NextResponse.json(
                { error: 'ชื่อ Role นี้มีอยู่แล้ว' },
                { status: 400 }
            )
        }

        // Create role
        const role = await prisma.role.create({
            data: {
                name: body.name,
                displayName: body.displayName,
                displayNameLA: body.displayNameLA || null,
                companyAccess: body.companyAccess || [],
                isSystem: false,
            },
        })

        // Add permissions if provided
        if (body.permissionIds && body.permissionIds.length > 0) {
            await prisma.rolePermission.createMany({
                data: body.permissionIds.map((permId: string) => ({
                    roleId: role.id,
                    permissionId: permId,
                })),
            })
        }

        return NextResponse.json(role, { status: 201 })

    } catch (error) {
        console.error('Error creating role:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
