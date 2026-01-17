// ===========================================
// V-ERP Permission & Role Seed Data
// Version: 2.0.0
// ===========================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// =========================================
// PERMISSIONS DEFINITION
// =========================================

const permissions = [
    // ─── V-CONNECT (Laos) ─────────────────────
    { module: 'workers', action: 'create', displayName: 'สร้างแรงงาน', displayNameLA: 'ສ້າງແຮງງານ', company: 'V_CONNECT' },
    { module: 'workers', action: 'read', displayName: 'ดูแรงงาน', displayNameLA: 'ເບິ່ງແຮງງານ', company: 'V_CONNECT' },
    { module: 'workers', action: 'update', displayName: 'แก้ไขแรงงาน', displayNameLA: 'ແກ້ໄຂແຮງງານ', company: 'V_CONNECT' },
    { module: 'workers', action: 'delete', displayName: 'ลบแรงงาน', displayNameLA: 'ລຶບແຮງງານ', company: 'V_CONNECT' },

    { module: 'partners', action: 'create', displayName: 'สร้างพาร์ทเนอร์', displayNameLA: 'ສ້າງພາດເນີ', company: 'V_CONNECT' },
    { module: 'partners', action: 'read', displayName: 'ดูพาร์ทเนอร์', displayNameLA: 'ເບິ່ງພາດເນີ', company: 'V_CONNECT' },
    { module: 'partners', action: 'update', displayName: 'แก้ไขพาร์ทเนอร์', displayNameLA: 'ແກ້ໄຂພາດເນີ', company: 'V_CONNECT' },
    { module: 'partners', action: 'delete', displayName: 'ลบพาร์ทเนอร์', displayNameLA: 'ລຶບພາດເນີ', company: 'V_CONNECT' },

    { module: 'documents', action: 'create', displayName: 'อัพโหลดเอกสาร', displayNameLA: 'ອັບໂຫຼດເອກະສານ', company: 'V_CONNECT' },
    { module: 'documents', action: 'read', displayName: 'ดูเอกสาร', displayNameLA: 'ເບິ່ງເອກະສານ', company: 'V_CONNECT' },
    { module: 'documents', action: 'delete', displayName: 'ลบเอกสาร', displayNameLA: 'ລຶບເອກະສານ', company: 'V_CONNECT' },

    { module: 'academy', action: 'read', displayName: 'ดูศูนย์ฝึกอบรม', displayNameLA: 'ເບິ່ງສູນຝຶກອົບຮົມ', company: 'V_CONNECT' },
    { module: 'academy', action: 'manage', displayName: 'จัดการศูนย์ฝึกอบรม', displayNameLA: 'ຈັດການສູນຝຶກອົບຮົມ', company: 'V_CONNECT' },

    // ─── V-WORK (Thailand B2B) ────────────────
    { module: 'clients', action: 'create', displayName: 'สร้างลูกค้าโรงงาน', displayNameLA: 'ສ້າງລູກຄ້າໂຮງງານ', company: 'V_WORK' },
    { module: 'clients', action: 'read', displayName: 'ดูลูกค้าโรงงาน', displayNameLA: 'ເບິ່ງລູກຄ້າໂຮງງານ', company: 'V_WORK' },
    { module: 'clients', action: 'update', displayName: 'แก้ไขลูกค้าโรงงาน', displayNameLA: 'ແກ້ໄຂລູກຄ້າໂຮງງານ', company: 'V_WORK' },
    { module: 'clients', action: 'delete', displayName: 'ลบลูกค้าโรงงาน', displayNameLA: 'ລຶບລູກຄ້າໂຮງງານ', company: 'V_WORK' },

    { module: 'deployment', action: 'create', displayName: 'สร้างการจัดส่ง', displayNameLA: 'ສ້າງການຈັດສົ່ງ', company: 'V_WORK' },
    { module: 'deployment', action: 'read', displayName: 'ดูการจัดส่ง', displayNameLA: 'ເບິ່ງການຈັດສົ່ງ', company: 'V_WORK' },
    { module: 'deployment', action: 'update', displayName: 'แก้ไขการจัดส่ง', displayNameLA: 'ແກ້ໄຂການຈັດສົ່ງ', company: 'V_WORK' },

    { module: 'visa', action: 'read', displayName: 'ดูวีซ่า/ใบอนุญาต', displayNameLA: 'ເບິ່ງວີຊ່າ/ໃບອະນຸຍາດ', company: 'V_WORK' },
    { module: 'visa', action: 'manage', displayName: 'จัดการวีซ่า/ใบอนุญาต', displayNameLA: 'ຈັດການວີຊ່າ/ໃບອະນຸຍາດ', company: 'V_WORK' },

    { module: 'orders', action: 'create', displayName: 'สร้างคำสั่งซื้อ', displayNameLA: 'ສ້າງຄຳສັ່ງຊື້', company: 'V_WORK' },
    { module: 'orders', action: 'read', displayName: 'ดูคำสั่งซื้อ', displayNameLA: 'ເບິ່ງຄຳສັ່ງຊື້', company: 'V_WORK' },
    { module: 'orders', action: 'update', displayName: 'แก้ไขคำสั่งซื้อ', displayNameLA: 'ແກ້ໄຂຄຳສັ່ງຊື້', company: 'V_WORK' },

    // ─── V-CARE (Thailand B2C) ────────────────
    { module: 'homeClients', action: 'create', displayName: 'สร้างลูกค้าบุคคล', displayNameLA: 'ສ້າງລູກຄ້າບຸກຄົນ', company: 'V_CARE' },
    { module: 'homeClients', action: 'read', displayName: 'ดูลูกค้าบุคคล', displayNameLA: 'ເບິ່ງລູກຄ້າບຸກຄົນ', company: 'V_CARE' },
    { module: 'homeClients', action: 'update', displayName: 'แก้ไขลูกค้าบุคคล', displayNameLA: 'ແກ້ໄຂລູກຄ້າບຸກຄົນ', company: 'V_CARE' },

    { module: 'domesticWorkers', action: 'read', displayName: 'ดูแม่บ้าน', displayNameLA: 'ເບິ່ງແມ່ບ້ານ', company: 'V_CARE' },
    { module: 'domesticWorkers', action: 'manage', displayName: 'จัดการแม่บ้าน', displayNameLA: 'ຈັດການແມ່ບ້ານ', company: 'V_CARE' },

    { module: 'services', action: 'read', displayName: 'ดูบริการ', displayNameLA: 'ເບິ່ງບໍລິການ', company: 'V_CARE' },
    { module: 'services', action: 'manage', displayName: 'จัดการบริการ', displayNameLA: 'ຈັດການບໍລິການ', company: 'V_CARE' },

    // ─── V-HOLDING (Global) ───────────────────
    { module: 'dashboard', action: 'read', displayName: 'ดูแดชบอร์ด', displayNameLA: 'ເບິ່ງແດຊບອດ', company: 'V_HOLDING' },

    { module: 'finance', action: 'read', displayName: 'ดูการเงิน', displayNameLA: 'ເບິ່ງການເງິນ', company: 'V_HOLDING' },
    { module: 'finance', action: 'manage', displayName: 'จัดการการเงิน', displayNameLA: 'ຈັດການການເງິນ', company: 'V_HOLDING' },

    { module: 'reports', action: 'read', displayName: 'ดูรายงาน', displayNameLA: 'ເບິ່ງລາຍງານ', company: 'V_HOLDING' },
    { module: 'reports', action: 'export', displayName: 'ส่งออกรายงาน', displayNameLA: 'ສົ່ງອອກລາຍງານ', company: 'V_HOLDING' },

    { module: 'users', action: 'create', displayName: 'สร้างผู้ใช้', displayNameLA: 'ສ້າງຜູ້ໃຊ້', company: 'V_HOLDING' },
    { module: 'users', action: 'read', displayName: 'ดูผู้ใช้', displayNameLA: 'ເບິ່ງຜູ້ໃຊ້', company: 'V_HOLDING' },
    { module: 'users', action: 'update', displayName: 'แก้ไขผู้ใช้', displayNameLA: 'ແກ້ໄຂຜູ້ໃຊ້', company: 'V_HOLDING' },
    { module: 'users', action: 'delete', displayName: 'ลบผู้ใช้', displayNameLA: 'ລຶບຜູ້ໃຊ້', company: 'V_HOLDING' },

    { module: 'roles', action: 'read', displayName: 'ดูบทบาท', displayNameLA: 'ເບິ່ງບົດບາດ', company: 'V_HOLDING' },
    { module: 'roles', action: 'manage', displayName: 'จัดการบทบาท', displayNameLA: 'ຈັດການບົດບາດ', company: 'V_HOLDING' },

    { module: 'auditLogs', action: 'read', displayName: 'ดูประวัติการใช้งาน', displayNameLA: 'ເບິ່ງປະຫວັດການໃຊ້ງານ', company: 'V_HOLDING' },

    { module: 'settings', action: 'read', displayName: 'ดูตั้งค่า', displayNameLA: 'ເບິ່ງຕັ້ງຄ່າ', company: 'V_HOLDING' },
    { module: 'settings', action: 'update', displayName: 'แก้ไขตั้งค่า', displayNameLA: 'ແກ້ໄຂຕັ້ງຄ່າ', company: 'V_HOLDING' },

    { module: 'contractTemplates', action: 'read', displayName: 'ดู Template สัญญา', displayNameLA: 'ເບິ່ງ Template ສັນຍາ', company: 'V_HOLDING' },
    { module: 'contractTemplates', action: 'manage', displayName: 'จัดการ Template สัญญา', displayNameLA: 'ຈັດການ Template ສັນຍາ', company: 'V_HOLDING' },
];

