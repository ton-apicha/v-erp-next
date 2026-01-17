// =====================================================
// Reports Dashboard
// Shows system overview, stats, and reports links
// =====================================================

import { prisma } from '@/lib/db'
import { format, subMonths, startOfMonth, endOfMonth, subDays } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
    Users,
    Building2,
    CreditCard,
    TrendingUp,
    TrendingDown,
    FileSpreadsheet,
    DollarSign,
    ArrowRight,
    Activity,
    UserPlus,
    AlertTriangle,
    Truck,
    Briefcase,
    Handshake,
    CheckCircle,
    BarChart3,
    PieChart,
    Calendar,
    History,
} from 'lucide-react'

// Status labels
const statusLabels: Record<string, { label: string; color: string }> = {
    NEW: { label: 'ใหม่', color: 'bg-blue-500' },
    DOCUMENTING: { label: 'ทำเอกสาร', color: 'bg-yellow-500' },
    TRAINING: { label: 'ฝึกอบรม', color: 'bg-purple-500' },
    READY: { label: 'พร้อมส่งตัว', color: 'bg-green-500' },
    DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-indigo-500' },
    WORKING: { label: 'กำลังทำงาน', color: 'bg-teal-500' },
    COMPLETED: { label: 'ครบสัญญา', color: 'bg-gray-500' },
    TERMINATED: { label: 'ยกเลิก', color: 'bg-red-500' },
    RETURNED: { label: 'กลับประเทศ', color: 'bg-orange-500' },
}

