// =====================================================
// Permissions API Route
// GET: List all permissions (grouped by module)
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

        const permissions = await prisma.permission.findMany({
            orderBy: [
                { module: 'asc' },
                { action: 'asc' },
            ],
        })

        // Group by module
        const grouped = permissions.reduce((acc: any, perm) => {
            if (!acc[perm.module]) {
                acc[perm.module] = []
            }
            acc[perm.module].push(perm)
            return acc
        }, {})

        return NextResponse.json(grouped)

    } catch (error) {
        console.error('Error fetching permissions:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
