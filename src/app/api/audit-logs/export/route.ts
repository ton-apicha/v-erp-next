// =====================================================
// Audit Logs Export API Route
// GET: Export audit logs to Excel
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

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
        if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const module = searchParams.get('module')
        const action = searchParams.get('action')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        // Build where clause
        const where: any = {}
        if (userId) where.userId = userId
        if (module) where.module = module
        if (action) where.action = action
        if (startDate) {
            where.createdAt = { ...where.createdAt, gte: new Date(startDate) }
        }
        if (endDate) {
            where.createdAt = { ...where.createdAt, lte: new Date(endDate) }
        }

        // Fetch audit logs (max 5000 for export)
        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 5000,
        })

        // Transform data for Excel
        const excelData = logs.map((log) => {
            const fieldChanges = log.fieldChanges as any[] | null
            let changesText = ''

            if (fieldChanges && Array.isArray(fieldChanges)) {
                changesText = fieldChanges.map((c: any) =>
                    `${c.field}: ${c.oldValue || '-'} → ${c.newValue || '-'}`
                ).join(' | ')
            }

            return {
                'วันที่': format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss', { locale: th }),
                'ผู้ใช้': log.userName,
                'อีเมล': log.userEmail,
                'การกระทำ': log.action,
                'โมดูล': log.module,
                'รหัส Record': log.recordId || '-',
                'การเปลี่ยนแปลง': changesText || '-',
                'IP Address': log.ipAddress || '-',
            }
        })

        // Create workbook
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(excelData)

        // Set column widths
        ws['!cols'] = [
            { wch: 20 },   // Date
            { wch: 20 },   // User
            { wch: 25 },   // Email
            { wch: 12 },   // Action
            { wch: 15 },   // Module
            { wch: 15 },   // Record ID
            { wch: 50 },   // Changes
            { wch: 15 },   // IP
        ]

        XLSX.utils.book_append_sheet(wb, ws, 'AuditLogs')

        // Generate buffer
        const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

        // Return as file download
        const filename = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`

        return new NextResponse(buf, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })

    } catch (error) {
        console.error('Error exporting audit logs:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
