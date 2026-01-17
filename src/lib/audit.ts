// ===========================================
// Audit Log Service for V-ERP
// Version: 2.0.0
// Full Field-Level Tracking
// ===========================================

import { prisma } from '@/lib/prisma'

// =========================================
// Types
// =========================================

export interface FieldChange {
    field: string
    displayName?: string
    oldValue: any
    newValue: any
}

export interface AuditLogParams {
    userId: string
    userEmail: string
    userName: string
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'VIEW' | 'EXPORT'
    module: string
    recordId?: string
    before?: Record<string, any>
    after?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

// =========================================
// Field Display Names (TH/LA)
// =========================================

const fieldDisplayNames: Record<string, { th: string; la: string }> = {
    // Worker
    'firstNameTH': { th: 'ชื่อ (ไทย)', la: 'ຊື່ (ໄທ)' },
    'lastNameTH': { th: 'นามสกุล (ไทย)', la: 'ນາມສະກຸນ (ໄທ)' },
    'firstNameLA': { th: 'ชื่อ (ลาว)', la: 'ຊື່ (ລາວ)' },
    'lastNameLA': { th: 'นามสกุล (ลาว)', la: 'ນາມສະກຸນ (ລາວ)' },
    'nickname': { th: 'ชื่อเล่น', la: 'ຊື່ຫຼິ້ນ' },
    'gender': { th: 'เพศ', la: 'ເພດ' },
    'dateOfBirth': { th: 'วันเกิด', la: 'ວັນເກີດ' },
    'phoneNumber': { th: 'เบอร์โทร', la: 'ເບີໂທ' },
    'status': { th: 'สถานะ', la: 'ສະຖານະ' },

    // Document Tags
    'hasIdCard': { th: 'มีบัตรประชาชน', la: 'ມີບັດປະຊາຊົນ' },
    'hasPassport': { th: 'มี Passport', la: 'ມີ Passport' },
    'hasVisa': { th: 'มี Visa', la: 'ມີ Visa' },
    'hasWorkPermit': { th: 'มีใบอนุญาตทำงาน', la: 'ມີໃບອະນຸຍາດເຮັດວຽກ' },
    'hasMedicalCert': { th: 'มีใบรับรองแพทย์', la: 'ມີໃບຮັບຮອງແພດ' },
    'hasAcademyTraining': { th: 'ผ่านการฝึกอบรม', la: 'ຜ່ານການຝຶກອົບຮົມ' },

    // Document Numbers
    'passportNo': { th: 'หมายเลข Passport', la: 'ໝາຍເລກ Passport' },
    'passportExpiry': { th: 'วันหมดอายุ Passport', la: 'ວັນໝົດອາຍຸ Passport' },
    'visaNo': { th: 'หมายเลข Visa', la: 'ໝາຍເລກ Visa' },
    'visaExpiry': { th: 'วันหมดอายุ Visa', la: 'ວັນໝົດອາຍຸ Visa' },
    'workPermitNo': { th: 'หมายเลขใบอนุญาต', la: 'ໝາຍເລກໃບອະນຸຍາດ' },
    'workPermitExpiry': { th: 'วันหมดอายุใบอนุญาต', la: 'ວັນໝົດອາຍຸໃບອະນຸຍາດ' },

    // Partner
    'name': { th: 'ชื่อ', la: 'ຊື່' },
    'address': { th: 'ที่อยู่', la: 'ທີ່ຢູ່' },
    'province': { th: 'จังหวัด/แขวง', la: 'ແຂວງ' },

    // Client
    'companyName': { th: 'ชื่อบริษัท', la: 'ຊື່ບໍລິສັດ' },
    'contactPerson': { th: 'ผู้ติดต่อ', la: 'ຜູ້ຕິດຕໍ່' },
    'email': { th: 'อีเมล', la: 'ອີເມວ' },
    'industry': { th: 'ประเภทอุตสาหกรรม', la: 'ປະເພດອຸດສາຫະກຳ' },

    // Common
    'notes': { th: 'หมายเหตุ', la: 'ໝາຍເຫດ' },
    'isActive': { th: 'เปิดใช้งาน', la: 'ເປີດໃຊ້ງານ' },
    'isArchived': { th: 'เก็บถาวร', la: 'ເກັບຖາວອນ' },
}

// =========================================
// Core Functions
// =========================================

/**
 * Calculate field-level changes between before and after objects
 */
export function calculateFieldChanges(
    before: Record<string, any>,
    after: Record<string, any>,
    locale: 'th' | 'la' = 'th'
): FieldChange[] {
    const changes: FieldChange[] = []

    // Get all keys from both objects
    const allKeys = new Set([
        ...Object.keys(before || {}),
        ...Object.keys(after || {})
    ])

    // Skip meta fields
    const skipFields = ['id', 'createdAt', 'updatedAt', 'createdById']

    for (const key of allKeys) {
        if (skipFields.includes(key)) continue

        const oldValue = before?.[key]
        const newValue = after?.[key]

        // Compare values (stringify for deep comparison)
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            const displayNames = fieldDisplayNames[key]
            changes.push({
                field: key,
                displayName: displayNames ? displayNames[locale] : key,
                oldValue: formatValue(oldValue),
                newValue: formatValue(newValue),
            })
        }
    }

