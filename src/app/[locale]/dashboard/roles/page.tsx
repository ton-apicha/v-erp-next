// =====================================================
// Roles Management Page
// Shows all roles with users count and permissions
// =====================================================

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Shield,
    Users,
    Plus,
    Settings,
    Lock,
    Building2,
} from 'lucide-react'

// Company badges
const companyBadges: Record<string, { label: string; color: string }> = {
    V_CONNECT: { label: 'V-Connect', color: 'bg-blue-100 text-blue-800' },
    V_WORK: { label: 'V-Work', color: 'bg-green-100 text-green-800' },
    V_CARE: { label: 'V-Care', color: 'bg-purple-100 text-purple-800' },
    V_HOLDING: { label: 'V-Holding', color: 'bg-gray-100 text-gray-800' },
}

export default async function RolesPage() {
    const session = await getServerSession(authOptions)

    // Check permission
    const userRole = (session?.user as any)?.role?.name
    if (!['SUPER_ADMIN'].includes(userRole)) {
        redirect('/dashboard')
    }

    const roles = await prisma.role.findMany({
        include: {
            permissions: {
                include: {
                    permission: true,
                },
            },
            _count: {
                select: { users: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    })

    // Get all permissions grouped by module
    const allPermissions = await prisma.permission.findMany({
        orderBy: [{ module: 'asc' }, { action: 'asc' }],
    })

    const modules = [...new Set(allPermissions.map(p => p.module))]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Shield className="h-8 w-8" />
                        จัดการบทบาท
                    </h1>
                    <p className="text-muted-foreground">กำหนดบทบาทและสิทธิ์การเข้าถึงของผู้ใช้</p>
                </div>
                <Link href="/dashboard/roles/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มบทบาท
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{roles.length}</p>
                        <p className="text-xs text-muted-foreground">บทบาททั้งหมด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">
                            {roles.reduce((sum, r) => sum + r._count.users, 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">ผู้ใช้ทั้งหมด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Lock className="h-6 w-6 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold">{allPermissions.length}</p>
                        <p className="text-xs text-muted-foreground">สิทธิ์ทั้งหมด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <Building2 className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                        <p className="text-2xl font-bold">{modules.length}</p>
                        <p className="text-xs text-muted-foreground">โมดูล</p>
                    </CardContent>
                </Card>
            </div>

            {/* Roles List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <Card key={role.id} className={role.isSystem ? 'border-primary' : ''}>
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {role.displayName}
                                        {role.isSystem && (
                                            <Badge variant="outline" className="text-xs">
                                                <Lock className="h-3 w-3 mr-1" />
                                                ระบบ
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription className="font-mono text-xs">
                                        {role.name}
                                    </CardDescription>
                                </div>
                                {!role.isSystem && (
                                    <Link href={`/dashboard/roles/${role.id}/edit`}>
                                        <Button variant="ghost" size="icon">
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* User count */}
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{role._count.users} ผู้ใช้</span>
                            </div>

                            {/* Company Access */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">เข้าถึงบริษัท:</p>
                                <div className="flex flex-wrap gap-1">
                                    {role.companyAccess.length === 0 ? (
                                        <span className="text-xs text-muted-foreground">ไม่มี</span>
                                    ) : (
                                        role.companyAccess.map((company) => (
                                            <Badge key={company} className={companyBadges[company]?.color || 'bg-gray-100'}>
                                                {companyBadges[company]?.label || company}
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Permissions count */}
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                    สิทธิ์: {role.permissions.length} รายการ
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {modules.slice(0, 4).map((mod) => {
                                        const count = role.permissions.filter(rp => rp.permission.module === mod).length
                                        if (count === 0) return null
                                        return (
                                            <Badge key={mod} variant="secondary" className="text-xs">
                                                {mod}: {count}
                                            </Badge>
                                        )
                                    }).filter(Boolean)}
                                    {role.permissions.length > 0 && (
                                        <Link href={`/dashboard/roles/${role.id}`}>
                                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                                                ดูทั้งหมด →
                                            </Badge>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Permissions Matrix Preview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        ตารางสิทธิ์ (Preview)
                    </CardTitle>
                    <CardDescription>
                        ภาพรวมสิทธิ์ของแต่ละบทบาท
                    </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3 font-medium">โมดูล</th>
                                {roles.map((role) => (
                                    <th key={role.id} className="text-center py-2 px-3 font-medium">
                                        {role.displayName}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {modules.map((mod) => (
                                <tr key={mod} className="border-b">
                                    <td className="py-2 px-3 font-medium capitalize">{mod}</td>
                                    {roles.map((role) => {
                                        const permCount = role.permissions.filter(rp => rp.permission.module === mod).length
                                        const totalMod = allPermissions.filter(p => p.module === mod).length
                                        const percent = totalMod > 0 ? Math.round((permCount / totalMod) * 100) : 0

                                        return (
                                            <td key={role.id} className="text-center py-2 px-3">
                                                {permCount === 0 ? (
                                                    <span className="text-muted-foreground">-</span>
                                                ) : permCount === totalMod ? (
                                                    <Badge className="bg-green-100 text-green-800">ทั้งหมด</Badge>
                                                ) : (
                                                    <Badge variant="secondary">{permCount}/{totalMod}</Badge>
                                                )}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
