import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logCreate } from '@/lib/audit'

// GET /api/loans - List all loans
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const workerId = searchParams.get('workerId')
        const search = searchParams.get('search')

        const where: any = {}

        if (status && status !== 'all') {
            where.status = status
        }

        if (workerId) {
            where.workerId = workerId
        }

        if (search) {
            where.OR = [
                { loanId: { contains: search, mode: 'insensitive' } },
                { worker: { firstNameTH: { contains: search, mode: 'insensitive' } } },
                { worker: { lastNameTH: { contains: search, mode: 'insensitive' } } },
            ]
        }

        const loans = await prisma.loan.findMany({
            where,
            include: {
                worker: {
                    select: { workerId: true, firstNameTH: true, lastNameTH: true }
                },
                createdBy: { select: { name: true } },
                _count: { select: { payments: true } }
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(loans)
    } catch (error) {
        console.error('Get Loans Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/loans - Create new loan
export async function POST(request: NextRequest) {
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

        // Validate required fields
        if (!body.workerId || !body.principal) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลที่จำเป็น (Worker และ จำนวนเงินกู้)' },
                { status: 400 }
            )
        }

        // Generate Loan ID (format: L-YYYYMMDD-XXX)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.loan.count()
        const loanId = `L-${date}-${String(count + 1).padStart(4, '0')}`

        const loan = await prisma.loan.create({
            data: {
                loanId,
                workerId: body.workerId,
                principal: body.principal,
                balance: body.principal, // Initial balance = principal
                interestRate: body.interestRate || 0,
                disbursedAt: body.disbursedAt ? new Date(body.disbursedAt) : new Date(),
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                purpose: body.purpose,
                notes: body.notes,
                status: 'ACTIVE',
                createdById: (session.user as any).id,
            },
            include: {
                worker: { select: { firstNameTH: true, lastNameTH: true } }
            }
        })

        // Audit log
        await logCreate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'loans',
            loan.id,
            loan
        )

        return NextResponse.json(loan, { status: 201 })
    } catch (error) {
        console.error('Create Loan Error:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
            { status: 500 }
        )
    }
}