    return changes
}

/**
 * Format value for display in audit log
 */
function formatValue(value: any): any {
    if (value === null || value === undefined) {
        return null
    }

    if (value instanceof Date) {
        return value.toISOString()
    }

    if (typeof value === 'object') {
        return JSON.stringify(value)
    }

    return value
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
    const {
        userId,
        userEmail,
        userName,
        action,
        module,
        recordId,
        before,
        after,
        ipAddress,
        userAgent,
    } = params

    // Calculate field changes for UPDATE action
    let fieldChanges: FieldChange[] | null = null
    if (action === 'UPDATE' && before && after) {
        fieldChanges = calculateFieldChanges(before, after)

        // Skip if no actual changes
        if (fieldChanges.length === 0) {
            return
        }
    }

    await prisma.auditLog.create({
        data: {
            userId,
            userEmail,
            userName,
            action,
            module,
            recordId: recordId || null,
            fieldChanges: fieldChanges ? JSON.parse(JSON.stringify(fieldChanges)) : undefined,
            fullBefore: before ? JSON.parse(JSON.stringify(before)) : undefined,
            fullAfter: after ? JSON.parse(JSON.stringify(after)) : undefined,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
        },
    })
}

// =========================================
// Convenience Functions
// =========================================

/**
 * Log a CREATE action
 */
export async function logCreate(
    user: { id: string; email: string; name: string },
    module: string,
    recordId: string,
    data: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'CREATE',
        module,
        recordId,
        after: data,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
    })
}

/**
 * Log an UPDATE action
 */
export async function logUpdate(
    user: { id: string; email: string; name: string },
    module: string,
    recordId: string,
    before: Record<string, any>,
    after: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'UPDATE',
        module,
        recordId,
        before,
        after,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
    })
}

/**
 * Log a DELETE action
 */
export async function logDelete(
    user: { id: string; email: string; name: string },
    module: string,
    recordId: string,
    data: Record<string, any>,
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'DELETE',
        module,
        recordId,
        before: data,
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
    })
}

/**
 * Log a LOGIN action
 */
export async function logLogin(
    user: { id: string; email: string; name: string },
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'LOGIN',
        module: 'auth',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
    })
}

/**
 * Log a LOGOUT action
 */
export async function logLogout(
    user: { id: string; email: string; name: string },
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    await createAuditLog({
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        action: 'LOGOUT',
        module: 'auth',
        ipAddress: request?.ip,
        userAgent: request?.userAgent,
    })
}

// =========================================
// Query Functions
// =========================================

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
    userId?: string
    module?: string
    action?: string
    recordId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    pageSize?: number
}) {
    const {
        userId,
        module,
        action,
        recordId,
        startDate,
        endDate,
        page = 1,
        pageSize = 20,
    } = filters

    const where: any = {}

    if (userId) where.userId = userId
    if (module) where.module = module
    if (action) where.action = action
    if (recordId) where.recordId = recordId

    if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.auditLog.count({ where }),
    ])

    return {
        logs,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    }
}
