// ===========================================
// Permission Utilities for V-ERP
// Version: 2.0.0
// ===========================================

import { prisma } from '@/lib/prisma'

// =========================================
// Types
// =========================================

export interface UserPermissions {
    userId: string
    role: {
        id: string
        name: string
        displayName: string
        displayNameLA: string | null
        companyAccess: string[]
    }
    permissions: string[] // format: "module:action"
}

export interface PermissionCheck {
    allowed: boolean
    reason?: string
}

// =========================================
// Permission Fetching
// =========================================

/**
 * Get all permissions for a user by their ID
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            role: {
                include: {
                    permissions: {
                        include: {
                            permission: true
                        }
                    }
                }
            }
        }
    })

    if (!user || !user.role) {
        return null
    }

    // Format permissions as "module:action"
    const permissions = user.role.permissions.map(
        rp => `${rp.permission.module}:${rp.permission.action}`
    )

    return {
        userId: user.id,
        role: {
            id: user.role.id,
            name: user.role.name,
            displayName: user.role.displayName,
            displayNameLA: user.role.displayNameLA,
            companyAccess: user.role.companyAccess,
        },
        permissions,
    }
}

/**
 * Get permissions from session (cached)
 */
export async function getSessionPermissions(session: any): Promise<UserPermissions | null> {
    if (!session?.user?.id) {
        return null
    }
    return getUserPermissions(session.user.id)
}

// =========================================
// Permission Checking
// =========================================

/**
 * Check if user has specific permission
 */
export function hasPermission(
    userPermissions: string[],
    module: string,
    action: string = 'read'
): boolean {
    // Super admin check
    if (userPermissions.includes('*') || userPermissions.includes('*:*')) {
        return true
    }

    // Module wildcard check
    if (userPermissions.includes(`${module}:*`)) {
        return true
    }

    // Exact permission check
    return userPermissions.includes(`${module}:${action}`)
}

/**
 * Check if user has access to a company
 */
export function hasCompanyAccess(
    companyAccess: string[],
    company: string
): boolean {
    return companyAccess.includes(company)
}

/**
 * Check permission and return detailed result
 */
export function checkPermission(
    userPermissions: string[],
    module: string,
    action: string = 'read'
): PermissionCheck {
    const allowed = hasPermission(userPermissions, module, action)

    return {
        allowed,
        reason: allowed
            ? undefined
            : `ไม่มีสิทธิ์ ${action} ใน ${module}`
    }
}

/**
 * Check company access and return detailed result
 */
export function checkCompanyAccess(
    companyAccess: string[],
    company: string
): PermissionCheck {
    const allowed = hasCompanyAccess(companyAccess, company)

    return {
        allowed,
        reason: allowed
            ? undefined
            : `ไม่มีสิทธิ์เข้าถึง ${company}`
    }
}

// =========================================
// Permission Constants
// =========================================

export const COMPANIES = {
    V_CONNECT: 'V_CONNECT',
    V_WORK: 'V_WORK',
    V_CARE: 'V_CARE',
    V_HOLDING: 'V_HOLDING',
} as const

export const MODULES = {
    // V-Connect
    WORKERS: 'workers',
    PARTNERS: 'partners',
    DOCUMENTS: 'documents',
    ACADEMY: 'academy',

    // V-Work
    CLIENTS: 'clients',
    DEPLOYMENT: 'deployment',
    VISA: 'visa',
    ORDERS: 'orders',

    // V-Care
    HOME_CLIENTS: 'homeClients',
    DOMESTIC_WORKERS: 'domesticWorkers',
    SERVICES: 'services',

    // V-Holding
    DASHBOARD: 'dashboard',
    FINANCE: 'finance',
    REPORTS: 'reports',
    USERS: 'users',
    ROLES: 'roles',
    AUDIT_LOGS: 'auditLogs',
    SETTINGS: 'settings',
    CONTRACT_TEMPLATES: 'contractTemplates',
} as const

export const ACTIONS = {
    CREATE: 'create',
    READ: 'read',
    UPDATE: 'update',
    DELETE: 'delete',
    MANAGE: 'manage',
    EXPORT: 'export',
} as const

// =========================================
// Helper for API Routes
// =========================================

/**
 * Require permission in API route
 * Throws error if permission denied
 */
export async function requirePermission(
    session: any,
    module: string,
    action: string = 'read'
): Promise<UserPermissions> {
    const userPerms = await getSessionPermissions(session)

    if (!userPerms) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
    }

    const check = checkPermission(userPerms.permissions, module, action)

    if (!check.allowed) {
        throw new Error(check.reason || 'ไม่มีสิทธิ์')
    }

    return userPerms
}

/**
 * Require company access in API route
 * Throws error if access denied
 */
export async function requireCompanyAccess(
    session: any,
    company: string
): Promise<UserPermissions> {
    const userPerms = await getSessionPermissions(session)

    if (!userPerms) {
        throw new Error('ไม่พบข้อมูลผู้ใช้')
    }

    const check = checkCompanyAccess(userPerms.role.companyAccess, company)

    if (!check.allowed) {
        throw new Error(check.reason || 'ไม่มีสิทธิ์เข้าถึง')
    }

    return userPerms
}
