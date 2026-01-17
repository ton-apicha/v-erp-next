// =====================================================
// Academy Enroll API Route
// POST: Enroll workers to training
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
        const { workerIds, startDate, endDate } = body

        if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
            return NextResponse.json(
                { error: 'กรุณาเลือกแรงงานอย่างน้อย 1 คน' },
                { status: 400 }
            )
        }

        if (!startDate) {
            return NextResponse.json(
                { error: 'กรุณาระบุวันที่เริ่มฝึก' },
                { status: 400 }
            )
        }

        // Update each worker
        const updatedWorkers = []
        for (const workerId of workerIds) {
            const worker = await prisma.worker.findUnique({
                where: { id: workerId },
            })

            if (worker && ['NEW', 'DOCUMENTING'].includes(worker.status)) {
                const updatedWorker = await prisma.worker.update({
                    where: { id: workerId },
                    data: {
                        status: 'TRAINING',
                        academyStartDate: new Date(startDate),
                        academyEndDate: endDate ? new Date(endDate) : null,
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

                updatedWorkers.push(updatedWorker)
            }
        }

        return NextResponse.json({
            success: true,
            count: updatedWorkers.length,
            message: `รับแรงงานเข้าฝึกอบรม ${updatedWorkers.length} คน เรียบร้อย`,
        })

    } catch (error) {
        console.error('Error enrolling workers:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
