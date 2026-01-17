// =====================================================
// Worker Journey Simulation API
// จำลองเส้นทางแรงงานตั้งแต่ต้นจนได้ทำงาน
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logCreate, logUpdate } from '@/lib/audit'

// =====================================================
// Sample Data
// =====================================================

const DEMO_PARTNER = {
    name: 'ພັນທະມິດຈັດຫາງານວຽງຈັນ',
    nameEN: 'Vientiane Employment Partner',
    contactPerson: 'ທ່ານ ສົມພອນ ວົງໄຊ',
    phoneNumber: '+856 21 555 1234',
    email: 'contact@vep-lao.la',
    address: 'ບ້ານໂພນສະຫວັນ, ເມືອງໄຊເສດຖາ, ນະຄອນຫຼວງວຽງຈັນ',
    country: 'LAO',
    type: 'RECRUITMENT',
}

const DEMO_WORKER = {
    firstNameTH: 'อภิชา',
    lastNameTH: 'อัศวา',
    nickname: 'ชา',
    nationality: 'LAO',
    dateOfBirth: new Date('1998-05-15'),
    gender: 'MALE' as const,
    phoneNumber: '+856 20 5551234',
    originAddress: 'ບ້ານນາຄູນ, ເມືອງໄຊບູລີ, ແຂວງສະຫວັນນະເຂດ, ສປປ ລາວ',
    position: 'Production Operator',
}

const DEMO_CLIENT = {
    companyName: 'บริษัท ไทยซัมมิท โอโตพาร์ท จำกัด',
    type: 'FACTORY' as const,
    contactPerson: 'คุณ สมชาย มั่นคง',
    phoneNumber: '02-123-4567',
    email: 'hr@thaisummit.co.th',
    address: '99/9 นิคมอุตสาหกรรมบางปู ถ.สุขุมวิท ต.แพรกษา อ.เมืองสมุทรปราการ จ.สมุทรปราการ 10280',
}

// =====================================================
// Journey Steps
// =====================================================

interface JourneyStep {
    step: number
    name: string
    status: string | null
    menu: string
    api: string
    completed: boolean
    data?: any
}

async function getJourneyStatus(): Promise<JourneyStep[]> {
    const existingPartner = await prisma.partner.findFirst({
        where: { name: DEMO_PARTNER.name }
    })
    const existingClient = await prisma.client.findFirst({
        where: { companyName: DEMO_CLIENT.companyName }
    })
    const existingWorker = await prisma.worker.findFirst({
        where: {
            firstNameTH: DEMO_WORKER.firstNameTH,
            lastNameTH: DEMO_WORKER.lastNameTH
        }
    })

    const workerStatus = existingWorker?.status || null

    return [
        {
            step: 1,
            name: 'Partner รับแรงงาน',
            status: null,
            menu: 'V-Connect > Partners',
            api: 'POST /api/partners',
            completed: !!existingPartner,
            data: existingPartner ? { id: existingPartner.id, name: existingPartner.name } : null
        },
        {
            step: 2,
            name: 'สร้าง Worker ใหม่',
            status: 'NEW',
            menu: 'V-Connect > Workers > New',
            api: 'POST /api/workers',
            completed: !!existingWorker,
            data: existingWorker ? { id: existingWorker.id, workerId: existingWorker.workerId } : null
        },
        {
            step: 3,
            name: 'ทำเอกสาร',
            status: 'DOCUMENTING',
            menu: 'Workers > Edit',
            api: 'PUT /api/workers/[id]',
            completed: existingWorker?.hasPassport && existingWorker?.hasVisa && existingWorker?.hasWorkPermit || false,
        },
        {
            step: 4,
            name: 'ฝึกอบรม Academy',
            status: 'TRAINING',
            menu: 'Academy > Enroll',
            api: 'POST /api/academy/enroll',
            completed: workerStatus === 'TRAINING' || ['READY', 'DEPLOYED', 'WORKING'].includes(workerStatus || ''),
        },
        {
            step: 5,
            name: 'จบอบรม - พร้อมส่งตัว',
            status: 'READY',
            menu: 'Academy > Graduate',
            api: 'POST /api/academy/graduate',
            completed: ['READY', 'DEPLOYED', 'WORKING'].includes(workerStatus || ''),
        },
        {
            step: 6,
            name: 'จัดส่งให้ลูกค้า',
            status: 'DEPLOYED',
            menu: 'Deployment > New',
            api: 'POST /api/deployment',
            completed: ['DEPLOYED', 'WORKING'].includes(workerStatus || ''),
            data: existingClient ? { id: existingClient.id, name: existingClient.companyName } : null
        },
        {
            step: 7,
            name: 'เริ่มทำงาน',
            status: 'WORKING',
            menu: 'Workers > Edit',
            api: 'PUT /api/workers/[id]',
            completed: workerStatus === 'WORKING',
        },
    ]
}

