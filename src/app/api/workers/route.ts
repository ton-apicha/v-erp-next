import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { logCreate } from '@/lib/audit'

// GET /api/workers - List all workers
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const workers = await prisma.worker.findMany({
            include: {
                createdBy: { select: { name: true } },
                partner: { select: { name: true } },
                client: { select: { companyName: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(workers)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/workers - Create new worker
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Permission check
        const userRole = (session.user as any)?.role?.name
        if (!['SUPER_ADMIN', 'MANAGER', 'TH_OPERATOR', 'LAO_MANAGER', 'LAO_OPERATOR'].includes(userRole || '')) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()

        // Validate required fields
        if (!body.firstNameTH || !body.lastNameTH || !body.gender || !body.dateOfBirth) {
            return NextResponse.json(
                { error: 'กรุณากรอกข้อมูลที่จำเป็น' },
                { status: 400 }
            )
        }

        // Generate Worker ID (format: WK-YYYYMMDD-XXX)
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
        const count = await prisma.worker.count()
        const workerId = `WK-${date}-${String(count + 1).padStart(3, '0')}`

        // Create worker
        const worker = await prisma.worker.create({
            data: {
                workerId,
                firstNameTH: body.firstNameTH,
                lastNameTH: body.lastNameTH,
                nickname: body.nickname,
                gender: body.gender,
                dateOfBirth: new Date(body.dateOfBirth || '1990-01-01'),
                nationality: body.nationality || 'LAO',
                phoneNumber: body.phoneNumber,
                address: body.address,
                passportNo: body.passportNo,
                visaNo: body.visaNo,
                workPermitNo: body.workPermitNo,
                // Document Tags
                hasPassport: body.hasPassport || false,
                hasVisa: body.hasVisa || false,
                hasWorkPermit: body.hasWorkPermit || false,
                hasMedicalCert: body.hasMedicalCert || false,
                hasAcademyTraining: body.hasAcademyTraining || false,
                // Relations
                partnerId: body.partnerId && body.partnerId !== 'none' ? body.partnerId : null,
                clientId: body.clientId && body.clientId !== 'none' ? body.clientId : null,
                status: 'NEW',
                createdById: (session.user as any).id,
            },
        })

        // Audit log
        await logCreate(
            {
                id: (session.user as any).id,
                email: session.user.email || '',
                name: session.user.name || '',
            },
            'workers',
            worker.id,
            worker
        )

        return NextResponse.json(worker, { status: 201 })
    } catch (error) {
        console.error('Error creating worker:', error)
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' },
            { status: 500 }
        )
    }
}
