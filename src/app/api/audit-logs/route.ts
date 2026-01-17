// =====================================================
// Audit Logs API Route
// GET: List audit logs with filters
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAuditLogs } from '@/lib/audit'

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if user has permission to view audit logs
        // For now, only SUPER_ADMIN and MANAGER roles
        const userRole = (session.user as any).role?.name
        if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        // Parse query params
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId') || undefined
        const module = searchParams.get('module') || undefined
        const action = searchParams.get('action') || undefined
        const recordId = searchParams.get('recordId') || undefined
        const startDate = searchParams.get('startDate')
            ? new Date(searchParams.get('startDate')!)
            : undefined
        const endDate = searchParams.get('endDate')
            ? new Date(searchParams.get('endDate')!)
            : undefined
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '20')

        const result = await getAuditLogs({
            userId,
            module,
            action,
            recordId,
            startDate,
            endDate,
            page,
            pageSize,
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
