import bcrypt from 'bcryptjs'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

// =========================================
// Extended Types for Session
// =========================================

interface UserRole {
    id: string
    name: string
    displayName: string
    displayNameLA: string | null
    companyAccess: string[]
}

interface ExtendedUser {
    id: string
    email: string
    name: string
    role: UserRole | null
    permissions: string[]
}

// =========================================
// NextAuth Configuration
// =========================================

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('กรุณากรอกอีเมลและรหัสผ่าน')
                }

                // Fetch user with role and permissions
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
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

                if (!user) {
                    throw new Error('ไม่พบผู้ใช้งานนี้')
                }

                if (!user.isActive) {
                    throw new Error('บัญชีนี้ถูกระงับการใช้งาน')
                }

                const isValid = await verifyPassword(credentials.password, user.password)

                if (!isValid) {
                    throw new Error('รหัสผ่านไม่ถูกต้อง')
                }

                // Update last login
                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() }
                })

                // Format permissions as "module:action"
                const permissions = user.role?.permissions.map(
                    rp => `${rp.permission.module}:${rp.permission.action}`
                ) || []

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role ? {
                        id: user.role.id,
                        name: user.role.name,
                        displayName: user.role.displayName,
                        displayNameLA: user.role.displayNameLA,
                        companyAccess: user.role.companyAccess,
                    } : null,
                    permissions,
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.permissions = (user as any).permissions
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).permissions = token.permissions;
            }
            return session
        },
    },
}

// =========================================
// TypeScript Declarations
// =========================================

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name: string
            role: UserRole | null
            permissions: string[]
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: UserRole | null
        permissions: string[]
    }
}
