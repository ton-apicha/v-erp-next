// =====================================================
// Academy Graduate API Route
// POST: Graduate workers from training
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
        const { workerIds, graduationDate } = body

        if (!workerIds || !Array.isArray(workerIds) || workerIds.length === 0) {
            return NextResponse.json(
                { error: 'กรุณาเลือกแรงงานอย่างน้อย 1 คน' },
                { status: 400 }
            )
        }

        // Update each worker
        const updatedWorkers = []
        for (const workerId of workerIds) {
            const worker = await prisma.worker.findUnique({
                where: { id: workerId },
            })

            if (worker && worker.status === 'TRAINING') {
                const updatedWorker = await prisma.worker.update({
                    where: { id: workerId },
                    data: {
                        status: 'READY',
                        academyEndDate: graduationDate ? new Date(graduationDate) : new Date(),
                        hasAcademyTraining: true,
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
            message: `จบการฝึกอบรม ${updatedWorkers.length} คน เรียบร้อย`,
        })

    } catch (error) {
        console.error('Error graduating workers:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
