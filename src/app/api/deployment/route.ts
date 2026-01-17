// =====================================================
// Deploy Worker API Route
// POST: Assign worker to client (Deploy)
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logUpdate } from '@/lib/audit'

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { workerId, clientId, deploymentDate, position, salary, notes } = body

        // Validate required fields
        if (!workerId || !clientId || !deploymentDate) {
            return NextResponse.json(
                { error: 'กรุณาระบุแรงงาน, ลูกค้า และวันที่ส่งตัว' },
                { status: 400 }
            )
        }

        // Get worker
        const worker = await prisma.worker.findUnique({
            where: { id: workerId },
        })

        if (!worker) {
            return NextResponse.json(
                { error: 'ไม่พบแรงงาน' },
                { status: 404 }
            )
        }

        // Check worker status
        if (!['READY', 'NEW', 'TRAINING', 'DOCUMENTING'].includes(worker.status)) {
            return NextResponse.json(
                { error: `ไม่สามารถส่งตัวแรงงานสถานะ ${worker.status} ได้` },
                { status: 400 }
            )
        }

        // Get client
        const client = await prisma.client.findUnique({
            where: { id: clientId },
        })

        if (!client) {
            return NextResponse.json(
                { error: 'ไม่พบนายจ้าง' },
                { status: 404 }
            )
        }

        // Update worker
        const updatedWorker = await prisma.worker.update({
            where: { id: workerId },
            data: {
                clientId,
                status: 'DEPLOYED',
                deploymentDate: new Date(deploymentDate),
                position: position || null,
                salary: salary ? parseFloat(salary) : null,
                notes: notes || null,
            },
            include: {
                client: { select: { companyName: true, personName: true, clientId: true } },
            },
        })

        // Audit log
        await logUpdate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'workers',
            worker.id,
            worker,
            updatedWorker
        )

        return NextResponse.json({
            success: true,
            worker: updatedWorker,
            message: `ส่งตัว ${worker.firstNameTH} ${worker.lastNameTH} ไปยัง ${client.companyName || client.personName} เรียบร้อย`,
        })

    } catch (error) {
        console.error('Error deploying worker:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
