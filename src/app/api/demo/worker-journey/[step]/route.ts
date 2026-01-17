// =====================================================
// Worker Journey Step-by-Step API
// Run individual steps of the journey
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logCreate, logUpdate } from '@/lib/audit'

// Sample Data (same as main route)
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

// Step descriptions
const STEP_INFO: Record<number, { name: string; status: string | null; menu: string }> = {
    1: { name: 'Partner รับแรงงาน', status: null, menu: 'V-Connect > Partners' },
    2: { name: 'สร้าง Worker ใหม่', status: 'NEW', menu: 'V-Connect > Workers > New' },
    3: { name: 'ทำเอกสาร', status: 'DOCUMENTING', menu: 'Workers > Edit' },
    4: { name: 'ฝึกอบรม Academy', status: 'TRAINING', menu: 'Academy > Enroll' },
    5: { name: 'จบอบรม - พร้อมส่งตัว', status: 'READY', menu: 'Academy > Graduate' },
    6: { name: 'จัดส่งให้ลูกค้า', status: 'DEPLOYED', menu: 'Deployment > New' },
    7: { name: 'เริ่มทำงาน', status: 'WORKING', menu: 'Workers > Edit' },
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ step: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { step: stepStr } = await context.params
        const step = parseInt(stepStr)

        if (isNaN(step) || step < 1 || step > 7) {
            return NextResponse.json(
                { error: 'Invalid step. Must be 1-7' },
                { status: 400 }
            )
        }

        const userId = (session.user as any).id
        const userEmail = session.user?.email || ''
        const userName = session.user?.name || ''
        const user = { id: userId, email: userEmail, name: userName }

        const stepInfo = STEP_INFO[step]
        let result: any = { step, name: stepInfo.name, menu: stepInfo.menu }

        // Get existing data
        let partner = await prisma.partner.findFirst({ where: { name: DEMO_PARTNER.name } })
        let client = await prisma.client.findFirst({ where: { companyName: DEMO_CLIENT.companyName } })
        let worker = await prisma.worker.findFirst({
            where: { firstNameTH: DEMO_WORKER.firstNameTH, lastNameTH: DEMO_WORKER.lastNameTH }
        })

        switch (step) {
            case 1:
                // Create Partner
                if (partner) {
                    result.action = 'already_exists'
                    result.partner = { id: partner.id, partnerId: partner.partnerId, name: partner.name }
                } else {
                    const count = await prisma.partner.count()
                    partner = await prisma.partner.create({
                        data: {
                            ...DEMO_PARTNER,
                            partnerId: `LAO-${String(count + 1).padStart(4, '0')}`,
                            createdById: userId,
                        }
                    })
                    await logCreate(user, 'partners', partner.id, partner)
                    result.action = 'created'
                    result.partner = { id: partner.id, partnerId: partner.partnerId, name: partner.name }
                }
                break

            case 2:
                // Create Worker
                if (!partner) {
                    return NextResponse.json(
                        { error: 'Partner not found. Run step 1 first.' },
                        { status: 400 }
                    )
                }
                if (worker) {
                    result.action = 'already_exists'
                    result.worker = { id: worker.id, workerId: worker.workerId, status: worker.status }
                } else {
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
                    result.action = 'created'
                    result.worker = { id: worker.id, workerId: worker.workerId, status: 'NEW' }
                }
                break

            case 3:
                // Documents
                if (!worker) {
                    return NextResponse.json(
                        { error: 'Worker not found. Run step 2 first.' },
                        { status: 400 }
                    )
                }
                if (worker.hasPassport && worker.hasVisa && worker.hasWorkPermit) {
                    result.action = 'already_completed'
                } else {
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
                    result.action = 'documented'
                }
                result.documents = {
                    idCard: true,
                    passport: true,
                    visa: true,
                    workPermit: true,
                    medicalCert: true,
                }
                result.status = 'DOCUMENTING'
                break

            case 4:
                // Academy Enroll
                if (!worker) {
                    return NextResponse.json(
                        { error: 'Worker not found. Run step 2 first.' },
                        { status: 400 }
                    )
                }
                if (['TRAINING', 'READY', 'DEPLOYED', 'WORKING'].includes(worker.status)) {
                    result.action = 'already_in_training_or_later'
                } else {
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
                    result.action = 'enrolled'
                }
                result.status = 'TRAINING'
                result.academy = {
                    startDate: worker?.academyStartDate,
                    endDate: worker?.academyEndDate,
                    duration: '14 days'
                }
                break

            case 5:
                // Graduate
                if (!worker) {
                    return NextResponse.json(
                        { error: 'Worker not found. Run step 2 first.' },
                        { status: 400 }
                    )
                }
                if (['READY', 'DEPLOYED', 'WORKING'].includes(worker.status)) {
                    result.action = 'already_graduated'
                } else {
                    const oldWorker = { ...worker }
                    worker = await prisma.worker.update({
                        where: { id: worker.id },
                        data: {
                            status: 'READY',
                            academyEndDate: new Date(),
                        }
                    })
                    await logUpdate(user, 'workers', worker.id, oldWorker, worker)
                    result.action = 'graduated'
                }
                result.status = 'READY'
                break

            case 6:
                // Deploy
                if (!worker) {
                    return NextResponse.json(
                        { error: 'Worker not found. Run step 2 first.' },
                        { status: 400 }
                    )
                }
                // Create client if not exists
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

                if (['DEPLOYED', 'WORKING'].includes(worker.status)) {
                    result.action = 'already_deployed'
                } else {
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
                    result.action = 'deployed'
                }
                result.status = 'DEPLOYED'
                result.client = { id: client.id, name: client.companyName }
                break

            case 7:
                // Working
                if (!worker) {
                    return NextResponse.json(
                        { error: 'Worker not found. Run step 2 first.' },
                        { status: 400 }
                    )
                }
                if (worker.status === 'WORKING') {
                    result.action = 'already_working'
                } else {
                    const oldWorker = { ...worker }
                    worker = await prisma.worker.update({
                        where: { id: worker.id },
                        data: { status: 'WORKING' }
                    })
                    await logUpdate(user, 'workers', worker.id, oldWorker, worker)
                    result.action = 'status_updated'
                }
                result.status = 'WORKING'
                result.message = '🎉 นาย Apicha Atsawa เริ่มทำงานแล้ว!'
                break
        }

        // Get updated worker info
        if (worker) {
            const updatedWorker = await prisma.worker.findUnique({
                where: { id: worker.id },
                include: { partner: true, client: true }
            })
            result.currentWorker = {
                id: updatedWorker!.id,
                workerId: updatedWorker!.workerId,
                name: `${updatedWorker!.firstNameTH} ${updatedWorker!.lastNameTH}`,
                status: updatedWorker!.status,
                partner: updatedWorker!.partner?.name,
                client: updatedWorker!.client?.companyName,
            }
        }

        return NextResponse.json({
            success: true,
            ...result
        })

    } catch (error) {
        console.error('Step Execution Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ step: string }> }
) {
    const { step: stepStr } = await context.params
    const step = parseInt(stepStr)

    if (isNaN(step) || step < 1 || step > 7) {
        return NextResponse.json(
            { error: 'Invalid step. Must be 1-7' },
            { status: 400 }
        )
    }

    const stepInfo = STEP_INFO[step]
    return NextResponse.json({
        step,
        ...stepInfo,
        usage: `POST /api/demo/worker-journey/${step}`,
        description: `Execute step ${step}: ${stepInfo.name}`
    })
}
