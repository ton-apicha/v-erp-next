// =====================================================
// Users Management Page - Updated for Role Relation
// =====================================================

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Users,
    Plus,
    Shield,
    UserCog,
    User,
    Mail,
    Calendar,
    MoreVertical,
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function UsersPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const currentUser = session?.user as any

    // Only SUPER_ADMIN can view users
    if (!currentUser?.role?.name || currentUser.role.name !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const users = await prisma.user.findMany({
        orderBy: [
            { name: 'asc' },
        ],
        include: {
            role: true,
            _count: {
                select: {
                    createdWorkers: true,
                },
            },
        },
    })

    // Get role stats
    const roleStats = await prisma.role.findMany({
        include: {
            _count: {
                select: { users: true }
            }
        }
    })

    const stats = {
        total: users.length,
        roleBreakdown: roleStats.map(r => ({
            name: r.name,
            displayName: r.displayName,
            count: r._count.users
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        จัดการผู้ใช้งาน
                    </h1>
                    <p className="text-muted-foreground">
                        จัดการบัญชีผู้ใช้และสิทธิ์การเข้าถึง
                    </p>
                </div>
                <Link href="/dashboard/users/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มผู้ใช้
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ผู้ใช้ทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                {stats.roleBreakdown.slice(0, 3).map(role => (
                    <Card key={role.name}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                {role.displayName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{role.count}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Users Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => {
                    const initials = user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)

                    const isCurrentUser = user.id === currentUser.id
                    const isSuperAdmin = user.role.name === 'SUPER_ADMIN'

                    return (
                        <Card key={user.id} className={isCurrentUser ? 'ring-2 ring-primary' : ''}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className={`${isSuperAdmin ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold flex items-center gap-2">
                                                {user.name}
                                                {isCurrentUser && (
                                                    <Badge variant="outline" className="text-xs">คุณ</Badge>
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {!isCurrentUser && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/users/${user.id}/edit`}>
                                                        แก้ไข
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    ลบผู้ใช้
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={isSuperAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                                            <Shield className="h-3 w-3 mr-1" />
                                            {user.role.displayName}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: th })}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                                        <span>สร้างแรงงาน: {user._count.createdWorkers}</span>
                                        <span>บริษัท: {user.role.companyAccess.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Roles Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">บทบาทในระบบ</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roleStats.map(role => (
                            <div key={role.id} className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="h-4 w-4" />
                                    <span className="font-medium">{role.displayName}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{role.description || 'ไม่มีคำอธิบาย'}</p>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {role.companyAccess.map(company => (
                                        <Badge key={company} variant="secondary" className="text-xs">
                                            {company}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
