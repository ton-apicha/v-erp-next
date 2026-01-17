// =====================================================
// Audit Logs Viewer Page
// Shows system audit logs with filtering
// =====================================================

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Activity,
    Search,
    User,
    Plus,
    Pencil,
    Trash2,
    LogIn,
    LogOut,
    Eye,
    FileDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

// Action config with icons and colors
const actionConfig: Record<string, { label: string; icon: any; color: string }> = {
    CREATE: { label: 'สร้าง', icon: Plus, color: 'bg-green-100 text-green-800' },
    UPDATE: { label: 'แก้ไข', icon: Pencil, color: 'bg-blue-100 text-blue-800' },
    DELETE: { label: 'ลบ', icon: Trash2, color: 'bg-red-100 text-red-800' },
    LOGIN: { label: 'เข้าสู่ระบบ', icon: LogIn, color: 'bg-purple-100 text-purple-800' },
    LOGOUT: { label: 'ออกจากระบบ', icon: LogOut, color: 'bg-gray-100 text-gray-800' },
    VIEW: { label: 'ดู', icon: Eye, color: 'bg-yellow-100 text-yellow-800' },
    EXPORT: { label: 'ส่งออก', icon: FileDown, color: 'bg-teal-100 text-teal-800' },
}

// Module labels
const moduleLabels: Record<string, string> = {
    partners: 'พาร์ทเนอร์',
    workers: 'แรงงาน',
    clients: 'นายจ้าง',
    users: 'ผู้ใช้',
    auth: 'ยืนยันตัวตน',
    finance: 'การเงิน',
    documents: 'เอกสาร',
}