// =====================================================
// GET - Get Journey Status
// =====================================================
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const steps = await getJourneyStatus()
        const completedSteps = steps.filter(s => s.completed).length
        const worker = await prisma.worker.findFirst({
            where: { firstNameTH: DEMO_WORKER.firstNameTH, lastNameTH: DEMO_WORKER.lastNameTH },
            include: { partner: true, client: true }
        })

        return NextResponse.json({
            title: 'Worker Journey Simulation',
            worker: worker ? {
                id: worker.id,
                workerId: worker.workerId,
                name: `${worker.firstNameTH} ${worker.lastNameTH}`,
                status: worker.status,
                partner: worker.partner?.name,
                client: worker.client?.companyName,
            } : null,
            progress: {
                completed: completedSteps,
                total: steps.length,
                percentage: Math.round((completedSteps / steps.length) * 100)
            },
            steps
        })
    } catch (error) {
        console.error('Journey Status Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// =====================================================
// POST - Run Full Journey
// =====================================================
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userId = (session.user as any).id
        const userEmail = session.user?.email || ''
        const userName = session.user?.name || ''
        const user = { id: userId, email: userEmail, name: userName }
        const results: any[] = []

        // Step 1: Create Partner (if not exists)
        let partner = await prisma.partner.findFirst({ where: { name: DEMO_PARTNER.name } })
        if (!partner) {
            const count = await prisma.partner.count()
            partner = await prisma.partner.create({
                data: {
                    ...DEMO_PARTNER,
                    partnerId: `LAO-${String(count + 1).padStart(4, '0')}`,
                    createdById: userId,
                }
            })
            await logCreate(user, 'partners', partner.id, partner)
        }
        results.push({ step: 1, action: partner ? 'exists' : 'created', partnerId: partner.partnerId })

        // Step 2: Create Client (if not exists)
        let client = await prisma.client.findFirst({ where: { companyName: DEMO_CLIENT.companyName } })
        if (!client) {
            const count = await prisma.client.count()
            client = await prisma.client.create({
                data: {
                    ...DEMO_CLIENT,
                    clientId: `CLI-${String(count + 1).padStart(4, '0')}`,
                    createdById: userId,
                }
            })
            await logCreate(user, 'clients', client.id, client)
        }
        results.push({ step: 'prep', action: client ? 'exists' : 'created', clientId: client.clientId })

        // Step 3: Create Worker
        let worker = await prisma.worker.findFirst({
            where: { firstNameTH: DEMO_WORKER.firstNameTH, lastNameTH: DEMO_WORKER.lastNameTH }
        })
        if (!worker) {
            const count = await prisma.worker.count()
            const now = new Date()
            worker = await prisma.worker.create({
                data: {
                    ...DEMO_WORKER,
                    workerId: `W${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}-${String(count + 1).padStart(4, '0')}`,
                    status: 'NEW',
                    partnerId: partner.id,
                    createdById: userId,
                }
            })
            await logCreate(user, 'workers', worker.id, worker)
        }
        results.push({ step: 2, action: 'created', workerId: worker.workerId, status: 'NEW' })

        // Step 4: Documents
        if (!worker.hasPassport || !worker.hasVisa || !worker.hasWorkPermit) {
            const oldWorker = { ...worker }
            worker = await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    status: 'DOCUMENTING',
                    hasIdCard: true,
                    hasPassport: true,
                    hasVisa: true,
                    hasWorkPermit: true,
                    hasMedicalCert: true,
                }
            })
            await logUpdate(user, 'workers', worker.id, oldWorker, worker)
        }
        results.push({ step: 3, action: 'documented', status: 'DOCUMENTING' })

        // Step 5: Academy Enroll
        if (worker.status !== 'TRAINING' && !['READY', 'DEPLOYED', 'WORKING'].includes(worker.status)) {
            const oldWorker = { ...worker }
            const startDate = new Date()
            const endDate = new Date()
            endDate.setDate(endDate.getDate() + 14)

            worker = await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    status: 'TRAINING',
                    hasAcademyTraining: true,
                    academyStartDate: startDate,
                    academyEndDate: endDate,
                }
            })
            await logUpdate(user, 'workers', worker.id, oldWorker, worker)
        }
        results.push({ step: 4, action: 'enrolled', status: 'TRAINING' })

        // Step 6: Graduate
        if (!['READY', 'DEPLOYED', 'WORKING'].includes(worker.status)) {
            const oldWorker = { ...worker }
            worker = await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    status: 'READY',
                    academyEndDate: new Date(),
                }
            })
            await logUpdate(user, 'workers', worker.id, oldWorker, worker)
        }
        results.push({ step: 5, action: 'graduated', status: 'READY' })

        // Step 7: Deploy
        if (!['DEPLOYED', 'WORKING'].includes(worker.status)) {
            const oldWorker = { ...worker }
            worker = await prisma.worker.update({
                where: { id: worker.id },
                data: {
                    status: 'DEPLOYED',
                    clientId: client.id,
                    startDate: new Date(),
                }
            })
            await logUpdate(user, 'workers', worker.id, oldWorker, worker)
        }
        results.push({ step: 6, action: 'deployed', status: 'DEPLOYED', client: client.companyName })

        // Step 8: Working
        if (worker.status !== 'WORKING') {
            const oldWorker = { ...worker }
            worker = await prisma.worker.update({
                where: { id: worker.id },
                data: { status: 'WORKING' }
            })
            await logUpdate(user, 'workers', worker.id, oldWorker, worker)
        }
        results.push({ step: 7, action: 'working', status: 'WORKING' })

        // Final result
        const finalWorker = await prisma.worker.findUnique({
            where: { id: worker.id },
            include: { partner: true, client: true }
        })

        return NextResponse.json({
            success: true,
            message: `Journey completed for ${DEMO_WORKER.firstNameTH} ${DEMO_WORKER.lastNameTH}`,
            worker: {
                id: finalWorker!.id,
                workerId: finalWorker!.workerId,
                name: `${finalWorker!.firstNameTH} ${finalWorker!.lastNameTH}`,
                status: finalWorker!.status,
                partner: finalWorker!.partner?.name,
                client: finalWorker!.client?.companyName,
                documents: {
                    passport: finalWorker!.hasPassport,
                    visa: finalWorker!.hasVisa,
                    workPermit: finalWorker!.hasWorkPermit,
                    medicalCert: finalWorker!.hasMedicalCert,
                    academy: finalWorker!.hasAcademyTraining,
                }
            },
            steps: results
        })
    } catch (error) {
        console.error('Journey Simulation Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// =====================================================
// DELETE - Reset Demo Data
// =====================================================
export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const userRole = (session.user as any)?.role?.name
        if (userRole !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Only SUPER_ADMIN can reset demo data' },
                { status: 403 }
            )
        }

        // Delete worker first (due to foreign keys)
        const deletedWorker = await prisma.worker.deleteMany({
            where: { firstNameTH: DEMO_WORKER.firstNameTH, lastNameTH: DEMO_WORKER.lastNameTH }
        })

        return NextResponse.json({
            success: true,
            message: 'Demo data reset',
            deleted: {
                workers: deletedWorker.count,
            }
        })
    } catch (error) {
        console.error('Reset Demo Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
