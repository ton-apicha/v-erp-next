import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logUpdate, logDelete } from '@/lib/audit'

// GET /api/loans/[id] - Get single loan with payments
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loan = await prisma.loan.findUnique({
            where: { id },
            include: {
                worker: {
                    select: {
                        id: true,
                        workerId: true,
                        firstNameTH: true,
                        lastNameTH: true,
                        phoneNumber: true
                    }
                },
                createdBy: { select: { name: true } },
                payments: {
                    orderBy: { paidAt: 'desc' },
                    include: {
                        recordedBy: { select: { name: true } }
                    }
                }
            },
        })

        if (!loan) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลสินเชื่อ' }, { status: 404 })
        }

        return NextResponse.json(loan)
    } catch (error) {
        console.error('Get Loan Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT /api/loans/[id] - Update loan
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Permission check
        const userRole = (session.user as any)?.role?.name
        if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole || '')) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const original = await prisma.loan.findUnique({ where: { id } })
        if (!original) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 })
        }

        const body = await request.json()

        const loan = await prisma.loan.update({
            where: { id },
            data: {
                interestRate: body.interestRate,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                purpose: body.purpose,
                notes: body.notes,
                status: body.status,
            },
        })

        // Audit log
        await logUpdate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'loans',
            id,
            original,
            loan
        )

        return NextResponse.json(loan)
    } catch (error) {
        console.error('Update Loan Error:', error)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
    }
}

// DELETE /api/loans/[id] - Cancel loan
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Permission check - only SUPER_ADMIN can delete
        const userRole = (session.user as any)?.role?.name
        if (userRole !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const original = await prisma.loan.findUnique({ where: { id } })
        if (!original) {
            return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 })
        }

        // Instead of deleting, we cancel the loan
        const loan = await prisma.loan.update({
            where: { id },
            data: { status: 'CANCELLED' },
        })

        // Audit log
        await logDelete(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'loans',
            id,
            original
        )

        return NextResponse.json({ message: 'ยกเลิกสินเชื่อสำเร็จ' })
    } catch (error) {
        console.error('Delete Loan Error:', error)
        return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
    }
}
