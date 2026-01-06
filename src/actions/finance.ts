'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Generate unique loan ID
async function generateLoanId(): Promise<string> {
    const today = new Date()
    const prefix = `L-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`

    const lastLoan = await prisma.loan.findFirst({
        where: { loanId: { startsWith: prefix } },
        orderBy: { loanId: 'desc' },
    })

    const sequence = lastLoan
        ? parseInt(lastLoan.loanId.split('-').pop() || '0') + 1
        : 1

    return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Generate unique payment ID
async function generatePaymentId(): Promise<string> {
    const today = new Date()
    const prefix = `P-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`

    const lastPayment = await prisma.payment.findFirst({
        where: { paymentId: { startsWith: prefix } },
        orderBy: { paymentId: 'desc' },
    })

    const sequence = lastPayment
        ? parseInt(lastPayment.paymentId.split('-').pop() || '0') + 1
        : 1

    return `${prefix}-${String(sequence).padStart(4, '0')}`
}

// Create a new loan
export async function createLoan(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const workerId = formData.get('workerId') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string)
    const installments = parseInt(formData.get('installments') as string) || null
    const monthlyDeduction = parseFloat(formData.get('monthlyDeduction') as string) || null
    const interestRate = parseFloat(formData.get('interestRate') as string) || 0
    const description = formData.get('description') as string

    const loanId = await generateLoanId()

    const loan = await prisma.loan.create({
        data: {
            loanId,
            workerId,
            principal: totalAmount,
            balance: totalAmount,
            interestRate,
            purpose: description,
            status: 'ACTIVE',
            disbursedAt: new Date(),
            createdById: (session.user as any).id,
        },
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Loan',
            entityId: loan.id,
            newValue: { loanId, principal: totalAmount, workerId },
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/loans')
    revalidatePath(`/dashboard/workers/${workerId}`)

    return loan
}

// Record a payment
export async function recordPayment(formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const loanId = formData.get('loanId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const method = formData.get('method') as string
    const reference = formData.get('reference') as string
    const note = formData.get('note') as string

    const loan = await prisma.loan.findUnique({
        where: { id: loanId },
    })

    if (!loan) throw new Error('Loan not found')

    const paymentId = await generatePaymentId()
    const newBalance = Math.max(0, Number(loan.balance) - amount)

    // Create payment
    const payment = await prisma.payment.create({
        data: {
            paymentId,
            loanId,
            amount,
            method: method as any,
            reference,
            notes: note,
            paidAt: new Date(),
            recordedById: (session.user as any).id,
        },
    })

    // Update loan balance and status
    await prisma.loan.update({
        where: { id: loanId },
        data: {
            balance: newBalance,
            status: newBalance === 0 ? 'PAID_OFF' : 'ACTIVE',
        },
    })

    // Create audit log
    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'CREATE',
            entity: 'Payment',
            entityId: payment.id,
            newValue: { paymentId, amount, loanId: loan.loanId },
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/loans')
    revalidatePath(`/dashboard/finance/loans/${loanId}`)
    revalidatePath('/dashboard/finance/payments')

    return payment
}

// Get loan details with payments
export async function getLoanDetails(loanId: string) {
    const loan = await prisma.loan.findUnique({
        where: { id: loanId },
        include: {
            worker: {
                select: {
                    id: true,
                    workerId: true,
                    firstNameTH: true,
                    lastNameTH: true,
                    phoneNumber: true,
                    client: { select: { companyName: true } },
                },
            },
            payments: {
                orderBy: { paidAt: 'desc' },
                include: {
                    recordedBy: { select: { name: true } },
                },
            },
            createdBy: { select: { name: true } },
        },
    })

    return loan
}

// Update loan status
export async function updateLoanStatus(loanId: string, status: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const loan = await prisma.loan.update({
        where: { id: loanId },
        data: { status: status as any },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'Loan',
            entityId: loanId,
            newValue: { status },
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/loans')
    revalidatePath(`/dashboard/finance/loans/${loanId}`)

    return loan
}

// Calculate commission for agent
export async function calculateAgentCommission(
    agentId: string,
    workerId: string,
    type: 'RECRUITMENT' | 'RETENTION' | 'PERFORMANCE' | 'OTHER',
    baseAmount: number
) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const agent = await prisma.agent.findUnique({
        where: { id: agentId },
    })

    if (!agent) throw new Error('Agent not found')

    const rate = Number(agent.commissionRate) / 100
    const amount = baseAmount * rate

    const commissionId = `COM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    const commission = await prisma.commission.create({
        data: {
            commissionId,
            agentId,
            workerId,
            type: type as any,
            amount,
            status: 'PENDING',
            calculatedById: (session.user as any).id,
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/commissions')
    revalidatePath(`/dashboard/agents/${agentId}`)

    return commission
}

// Approve commission
export async function approveCommission(commissionId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const commission = await prisma.commission.update({
        where: { id: commissionId },
        data: {
            status: 'APPROVED',
            approvedById: (session.user as any).id,
            approvedAt: new Date(),
        },
    })

    await prisma.auditLog.create({
        data: {
            userId: (session.user as any).id,
            action: 'UPDATE',
            entity: 'Commission',
            entityId: commissionId,
            newValue: { status: 'APPROVED' },
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/commissions')

    return commission
}

// Mark commission as paid
export async function markCommissionPaid(commissionId: string, paidAt: Date) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error('Unauthorized')

    const commission = await prisma.commission.update({
        where: { id: commissionId },
        data: {
            status: 'PAID',
            paidAt,
        },
    })

    revalidatePath('/dashboard/finance')
    revalidatePath('/dashboard/finance/commissions')

    return commission
}