// =========================================
// ROLES DEFINITION
// =========================================

const roles = [
    {
        name: 'SUPER_ADMIN',
        displayName: 'ผู้ดูแลระบบสูงสุด',
        displayNameLA: 'ຜູ້ເບິ່ງແຍງລະບົບສູງສຸດ',
        description: 'สิทธิ์เข้าถึงทุกส่วนของระบบ',
        companyAccess: ['V_CONNECT', 'V_WORK', 'V_CARE', 'V_HOLDING'],
        isSystem: true,
        permissionModules: ['*'], // ทุกอย่าง
    },
    {
        name: 'LAO_MANAGER',
        displayName: 'ผู้จัดการฝั่งลาว',
        displayNameLA: 'ຜູ້ຈັດການຝັ່ງລາວ',
        description: 'จัดการทุกอย่างในฝั่ง V-Connect',
        companyAccess: ['V_CONNECT'],
        isSystem: false,
        permissionModules: ['workers', 'partners', 'documents', 'academy', 'dashboard', 'reports'],
    },
    {
        name: 'LAO_STAFF',
        displayName: 'พนักงานฝั่งลาว',
        displayNameLA: 'ພະນັກງານຝັ່ງລາວ',
        description: 'ทำงานปกติในฝั่ง V-Connect',
        companyAccess: ['V_CONNECT'],
        isSystem: false,
        permissionModules: ['workers:create,read,update', 'partners:read', 'documents:create,read'],
    },
    {
        name: 'TH_MANAGER',
        displayName: 'ผู้จัดการฝั่งไทย',
        displayNameLA: 'ຜູ້ຈັດການຝັ່ງໄທ',
        description: 'จัดการ V-Work และ V-Care',
        companyAccess: ['V_WORK', 'V_CARE'],
        isSystem: false,
        permissionModules: ['workers:read,update', 'clients', 'deployment', 'visa', 'orders', 'homeClients', 'domesticWorkers', 'services', 'dashboard', 'reports'],
    },
    {
        name: 'TH_STAFF',
        displayName: 'พนักงานฝั่งไทย (V-Work)',
        displayNameLA: 'ພະນັກງານຝັ່ງໄທ (V-Work)',
        description: 'ทำงาน V-Work',
        companyAccess: ['V_WORK'],
        isSystem: false,
        permissionModules: ['workers:read', 'clients:create,read,update', 'deployment:create,read,update'],
    },
    {
        name: 'VCARE_STAFF',
        displayName: 'พนักงาน V-Care',
        displayNameLA: 'ພະນັກງານ V-Care',
        description: 'ทำงาน V-Care',
        companyAccess: ['V_CARE'],
        isSystem: false,
        permissionModules: ['workers:read', 'homeClients:create,read,update', 'domesticWorkers:read', 'services:read'],
    },
    {
        name: 'FINANCE',
        displayName: 'พนักงานการเงิน',
        displayNameLA: 'ພະນັກງານການເງິນ',
        description: 'จัดการเรื่องการเงิน',
        companyAccess: ['V_HOLDING'],
        isSystem: false,
        permissionModules: ['finance', 'reports', 'dashboard:read'],
    },
];

