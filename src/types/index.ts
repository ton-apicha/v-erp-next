import { User, Worker, Agent, Client } from '@prisma/client'

// ==============================================
// NextAuth Session Types
// ==============================================
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: UserRole
        }
    }

    interface User {
        id: string
        email: string
        name: string
        role: UserRole
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: UserRole
    }
}

// ==============================================
// User Role Type (matches Prisma enum)
// ==============================================
export type UserRole =
    | 'SUPER_ADMIN'
    | 'MANAGER'
    | 'OPERATION'
    | 'FINANCE'
    | 'STAFF'
    | 'VIEWER'

// ==============================================
// Worker Types (matches Prisma enum)
// ==============================================
export type WorkerWithRelations = Worker & {
    createdBy: Pick<User, 'name'>
    agent: Pick<Agent, 'companyName'> | null
    client: Pick<Client, 'companyName'> | null
}

export type WorkerStatus =
    | 'NEW_LEAD'      // รายชื่อดิบ
    | 'SCREENING'     // รอตรวจโรค/ประวัติ
    | 'PROCESSING'    // กำลังยื่นเอกสาร
    | 'ACADEMY'       // เข้าค่ายฝึก
    | 'READY'         // พร้อมส่งตัว
    | 'DEPLOYED'      // ส่งถึงโรงงานแล้ว
    | 'WORKING'       // กำลังทำงาน
    | 'COMPLETED'     // สิ้นสุดสัญญา
    | 'TERMINATED'    // เลิกจ้าง
    | 'REJECTED'      // ปฏิเสธ

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'PREMIUM'

// ==============================================
// Agent Types
// ==============================================
export type AgentStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'

export type AgentWithStats = Agent & {
    createdBy: Pick<User, 'name'>
    _count: {
        workers: number
    }
}

// ==============================================
// Client Types
// ==============================================
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'

export type ClientWithStats = Client & {
    createdBy: Pick<User, 'name'>
    _count: {
        workers: number
    }
}

// ==============================================
// API Response Types
// ==============================================
export interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// ==============================================
// Form Data Types
// ==============================================
export interface WorkerFormData {
    firstNameTH: string
    lastNameTH: string
    firstNameEN?: string
    lastNameEN?: string
    firstNameLA?: string
    lastNameLA?: string
    nickname?: string
    gender: Gender
    dateOfBirth: Date
    nationality?: string
    religion?: string
    phoneNumber?: string
    email?: string
    lineId?: string
    address?: string
    emergencyName?: string
    emergencyPhone?: string
    emergencyRelation?: string
    passportNo?: string
    visaNo?: string
    workPermitNo?: string
}

export interface AgentFormData {
    companyName: string
    contactPerson: string
    phoneNumber: string
    email?: string
    address?: string
    province?: string
    district?: string
    taxId?: string
    commissionRate?: number
    tier?: number
}

export interface ClientFormData {
    companyName: string
    companyNameEN?: string
    contactPerson: string
    phoneNumber: string
    email?: string
    address?: string
    taxId?: string
    industry?: string
    employeeCount?: number
    creditLimit?: number
    mouQuotaTotal?: number
}
