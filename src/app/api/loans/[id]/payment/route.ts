import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logCreate } from '@/lib/audit'

// POST /api/loans/[id]/payment - Record a payment
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: loanId } = await context.params
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Permission check
        const userRole = (session.user as any)?.role?.name
        if (!['SUPER_ADMIN', 'MANAGER', 'TH_OPERATOR'].includes(userRole || '')) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()

        if (!body.amount || body.amount <= 0) {
            return NextResponse.json(
                { error: 'กรุณาระบุจำนวนเงินที่ชำระ' },
                { status: 400 }
            )
        }

        // Get loan
        const loan = await prisma.loan.findUnique({ where: { id: loanId } })
        if (!loan) {
            return NextResponse.json({ error: 'ไม่พบข้อมูลสินเชื่อ' }, { status: 404 })
        }

        if (loan.status === 'PAID_OFF') {
            return NextResponse.json({ error: 'สินเชื่อนี้ชำระครบแล้ว' }, { status: 400 })
        }

        // Generate Payment ID (format: P-YYYYMMDD-XXXX)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.payment.count()
        const paymentId = `P-${date}-${String(count + 1).padStart(4, '0')}`

        const paymentAmount = parseFloat(body.amount)
        const newBalance = Math.max(0, Number(loan.balance) - paymentAmount)
        const newStatus = newBalance <= 0 ? 'PAID_OFF' : loan.status

        // Create payment and update loan in transaction
        const [payment, updatedLoan] = await prisma.$transaction([
            prisma.payment.create({
                data: {
                    paymentId,
                    loanId,
                    amount: paymentAmount,
                    method: body.method || 'CASH',
                    paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
                    notes: body.notes,
                    recordedById: (session.user as any).id,
                },
            }),
            prisma.loan.update({
                where: { id: loanId },
                data: {
                    balance: newBalance,
                    status: newStatus,
                },
            }),
        ])

        // Audit log
        await logCreate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'payments',
            payment.id,
            { ...payment, loanId, newBalance, previousBalance: Number(loan.balance) }
        )

        return NextResponse.json({
            payment,
            loan: updatedLoan,
            message: newStatus === 'PAID_OFF' ? 'ชำระครบแล้ว!' : 'บันทึกการชำระสำเร็จ'
        }, { status: 201 })
    } catch (error) {
        console.error('Record Payment Error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการบันทึกการชำระ' },
            { status: 500 }
        )
    }
}