export default async function AuditLogsPage(props: {
    searchParams: Promise<{
        module?: string
        action?: string
        search?: string
        page?: string
    }>
}) {
    const session = await getServerSession(authOptions)
    const searchParams = await props.searchParams

    // Check permission
    const userRole = (session?.user as any)?.role?.name
    if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
        redirect('/dashboard')
    }

    const page = parseInt(searchParams.page || '1')
    const pageSize = 20

    // Build where clause
    const where: any = {}

    if (searchParams.module) {
        where.module = searchParams.module
    }

    if (searchParams.action) {
        where.action = searchParams.action
    }

    if (searchParams.search) {
        where.OR = [
            { userName: { contains: searchParams.search, mode: 'insensitive' } },
            { userEmail: { contains: searchParams.search, mode: 'insensitive' } },
            { recordId: { contains: searchParams.search, mode: 'insensitive' } },
        ]
    }

    // Fetch audit logs
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

    const totalPages = Math.ceil(total / pageSize)

    // Get stats
    const stats = {
        total: await prisma.auditLog.count(),
        today: await prisma.auditLog.count({
            where: {
                createdAt: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0)),
                },
            },
        }),
        creates: await prisma.auditLog.count({ where: { action: 'CREATE' } }),
        updates: await prisma.auditLog.count({ where: { action: 'UPDATE' } }),
        deletes: await prisma.auditLog.count({ where: { action: 'DELETE' } }),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Activity className="h-8 w-8" />
                        Audit Logs
                    </h1>
                    <p className="text-muted-foreground">ประวัติการใช้งานระบบทั้งหมด</p>
                </div>
                <a
                    href={`/api/audit-logs/export?${new URLSearchParams({
                        ...(searchParams.module && { module: searchParams.module }),
                        ...(searchParams.action && { action: searchParams.action }),
                        ...(searchParams.search && { search: searchParams.search }),
                    }).toString()}`}
                    download
                >
                    <Button variant="outline">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export Excel
                    </Button>
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                        <p className="text-xs text-muted-foreground">ทั้งหมด</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
                        <p className="text-xs text-muted-foreground">วันนี้</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.creates}</p>
                        <p className="text-xs text-muted-foreground">สร้าง</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.updates}</p>
                        <p className="text-xs text-muted-foreground">แก้ไข</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.deletes}</p>
                        <p className="text-xs text-muted-foreground">ลบ</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <form method="GET" className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    name="search"
                                    placeholder="ค้นหาด้วยชื่อผู้ใช้, อีเมล, รหัส..."
                                    defaultValue={searchParams.search}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <select
                            name="module"
                            defaultValue={searchParams.module}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-40"
                        >
                            <option value="">ทุกโมดูล</option>
                            <option value="partners">พาร์ทเนอร์</option>
                            <option value="workers">แรงงาน</option>
                            <option value="clients">นายจ้าง</option>
                            <option value="users">ผู้ใช้</option>
                            <option value="auth">ยืนยันตัวตน</option>
                        </select>
                        <select
                            name="action"
                            defaultValue={searchParams.action}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-full md:w-36"
                        >
                            <option value="">ทุกการกระทำ</option>
                            <option value="CREATE">สร้าง</option>
                            <option value="UPDATE">แก้ไข</option>
                            <option value="DELETE">ลบ</option>
                            <option value="LOGIN">เข้าสู่ระบบ</option>
                            <option value="LOGOUT">ออกจากระบบ</option>
                        </select>
                        <Button type="submit">ค้นหา</Button>
                        {(searchParams.search || searchParams.module || searchParams.action) && (
                            <Link href="/dashboard/audit-logs">
                                <Button type="button" variant="outline">ล้าง</Button>
                            </Link>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle>รายการ ({total})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {logs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบรายการ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">เวลา</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">ผู้ใช้</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">การกระทำ</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">โมดูล</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">รหัส</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">รายละเอียด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => {
                                        const config = actionConfig[log.action] || { label: log.action, color: 'bg-gray-100' }
                                        const Icon = config.icon || Activity
                                        const fieldChanges = log.fieldChanges as any[] | null

                                        return (
                                            <tr key={log.id} className="border-b hover:bg-muted/30">
                                                <td className="py-3 px-4">
                                                    <p className="text-sm font-medium">
                                                        {format(new Date(log.createdAt), 'dd MMM yy', { locale: th })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(log.createdAt), 'HH:mm:ss')}
                                                    </p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="h-4 w-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">{log.userName}</p>
                                                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge className={config.color}>
                                                        <Icon className="h-3 w-3 mr-1" />
                                                        {config.label}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-sm">
                                                    {moduleLabels[log.module] || log.module}
                                                </td>
                                                <td className="py-3 px-4 text-sm font-mono">
                                                    {log.recordId || '-'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {fieldChanges && fieldChanges.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {fieldChanges.slice(0, 2).map((change: any, i: number) => (
                                                                <div key={i} className="text-xs">
                                                                    <span className="text-muted-foreground">
                                                                        {change.displayName || change.field}:
                                                                    </span>
                                                                    {' '}
                                                                    <span className="text-red-600 line-through">
                                                                        {String(change.oldValue || '-').slice(0, 20)}
                                                                    </span>
                                                                    {' → '}
                                                                    <span className="text-green-600">
                                                                        {String(change.newValue || '-').slice(0, 20)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                            {fieldChanges.length > 2 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    +{fieldChanges.length - 2} การเปลี่ยนแปลง
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    {page > 1 && (
                        <Link href={`?page=${page - 1}${searchParams.module ? `&module=${searchParams.module}` : ''}${searchParams.action ? `&action=${searchParams.action}` : ''}`}>
                            <Button variant="outline" size="sm">
                                <ChevronLeft className="h-4 w-4" />
                                ก่อนหน้า
                            </Button>
                        </Link>
                    )}
                    <span className="text-sm text-muted-foreground px-4">
                        หน้า {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link href={`?page=${page + 1}${searchParams.module ? `&module=${searchParams.module}` : ''}${searchParams.action ? `&action=${searchParams.action}` : ''}`}>
                            <Button variant="outline" size="sm">
                                ถัดไป
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    )
}
