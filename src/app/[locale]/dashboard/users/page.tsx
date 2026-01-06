import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

    const currentUser = session.user as any

    // Only SUPER_ADMIN and MANAGER can view users
    if (!['SUPER_ADMIN', 'MANAGER'].includes(currentUser.role)) {
        redirect('/dashboard')
    }

    const users = await prisma.user.findMany({
        orderBy: [
            { role: 'asc' },
            { name: 'asc' },
        ],
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    createdWorkers: true,
                    auditLogs: true,
                },
            },
        },
    })

    const stats = {
        total: users.length,
        superAdmin: users.filter(u => u.role === 'SUPER_ADMIN').length,
        manager: users.filter(u => u.role === 'MANAGER').length,
        staff: users.filter(u => u.role === 'STAFF').length,
    }

    const roleColors: Record<string, string> = {
        SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-300',
        MANAGER: 'bg-blue-100 text-blue-800 border-blue-300',
        STAFF: 'bg-green-100 text-green-800 border-green-300',
    }

    const roleLabels: Record<string, string> = {
        SUPER_ADMIN: 'ผู้ดูแลระบบ',
        MANAGER: 'ผู้จัดการ',
        STAFF: 'พนักงาน',
    }

    const roleIcons: Record<string, React.ReactNode> = {
        SUPER_ADMIN: <Shield className="h-4 w-4" />,
        MANAGER: <UserCog className="h-4 w-4" />,
        STAFF: <User className="h-4 w-4" />,
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
                {currentUser.role === 'SUPER_ADMIN' && (
                    <Link href="/dashboard/users/new">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            เพิ่มผู้ใช้
                        </Button>
                    </Link>
                )}
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Shield className="h-4 w-4 text-red-500" />
                            Super Admin
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.superAdmin}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <UserCog className="h-4 w-4 text-blue-500" />
                            Manager
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.manager}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <User className="h-4 w-4 text-green-500" />
                            Staff
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.staff}</div>
                    </CardContent>
                </Card>
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
                    const canEdit = currentUser.role === 'SUPER_ADMIN' ||
                        (currentUser.role === 'MANAGER' && user.role !== 'SUPER_ADMIN')

                    return (
                        <Card key={user.id} className={isCurrentUser ? 'ring-2 ring-primary' : ''}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className={`${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' :
                                                    user.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                }`}>
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

                                    {canEdit && !isCurrentUser && (
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
                                                {currentUser.role === 'SUPER_ADMIN' && (
                                                    <DropdownMenuItem className="text-red-600">
                                                        ลบผู้ใช้
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={roleColors[user.role]}>
                                            {roleIcons[user.role]}
                                            <span className="ml-1">{roleLabels[user.role]}</span>
                                        </Badge>
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: th })}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                                        <span>สร้างแรงงาน: {user._count.createdWorkers}</span>
                                        <span>กิจกรรม: {user._count.auditLogs}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Info */}
            <Card>
                <CardContent className="py-4">
                    <div className="text-sm text-muted-foreground">
                        <p><strong>สิทธิ์การใช้งาน:</strong></p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li><Badge className={roleColors.SUPER_ADMIN}>Super Admin</Badge> - เข้าถึงได้ทุกอย่าง, ลบข้อมูล, จัดการผู้ใช้ทั้งหมด</li>
                            <li><Badge className={roleColors.MANAGER}>Manager</Badge> - เข้าถึงได้ทุกอย่าง, ไม่สามารถลบข้อมูล, จัดการ Staff</li>
                            <li><Badge className={roleColors.STAFF}>Staff</Badge> - ทำงานปกติ, ดูข้อมูล, เพิ่ม/แก้ไขข้อมูล</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
