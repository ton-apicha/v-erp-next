import { prisma } from '@/lib/db'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
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
} from 'lucide-react'

export default async function ReportsPage() {
    const now = new Date()
    const thisMonth = startOfMonth(now)
    const lastMonth = startOfMonth(subMonths(now, 1))
    const lastMonthEnd = endOfMonth(subMonths(now, 1))

    // Workers Stats
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

    // Agents Stats
    const totalAgents = await prisma.agent.count({
        where: { status: 'ACTIVE' },
    })

    // Clients Stats
    const totalClients = await prisma.client.count({
        where: { status: 'ACTIVE' },
    })

    // Loans Stats
    const activeLoans = await prisma.loan.findMany({
        where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
    })
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + Number(l.balance || 0), 0)
    const overdueLoans = activeLoans.filter((l) => l.status === 'OVERDUE').length

    // Payments this month
    const paymentsThisMonth = await prisma.payment.findMany({
        where: { paidAt: { gte: thisMonth } },
    })
    const totalPaymentsThisMonth = paymentsThisMonth.reduce((sum, p) => sum + Number(p.amount || 0), 0)

    // Commissions Stats
    const pendingCommissions = await prisma.commission.findMany({
        where: { status: 'PENDING' },
    })
    const totalPendingCommission = pendingCommissions.reduce((sum, c) => sum + Number(c.amount || 0), 0)

    const workerGrowth = newWorkersLastMonth > 0
        ? ((newWorkersThisMonth - newWorkersLastMonth) / newWorkersLastMonth * 100).toFixed(1)
        : '0'

    // Status distribution
    const workersByStatus = await prisma.worker.groupBy({
        by: ['status'],
        _count: true,
        where: { isArchived: false },
    })

    const statusLabels: Record<string, string> = {
        NEW_LEAD: 'รายชื่อใหม่',
        SCREENING: 'รอตรวจสอบ',
        PROCESSING: 'กำลังดำเนินการ',
        ACADEMY: 'ฝึกอบรม',
        READY: 'พร้อมส่งตัว',
        DEPLOYED: 'ส่งตัวแล้ว',
        WORKING: 'กำลังทำงาน',
        CONTRACT_END: 'สิ้นสุดสัญญา',
        TERMINATED: 'ยกเลิก',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">รายงานและวิเคราะห์</h1>
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
                            <Building2 className="h-4 w-4" />
                            ตัวแทน / นายจ้าง
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalAgents} / {totalClients}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            ที่ใช้งานอยู่
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            ยอดค้างชำระรวม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">฿{totalOutstanding.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                            จาก {activeLoans.length} รายการ
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Financial Summary */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    สรุปการเงินเดือนนี้
                                </CardTitle>
                                <CardDescription>
                                    {format(thisMonth, 'MMMM yyyy', { locale: th })}
                                </CardDescription>
                            </div>
                            <Link href="/dashboard/reports/financial">
                                <Button variant="outline" size="sm">
                                    ดูรายละเอียด
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">รับชำระเงินแล้ว</p>
                                    <p className="text-xl font-bold text-green-600">
                                        ฿{totalPaymentsThisMonth.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">{paymentsThisMonth.length} รายการ</Badge>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ค่าคอมมิชชั่นรอจ่าย</p>
                                    <p className="text-xl font-bold text-orange-600">
                                        ฿{totalPendingCommission.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">{pendingCommissions.length} รายการ</Badge>
                        </div>

                        {overdueLoans > 0 && (
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">สินเชื่อค้างชำระ</p>
                                        <p className="text-xl font-bold text-red-600">{overdueLoans} รายการ</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/finance/loans?status=OVERDUE">
                                    <Button variant="destructive" size="sm">ดู</Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    สถานะแรงงาน
                                </CardTitle>
                                <CardDescription>
                                    การกระจายตามสถานะ
                                </CardDescription>
                            </div>
                            <Link href="/dashboard/reports/workers">
                                <Button variant="outline" size="sm">
                                    ดูรายละเอียด
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {workersByStatus.map((s) => {
                                const percentage = totalWorkers > 0 ? (s._count / totalWorkers * 100).toFixed(0) : 0
                                return (
                                    <div key={s.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full bg-primary" />
                                            <span className="text-sm">{statusLabels[s.status] || s.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
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
            </div>

            {/* Quick Links */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5" />
                        รายงาน
                    </CardTitle>
                    <CardDescription>
                        เลือกรายงานที่ต้องการดู
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Link href="/dashboard/reports/financial">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานการเงิน</h3>
                                            <p className="text-sm text-muted-foreground">
                                                สรุปรายรับ-รายจ่าย สินเชื่อ
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/reports/workers">
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

                        <Link href="/dashboard/reports/agents">
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">รายงานตัวแทน</h3>
                                            <p className="text-sm text-muted-foreground">
                                                ประสิทธิภาพและค่าคอมมิชชั่น
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
