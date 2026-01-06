const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

// Helper functions
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomElement(array) {
    return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Sample data
const thaiFirstNames = ['สมชาย', 'สมหญิง', 'วิชัย', 'วันทนา', 'ประยุทธ์', 'สุดา', 'มานี', 'มานะ', 'ชัยวัฒน์', 'พิมพ์ใจ']
const thaiLastNames = ['คุณธรรม', 'ศรีสุข', 'แสงทอง', 'รักไทย', 'จันทร์งาม', 'มั่งมี', 'สว่างวงศ์', 'บุญมี', 'ดีใจ', 'เจริญสุข']

const laoFirstNames = ['ສົມຊາຍ', 'ສົມຍິງ', 'ວິໄຊ', 'ອານຸພາບ', 'ບຸນທັນ', 'ແສງດາວ', 'ວັນທາ', 'ສຸກໃຈ', 'ຄຳໃຈ', 'ພູມໃຈ']
const laoLastNames = ['ວົງສະຫວັດ', 'ໂພທິສານ', 'ບຸນມາ', 'ຄຳປາ', 'ລາວົງ', 'ຈັນທະວົງ', 'ແສງສຸດາ', 'ອຸດົມຊັບ', 'ສີສຸພັນ', 'ພັນທະວົງ']

const engFirstNames = ['John', 'David', 'Michael', 'Sarah', 'Emma', 'James', 'Robert', 'Mary', 'Patricia', 'Jennifer']
const engLastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']

const companyNames = [
    'บริษัท ไทยอุตสาหกรรม จำกัด',
    'โรงงานผลิตชิ้นส่วนอิเล็กทรอนิกส์',
    'บริษัท สยามอาหารแช่แข็ง จำกัด',
    'โรงงานทอผ้าและเสื้อผ้าสำเร็จรูป',
    'บริษัท กลอบอลออโต้พาร์ท จำกัด',
    'โรงงานประกอบเครื่องใช้ไฟฟ้า',
    'บริษัท แพ็คเก็จจิ้ง โซลูชั่น จำกัด',
    'โรงงานผลิตพลาสติก',
    'บริษัท ไทยฟู้ดโปรเซสซิ่ง จำกัด',
    'โรงงานผลิตเฟอร์นิเจอร์',
]

const agentCompanies = [
    'บริษัท สรรหาแรงงาน เอเชีย จำกัด',
    'หจก. ส่งคนไปทำงาน',
    'บริษัท แรงงานคุณภาพ จำกัด',
    'หจก. บริการแรงงานต่างด้าว',
    'บริษัท ส่งออกแรงงาน อินเตอร์ จำกัด',
]


async function main() {
    console.log('🌱 Starting comprehensive data seeding...\n')

    // ========== USERS ==========
    console.log('👥 Creating users...')
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@v-group.la' },
        update: {},
        create: {
            email: 'admin@v-group.la',
            password: hashedPassword,
            name: 'Admin V-GROUP',
            role: 'SUPER_ADMIN',
        },
    })

    const manager = await prisma.user.upsert({
        where: { email: 'manager@v-group.la' },
        update: {},
        create: {
            email: 'manager@v-group.la',
            password: await bcrypt.hash('manager123', 12),
            name: 'Manager Demo',
            role: 'MANAGER',
        },
    })

    const staff1 = await prisma.user.upsert({
        where: { email: 'staff1@v-group.la' },
        update: {},
        create: {
            email: 'staff1@v-group.la',
            password: await bcrypt.hash('staff123', 12),
            name: 'Staff 1',
            role: 'STAFF',
        },
    })

    const staff2 = await prisma.user.upsert({
        where: { email: 'staff2@v-group.la' },
        update: {},
        create: {
            email: 'staff2@v-group.la',
            password: await bcrypt.hash('staff123', 12),
            name: 'Staff 2',
            role: 'STAFF',
        },
    })

    const staff3 = await prisma.user.upsert({
        where: { email: 'staff3@v-group.la' },
        update: {},
        create: {
            email: 'staff3@v-group.la',
            password: await bcrypt.hash('staff123', 12),
            name: 'Staff 3',
            role: 'STAFF',
        },
    })

    const users = [admin, manager, staff1, staff2, staff3]
    console.log(`✅ Created ${users.length} users\n`)

    // ========== AGENTS ==========
    console.log('🏢 Creating agents...')
    const agents = []
    for (let i = 0; i < 15; i++) {
        const agent = await prisma.agent.create({
            data: {
                agentId: `A-${String(i + 1).padStart(4, '0')}`,
                companyName: `${randomElement(agentCompanies)} ${i + 1}`,
                contactPerson: `${randomElement(thaiFirstNames)} ${randomElement(thaiLastNames)}`,
                phoneNumber: `0${randomInt(2, 9)}${randomInt(1000000, 9999999)}`,
                email: `agent${i + 1}@example.com`,
                address: `${randomInt(1, 999)} ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ กรุงเทพมหานคร`,
                taxId: `${randomInt(1000000000, 9999999999)}`,
                commissionRate: randomElement([3, 5, 7, 10, 15]),
                tier: randomElement([1, 1, 2, 2, 3]),
                status: 'ACTIVE',
                totalRecruits: randomInt(5, 50),
                passRate: randomInt(70, 95),
                dropoutRate: randomInt(5, 15),
                createdById: randomElement(users).id,
            },
        })
        agents.push(agent)
    }
    console.log(`✅ Created ${agents.length} agents\n`)

    // ========== CLIENTS ==========
    console.log('💼 Creating clients...')
    const clients = []
    for (let i = 0; i < 20; i++) {
        const client = await prisma.client.create({
            data: {
                clientId: `C-${String(i + 1).padStart(4, '0')}`,
                companyName: randomElement(companyNames),
                companyNameEN: randomElement(companyNames).replace(/บริษัท|จำกัด|หจก./g, '').trim(),
                contactPerson: `${randomElement(thaiFirstNames)} ${randomElement(thaiLastNames)}`,
                phoneNumber: `0${randomInt(2, 9)}${randomInt(1000000, 9999999)}`,
                email: `client${i + 1}@company.com`,
                address: `${randomInt(1, 999)} หมู่ ${randomInt(1, 20)} ต.บางพลี อ.บางพลี จ.สมุทรปราการ`,
                taxId: `${randomInt(1000000000, 9999999999)}`,
                industry: randomElement(['Manufacturing', 'Electronics', 'Food Processing', 'Textile', 'Automotive Parts']),
                employeeCount: randomInt(50, 500),
                creditLimit: randomInt(100000, 1000000),
                mouQuotaTotal: randomInt(20, 100),
                mouQuotaUsed: randomInt(0, 50),
                status: 'ACTIVE',
                createdById: randomElement(users).id,
            },
        })
        clients.push(client)
    }
    console.log(`✅ Created ${clients.length} clients\n`)

    // ========== WORKERS ==========
    console.log('👷 Creating workers (this may take a while)...')
    const workers = []
    const statuses = ['NEW_LEAD', 'SCREENING', 'PROCESSING', 'ACADEMY', 'READY', 'DEPLOYED', 'WORKING', 'CONTRACT_END', 'TERMINATED']
    const statusWeights = [10, 5, 10, 8, 7, 15, 35, 7, 3] // Percentage distribution

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    for (let i = 0; i < 200; i++) {
        const nationality = Math.random() < 0.7 ? 'LAO' : Math.random() < 0.85 ? 'THA' : Math.random() < 0.95 ? 'KHM' : 'MMR'
        const gender = randomElement(['MALE', 'MALE', 'FEMALE']) // 66% male

        // Weighted random status
        const rand = Math.random() * 100
        let cumulative = 0
        let status = 'WORKING'
        for (let j = 0; j < statuses.length; j++) {
            cumulative += statusWeights[j]
            if (rand <= cumulative) {
                status = statuses[j]
                break
            }
        }

        const createdAt = randomDate(sixMonthsAgo, new Date())

        const worker = await prisma.worker.create({
            data: {
                workerId: `WK-${String(i + 1).padStart(4, '0')}`,
                firstNameTH: randomElement(thaiFirstNames),
                lastNameTH: randomElement(thaiLastNames),
                firstNameEN: randomElement(engFirstNames),
                lastNameEN: randomElement(engLastNames),
                firstNameLA: nationality === 'LAO' ? randomElement(laoFirstNames) : null,
                lastNameLA: nationality === 'LAO' ? randomElement(laoLastNames) : null,
                nickname: randomElement(['แดง', 'ดำ', 'ขาว', 'เล็ก', 'ใหญ่', 'หนู', 'ต้อม', 'บอย']),
                gender,
                dateOfBirth: randomDate(new Date(1990, 0, 1), new Date(2002, 0, 1)),
                nationality,
                religion: nationality === 'LAO' ? 'Buddhism' : randomElement(['Buddhism', 'Christianity', 'Islam']),
                phoneNumber: `+856${randomInt(20000000, 29999999)}`,
                email: Math.random() > 0.5 ? `worker${i + 1}@example.com` : null,
                address: `ບ້ານ ${randomElement(['ດົງປາລັນ', 'ນາເດື່ອ', 'ທົ່ງຄັງ', 'ພອນສະຫວັນ'])} ເມືອງ ${randomElement(['ໄຊຍະບູລີ', 'ວຽງຈັນ', 'ຫຼວງພະບາງ'])}`,
                emergencyName: `${randomElement(laoFirstNames)} ${randomElement(laoLastNames)}`,
                emergencyPhone: `+856${randomInt(20000000, 29999999)}`,
                emergencyRelation: randomElement(['พ่อ', 'แม่', 'พี่', 'น้อง', 'สามี', 'ภรรยา']),
                status,
                agentId: Math.random() > 0.2 ? randomElement(agents).id : null,
                clientId: status === 'WORKING' || status === 'DEPLOYED' ? randomElement(clients).id : null,
                position: status === 'WORKING' ? randomElement(['Operator', 'Packer', 'QC Inspector', 'Line Leader', 'Technician']) : null,
                salary: status === 'WORKING' ? randomInt(12000, 18000) : null,
                startDate: status === 'WORKING' || status === 'DEPLOYED' ? randomDate(sixMonthsAgo, new Date()) : null,
                deploymentDate: status === 'DEPLOYED' || status === 'WORKING' ? randomDate(sixMonthsAgo, new Date()) : null,
                bloodType: randomElement(['A', 'B', 'AB', 'O']),
                passportNo: `N${randomInt(1000000, 9999999)}`,
                passportExpiry: new Date(2027, randomInt(0, 11), randomInt(1, 28)),
                visaExpiry: new Date(2026, randomInt(6, 11), randomInt(1, 28)),
                workPermitExpiry: new Date(2026, randomInt(6, 11), randomInt(1, 28)),
                createdById: randomElement(users).id,
                createdAt,
                updatedAt: createdAt,
            },
        })
        workers.push(worker)

        if ((i + 1) % 20 === 0) {
            process.stdout.write(`\r   Progress: ${i + 1}/200`)
        }
    }
    console.log(`\r✅ Created ${workers.length} workers\n`)

    // ========== LOANS ==========
    console.log('💰 Creating loans...')
    const workingWorkers = workers.filter(w => ['WORKING', 'DEPLOYED'].includes(w.status))
    const loans = []

    for (let i = 0; i < 70; i++) {
        const worker = randomElement(workingWorkers)
        const principal = randomInt(5000, 50000)
        const interestRate = randomElement([0, 2, 3, 5])
        const balance = principal * (1 - Math.random() * 0.7) // 0-70% paid
        const loanStatus = balance > principal * 0.1 ? (Math.random() > 0.15 ? 'ACTIVE' : 'OVERDUE') : 'PAID_OFF'

        const loan = await prisma.loan.create({
            data: {
                loanId: `L-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
                workerId: worker.id,
                principal,
                interestRate,
                balance: loanStatus === 'PAID_OFF' ? 0 : balance,
                disbursedAt: randomDate(sixMonthsAgo, new Date()),
                dueDate: new Date(2026, randomInt(0, 11), randomInt(1, 28)),
                status: loanStatus,
                purpose: randomElement(['ค่าเดินทาง', 'ค่าอบรม', 'ค่าใช้จ่ายส่วนตัว', 'เหตุฉุกเฉิน']),
                createdById: randomElement(users).id,
            },
        })
        loans.push(loan)
    }
    console.log(`✅ Created ${loans.length} loans\n`)

    // ========== PAYMENTS ==========
    console.log('💵 Creating payments...')
    const payments = []
    for (const loan of loans) {
        const numPayments = randomInt(2, 10)
        for (let i = 0; i < numPayments; i++) {
            const payment = await prisma.payment.create({
                data: {
                    paymentId: `P-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(payments.length + 1).padStart(4, '0')}`,
                    loanId: loan.id,
                    amount: randomInt(500, 5000),
                    method: randomElement(['CASH', 'BANK_TRANSFER', 'PAYROLL_DEDUCTION', 'MOBILE_BANKING']),
                    paidAt: randomDate(loan.disbursedAt, new Date()),
                    reference: `REF${randomInt(100000, 999999)}`,
                    recordedById: randomElement(users).id,
                },
            })
            payments.push(payment)
        }
    }
    console.log(`✅ Created ${payments.length} payments\n`)

    // ========== COMMISSIONS ==========
    console.log('🎯 Creating commissions...')
    const commissions = []
    for (let i = 0; i < 50; i++) {
        const agent = randomElement(agents)
        const commission = await prisma.commission.create({
            data: {
                commissionId: `COM-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
                agentId: agent.id,
                workerId: Math.random() > 0.3 ? randomElement(workers).id : null,
                amount: randomInt(5000, 30000),
                type: randomElement(['RECRUITMENT', 'RECRUITMENT', 'RETENTION', 'PERFORMANCE']),
                status: randomElement(['PENDING', 'APPROVED', 'PAID', 'PAID']),
                calculatedById: randomElement(users).id,
                approvedById: Math.random() > 0.3 ? randomElement([admin, manager]).id : null,
                approvedAt: Math.random() > 0.3 ? randomDate(sixMonthsAgo, new Date()) : null,
                paidAt: Math.random() > 0.5 ? randomDate(sixMonthsAgo, new Date()) : null,
            },
        })
        commissions.push(commission)
    }
    console.log(`✅ Created ${commissions.length} commissions\n`)

    // ========== SOS ALERTS ==========
    console.log('🚨 Creating SOS alerts...')
    const sosAlerts = []
    for (let i = 0; i < 12; i++) {
        const sos = await prisma.sosAlert.create({
            data: {
                alertId: `SOS-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
                workerId: randomElement(workingWorkers).id,
                type: randomElement(['EMERGENCY', 'HEALTH', 'WORKPLACE', 'LEGAL', 'DOCUMENT']),
                priority: randomElement(['LOW', 'MEDIUM', 'HIGH', 'HIGH', 'CRITICAL']),
                description: randomElement([
                    'ป่วยฉุกเฉิน ต้องการไปโรงพยาบาล',
                    'มีปัญหากับนายจ้าง เรื่องค่าแรง',
                    'เอกสารหมดอายุ ต้องการความช่วยเหลือ',
                    'อุบัติเหตุขณะทำงาน',
                    'ต้องการคำปรึกษาด้านกฎหมาย',
                ]),
                location: randomElement(['โรงงาน A', 'หอพัก B', 'โรงพยาบาล C', 'สถานีตำรวจ D']),
                status: randomElement(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'RESOLVED', 'CLOSED']),
                resolvedById: Math.random() > 0.4 ? randomElement(users).id : null,
                resolvedAt: Math.random() > 0.4 ? randomDate(sixMonthsAgo, new Date()) : null,
                resolution: Math.random() > 0.4 ? 'ได้ดำเนินการแล้ว สถานการณ์กลับคืนสู่ปกติ' : null,
            },
        })
        sosAlerts.push(sos)
    }
    console.log(`✅ Created ${sosAlerts.length} SOS alerts\n`)

    // ========== ORDERS ==========
    console.log('📦 Creating orders...')
    const orders = []
    for (let i = 0; i < 35; i++) {
        const order = await prisma.order.create({
            data: {
                orderId: `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${String(i + 1).padStart(4, '0')}`,
                clientId: randomElement(clients).id,
                requestedCount: randomInt(5, 30),
                gender: Math.random() > 0.3 ? randomElement(['MALE', 'FEMALE']) : null,
                skills: randomElement([
                    ['Welding', 'Blueprint Reading'],
                    ['Assembly', 'Quality Control'],
                    ['Packing', 'Forklift'],
                    ['Sewing', 'Pattern Cutting'],
                ]),
                startDate: randomDate(new Date(), new Date(2026, 11, 31)),
                pricePerHead: randomInt(15000, 25000),
                totalPrice: randomInt(200000, 500000),
                status: randomElement(['DRAFT', 'QUOTED', 'APPROVED', 'APPROVED', 'DEPLOYING', 'COMPLETED']),
                approvedAt: Math.random() > 0.4 ? randomDate(sixMonthsAgo, new Date()) : null,
                createdById: randomElement(users).id,
            },
        })
        orders.push(order)
    }
    console.log(`✅ Created ${orders.length} orders\n`)

    // ========== SUMMARY ==========
    console.log('\n🎉 Data seeding completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   Users: ${users.length}`)
    console.log(`   Agents: ${agents.length}`)
    console.log(`   Clients: ${clients.length}`)
    console.log(`   Workers: ${workers.length}`)
    console.log(`   Loans: ${loans.length}`)
    console.log(`   Payments: ${payments.length}`)
    console.log(`   Commissions: ${commissions.length}`)
    console.log(`   SOS Alerts: ${sosAlerts.length}`)
    console.log(`   Orders: ${orders.length}`)
    console.log('\n✅ You can now login with:')
    console.log('   📧 admin@v-group.la')
    console.log('   🔑 admin123\n')
}

main()
    .catch((e) => {
        console.error('\n❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
