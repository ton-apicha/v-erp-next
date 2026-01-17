import { User, Worker, Client, Partner } from '@prisma/client'

// NextAuth types are declared in src/lib/auth.ts
// Do not redeclare here to avoid conflicts

// ==============================================
// User Role Type (now a relation, not enum)
// ==============================================
export interface UserRole {
    id: string
    name: string
    displayName: string
    displayNameLA: string | null
    companyAccess: string[]
}

// ==============================================
// Worker Types (matches Prisma enum)
// ==============================================
export type WorkerWithRelations = Worker & {
    createdBy: Pick<User, 'name'>
    partner: Pick<Partner, 'name'> | null
    client: Pick<Client, 'companyName'> | null
}

export type WorkerStatus =
    | 'PENDING'       // รอดำเนินการ
    | 'TRAINING'      // กำลังฝึกอบรม
    | 'READY'         // พร้อมส่งตัว
    | 'DEPLOYED'      // ส่งถึงโรงงานแล้ว
    | 'INACTIVE'      // ไม่ได้ใช้งาน
    | 'TERMINATED'    // เลิกจ้าง

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type SkillLevel = 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'PREMIUM'

// ==============================================
// Partner Types (replaces Agent)
// ==============================================
export type PartnerType = 'INDIVIDUAL' | 'COMPANY' | 'AGENCY'

export type PartnerWithStats = Partner & {
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
    nickname?: string
    gender: Gender
    birthDate: Date
    nationality?: string
    phoneNumber?: string
    address?: string
    emergencyName?: string
    emergencyPhone?: string
    emergencyRelation?: string
    passportNo?: string
    visaNo?: string
    workPermitNo?: string
}

export interface PartnerFormData {
    name: string
    contactPerson: string
    phoneNumber: string
    email?: string
    address?: string
    province?: string
    district?: string
    notes?: string
}

export interface ClientFormData {
    companyName: string
    contactPerson: string
    phoneNumber: string
    email?: string
    address?: string
    taxId?: string
    industry?: string
    employeeCount?: number
    creditLimit?: number
}
