const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Start seeding...')

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 12)

    const admin = await prisma.user.upsert({
        where: { email: 'admin@v-group.la' },
        update: {},
        create: {
            email: 'admin@v-group.la',
            password: hashedPassword,
            name: 'Admin V-GROUP',
            role: 'ADMIN',
        },
    })

    console.log('✅ Created admin user:', admin.email)

    // Create Manager User
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

    console.log('✅ Created manager user:', manager.email)

    // Create Staff User
    const staff = await prisma.user.upsert({
        where: { email: 'staff@v-group.la' },
        update: {},
        create: {
            email: 'staff@v-group.la',
            password: await bcrypt.hash('staff123', 12),
            name: 'Staff Demo',
            role: 'STAFF',
        },
    })

    console.log('✅ Created staff user:', staff.email)

    console.log('🎉 Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