// =========================================
// SEED FUNCTION
// =========================================

async function seedPermissionsAndRoles() {
    console.log('🌱 Seeding Permissions...');

    // Create Permissions
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: {
                module_action: {
                    module: perm.module,
                    action: perm.action,
                },
            },
            update: {
                displayName: perm.displayName,
                displayNameLA: perm.displayNameLA,
                company: perm.company,
            },
            create: perm,
        });
    }
    console.log(`✅ Created ${permissions.length} permissions`);

    // Get all permissions for mapping
    const allPermissions = await prisma.permission.findMany();

    console.log('🌱 Seeding Roles...');

    for (const roleData of roles) {
        const { permissionModules, ...roleInfo } = roleData;

        // Create Role
        const role = await prisma.role.upsert({
            where: { name: roleData.name },
            update: {
                displayName: roleData.displayName,
                displayNameLA: roleData.displayNameLA,
                description: roleData.description,
                companyAccess: roleData.companyAccess,
                isSystem: roleData.isSystem,
            },
            create: {
                name: roleData.name,
                displayName: roleData.displayName,
                displayNameLA: roleData.displayNameLA,
                description: roleData.description,
                companyAccess: roleData.companyAccess,
                isSystem: roleData.isSystem,
            },
        });

        // Assign Permissions
        if (permissionModules.includes('*')) {
            // Super Admin - all permissions
            for (const perm of allPermissions) {
                await prisma.rolePermission.upsert({
                    where: {
                        roleId_permissionId: {
                            roleId: role.id,
                            permissionId: perm.id,
                        },
                    },
                    update: {},
                    create: {
                        roleId: role.id,
                        permissionId: perm.id,
                    },
                });
            }
        } else {
            // Other roles - specific permissions
            for (const moduleSpec of permissionModules) {
                const [moduleName, actions] = moduleSpec.includes(':')
                    ? moduleSpec.split(':')
                    : [moduleSpec, null];

                const actionList = actions ? actions.split(',') : null;

                const matchingPerms = allPermissions.filter(p => {
                    if (p.module !== moduleName) return false;
                    if (actionList && !actionList.includes(p.action)) return false;
                    return true;
                });

                for (const perm of matchingPerms) {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: perm.id,
                            },
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: perm.id,
                        },
                    });
                }
            }
        }

        console.log(`✅ Created role: ${roleData.name}`);
    }

    console.log('🌱 Seeding Admin User...');

    // Get Super Admin role
    const superAdminRole = await prisma.role.findUnique({
        where: { name: 'SUPER_ADMIN' },
    });

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
        where: { email: 'admin@v-group.la' },
        update: {
            roleId: superAdminRole.id,
        },
        create: {
            email: 'admin@v-group.la',
            password: hashedPassword,
            name: 'Admin V-GROUP',
            roleId: superAdminRole.id,
            language: 'th',
            isActive: true,
        },
    });

    console.log('✅ Created admin user: admin@v-group.la / admin123');

    // Create LAO Manager user
    const laoManagerRole = await prisma.role.findUnique({
        where: { name: 'LAO_MANAGER' },
    });

    await prisma.user.upsert({
        where: { email: 'lao.manager@v-group.la' },
        update: {
            roleId: laoManagerRole.id,
        },
        create: {
            email: 'lao.manager@v-group.la',
            password: hashedPassword,
            name: 'ผู้จัดการลาว',
            roleId: laoManagerRole.id,
            language: 'la',
            isActive: true,
        },
    });

    console.log('✅ Created user: lao.manager@v-group.la / admin123');

    // Create TH Manager user
    const thManagerRole = await prisma.role.findUnique({
        where: { name: 'TH_MANAGER' },
    });

    await prisma.user.upsert({
        where: { email: 'th.manager@v-group.la' },
        update: {
            roleId: thManagerRole.id,
        },
        create: {
            email: 'th.manager@v-group.la',
            password: hashedPassword,
            name: 'ผู้จัดการไทย',
            roleId: thManagerRole.id,
            language: 'th',
            isActive: true,
        },
    });

    console.log('✅ Created user: th.manager@v-group.la / admin123');

    console.log('\n🎉 Seeding completed!');
}

// =========================================
// MAIN
// =========================================

async function main() {
    try {
        await seedPermissionsAndRoles();
    } catch (error) {
        console.error('❌ Error seeding:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