export default async function ReportsPage() {
    const now = new Date()
    const thisMonth = startOfMonth(now)
    const lastMonth = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))
    const last7Days = subDays(now, 7)

    // ==================== WORKERS STATS ====================
    const totalWorkers = await prisma.worker.count({
        where: { isArchived: false },
    })
    const activeWorkers = await prisma.worker.count({
        where: { isArchived: false, status: 'WORKING' },
    })
    const newWorkersThisMonth = await prisma.worker.count({
        where: {
            isArchived: false,
            createdAt: { gte: thisMonth },
        },
    })
    const newWorkersLastMonth = await prisma.worker.count({
        where: {
            isArchived: false,
            createdAt: { gte: lastMonth, lte: lastMonthEnd },
        },
    })

    // ==================== PARTNERS STATS ====================
    const totalPartners = await prisma.partner.count({
        where: { status: 'ACTIVE' },
    })

    // ==================== CLIENTS STATS ====================
    const totalClients = await prisma.client.count({
        where: { status: 'ACTIVE' },
    })
    const factoryClients = await prisma.client.count({
        where: { status: 'ACTIVE', type: 'FACTORY' },
    })
    const individualClients = await prisma.client.count({
        where: { status: 'ACTIVE', type: 'INDIVIDUAL' },
    })

    // ==================== DEPLOYMENTS STATS ====================
    const readyWorkers = await prisma.worker.count({
        where: { status: 'READY', isArchived: false },
    })
    const deployedWorkers = await prisma.worker.count({
        where: { status: 'DEPLOYED', isArchived: false },
    })
    const workingWorkers = await prisma.worker.count({
        where: { status: 'WORKING', isArchived: false },
    })

    // ==================== DOCUMENTS STATS ====================
    const workersWithPassport = await prisma.worker.count({
        where: { hasPassport: true, isArchived: false },
    })
    const workersWithVisa = await prisma.worker.count({
        where: { hasVisa: true, isArchived: false },
    })
    const workersWithWorkPermit = await prisma.worker.count({
        where: { hasWorkPermit: true, isArchived: false },
    })

    // ==================== RECENT ACTIVITY ====================
    const recentWorkers = await prisma.worker.count({
        where: { createdAt: { gte: last7Days } },
    })
    const recentAuditLogs = await prisma.auditLog.count({
        where: { createdAt: { gte: last7Days } },
    })

    // Growth calculation
    const workerGrowth = newWorkersLastMonth > 0
        ? ((newWorkersThisMonth - newWorkersLastMonth) / newWorkersLastMonth * 100).toFixed(1)
        : newWorkersThisMonth > 0 ? '100' : '0'

    // Status distribution
    const workersByStatus = await prisma.worker.groupBy({
        by: ['status'],
        _count: true,
        where: { isArchived: false },
        orderBy: { _count: { status: 'desc' } },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <BarChart3 className="h-8 w-8" />
                        รายงานและวิเคราะห์
                    </h1>
                    <p className="text-muted-foreground">
                        ภาพรวมระบบ ณ {format(now, 'dd MMMM yyyy HH:mm', { locale: th })}
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            แรงงานทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalWorkers}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            กำลังทำงาน {activeWorkers} คน
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            แรงงานใหม่เดือนนี้
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{newWorkersThisMonth}</div>
                        <div className="flex items-center gap-1 text-sm mt-1">
                            {Number(workerGrowth) >= 0 ? (
                                <>
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <span className="text-green-500">+{workerGrowth}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                    <span className="text-red-500">{workerGrowth}%</span>
                                </>
                            )}
                            <span className="text-muted-foreground ml-1">จากเดือนก่อน</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Handshake className="h-4 w-4" />
                            พาร์ทเนอร์ / ลูกค้า
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalPartners} / {totalClients}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            ที่ใช้งานอยู่
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            พร้อมส่งตัว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{readyWorkers}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            ส่งตัวแล้ว {deployedWorkers} คน
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Status & Documents */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Worker Status Distribution */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <PieChart className="h-5 w-5" />
                                    สถานะแรงงาน
                                </CardTitle>
                                <CardDescription>
                                    การกระจายตามสถานะ
                                </CardDescription>
                            </div>
                            <Link href="/dashboard/workers">
                                <Button variant="outline" size="sm">
                                    ดูทั้งหมด
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {workersByStatus.map((s) => {
                                const percentage = totalWorkers > 0 ? (s._count / totalWorkers * 100).toFixed(0) : 0
                                const config = statusLabels[s.status] || { label: s.status, color: 'bg-gray-500' }
                                return (
                                    <div key={s.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full ${config.color}`} />
                                            <span className="text-sm">{config.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${config.color}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-medium w-8 text-right">{s._count}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Document Stats */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5" />
                                    เอกสารสำคัญ
                                </CardTitle>
                                <CardDescription>
                                    แรงงานที่มีเอกสารครบ
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">มีหนังสือเดินทาง</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {workersWithPassport}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">
                                {totalWorkers > 0 ? ((workersWithPassport / totalWorkers) * 100).toFixed(0) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">มีวีซ่า</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {workersWithVisa}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">
                                {totalWorkers > 0 ? ((workersWithVisa / totalWorkers) * 100).toFixed(0) : 0}%
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <CheckCircle className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">มีใบอนุญาตทำงาน</p>
                                    <p className="text-xl font-bold text-purple-600">
                                        {workersWithWorkPermit}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">
                                {totalWorkers > 0 ? ((workersWithWorkPermit / totalWorkers) * 100).toFixed(0) : 0}%
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        กิจกรรม 7 วันล่าสุด
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold">{recentWorkers}</p>
                            <p className="text-xs text-muted-foreground">แรงงานใหม่</p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold">{recentAuditLogs}</p>
                            <p className="text-xs text-muted-foreground">กิจกรรมในระบบ</p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold">{readyWorkers}</p>
                            <p className="text-xs text-muted-foreground">รอส่งตัว</p>
                        </div>
                        <div className="text-center p-4 bg-muted/30 rounded-lg">
                            <p className="text-2xl font-bold">{workingWorkers}</p>
                            <p className="text-xs text-muted-foreground">กำลังทำงาน</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        รายงานด่วน
                    </CardTitle>
                    <CardDescription>
                        ดูรายงานแบบละเอียด
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link href="/dashboard/workers">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Users className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานแรงงาน</h3>
                                            <p className="text-sm text-muted-foreground">
                                                สถิติและการกระจายแรงงาน
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/partners">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <Handshake className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานพาร์ทเนอร์</h3>
                                            <p className="text-sm text-muted-foreground">
                                                ประสิทธิภาพและแรงงานต่อพาร์ทเนอร์
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/deployment">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                            <Truck className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานการจัดส่ง</h3>
                                            <p className="text-sm text-muted-foreground">
                                                สถานะการส่งตัวแรงงาน
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/clients">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานลูกค้า</h3>
                                            <p className="text-sm text-muted-foreground">
                                                โรงงาน {factoryClients} / บุคคล {individualClients}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/audit-logs">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                            <History className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">ประวัติการใช้งาน</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Audit Logs และกิจกรรม
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/contract-templates">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center">
                                            <FileSpreadsheet className="h-6 w-6 text-teal-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">แม่แบบสัญญา</h3>
                                            <p className="text-sm text-muted-foreground">
                                                จัดการ Template สัญญา
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
