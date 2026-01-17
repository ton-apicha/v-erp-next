import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import {
    Users,
    Building2,
    Handshake,
    BarChart3,
    CreditCard,
    GraduationCap,
    Home,
    FileText,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const t = await getTranslations('Dashboard')

    // Get comprehensive statistics
    const [
        workerCount,
        partnerCount,
        clientCount,
        workersByStatus,
        activeLoans,
        overdueLoans,
        recentWorkers,
        recentAuditLogs,
        loanStats,
    ] = await Promise.all([
        prisma.worker.count(),
        prisma.partner.count(),
        prisma.client.count(),
        prisma.worker.groupBy({
            by: ['status'],
            _count: true,
        }),
        prisma.loan.count({ where: { status: 'ACTIVE' } }),
        prisma.loan.count({ where: { status: 'OVERDUE' } }),
        prisma.worker.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, workerId: true, firstNameTH: true, lastNameTH: true, status: true, createdAt: true },
        }),
        prisma.auditLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.loan.aggregate({
            where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
            _sum: { balance: true },
        }),
    ])

    // Process worker status counts
    const statusCounts = {
        NEW: 0,
        TRAINING: 0,
        READY: 0,
        DEPLOYED: 0,
        WORKING: 0,
    }
    workersByStatus.forEach((s) => {
        if (s.status in statusCounts) {
            statusCounts[s.status as keyof typeof statusCounts] = s._count
        }
    })

    const totalOutstanding = Number(loanStats._sum.balance) || 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                    {format(new Date(), 'EEEE d MMMM yyyy', { locale: th })}
                </div>
            </div>

            {/* Welcome Card */}
            <div className="rounded-xl bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-6 shadow-lg">
                <h2 className="text-2xl font-bold mb-1">
                    {t('welcome', { name: session?.user?.name || 'User' })}
                </h2>
                <p className="text-primary-foreground/80 text-sm">
                    {t('welcomeMessage')}
                </p>
            </div>

            {/* Main Statistics */}
            <div className="grid md:grid-cols-4 gap-4">
                <StatCard
                    title="แรงงานทั้งหมด"
                    value={workerCount}
                    icon={<Users className="w-6 h-6" />}
                    color="bg-blue-500"
                    href="/dashboard/workers"
                />
                <StatCard
                    title="พาร์ทเนอร์"
                    value={partnerCount}
                    icon={<Handshake className="w-6 h-6" />}
                    color="bg-green-500"
                    href="/dashboard/partners"
                />
                <StatCard
                    title="ลูกค้า"
                    value={clientCount}
                    icon={<Building2 className="w-6 h-6" />}
                    color="bg-purple-500"
                    href="/dashboard/clients"
                />
                <StatCard
                    title="สินเชื่อค้างชำระ"
                    value={`฿${totalOutstanding.toLocaleString()}`}
                    icon={<CreditCard className="w-6 h-6" />}
                    color="bg-amber-500"
                    href="/dashboard/finance/loans"
                    isAmount
                />
            </div>

            {/* Worker Status & Loans Alert */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Worker Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            สถานะแรงงาน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <StatusBadge label="ใหม่" count={statusCounts.NEW} color="bg-gray-100 text-gray-700" />
                            <StatusBadge label="ฝึกอบรม" count={statusCounts.TRAINING} color="bg-blue-100 text-blue-700" />
                            <StatusBadge label="พร้อมส่งตัว" count={statusCounts.READY} color="bg-green-100 text-green-700" />
                            <StatusBadge label="ส่งตัวแล้ว" count={statusCounts.DEPLOYED} color="bg-purple-100 text-purple-700" />
                            <StatusBadge label="กำลังทำงาน" count={statusCounts.WORKING} color="bg-cyan-100 text-cyan-700" />
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            สินเชื่อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span>สินเชื่อกำลังผ่อน</span>
                            </div>
                            <Badge variant="default" className="bg-blue-500">{activeLoans}</Badge>
                        </div>
                        {overdueLoans > 0 && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    <span>ค้างชำระ</span>
                                </div>
                                <Badge variant="destructive">{overdueLoans}</Badge>
                            </div>
                        )}
                        <Link href="/dashboard/finance/loans">
                            <Button variant="outline" className="w-full">
                                ดูทั้งหมด <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Workers & Audit Logs */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Workers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">แรงงานล่าสุด</CardTitle>
                            <CardDescription>เพิ่มเข้าระบบใหม่</CardDescription>
                        </div>
                        <Link href="/dashboard/workers">
                            <Button variant="ghost" size="sm">ดูทั้งหมด</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentWorkers.map((worker) => (
                                <Link
                                    key={worker.id}
                                    href={`/dashboard/workers/${worker.id}`}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">{worker.firstNameTH} {worker.lastNameTH}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{worker.workerId}</p>
                                    </div>
                                    <Badge variant="outline">{worker.status}</Badge>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle>
                            <CardDescription>การใช้งานระบบ</CardDescription>
                        </div>
                        <Link href="/dashboard/audit-logs">
                            <Button variant="ghost" size="sm">ดูทั้งหมด</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentAuditLogs.map((log) => (
                                <div key={log.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                                            'bg-red-100 text-red-600'
                                        }`}>
                                        {log.action === 'CREATE' ? <CheckCircle className="h-4 w-4" /> :
                                            log.action === 'UPDATE' ? <FileText className="h-4 w-4" /> :
                                                <AlertTriangle className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {log.userName} {log.action === 'CREATE' ? 'สร้าง' : log.action === 'UPDATE' ? 'แก้ไข' : 'ลบ'} {log.module}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(log.createdAt), 'HH:mm dd/MM', { locale: th })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('quickActions.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAction href="/dashboard/workers/new" icon={<Users className="w-5 h-5" />} title={t('quickActions.addWorker')} />
                        <QuickAction href="/dashboard/partners/new" icon={<Handshake className="w-5 h-5" />} title={t('quickActions.addPartner')} />
                        <QuickAction href="/dashboard/finance/loans/new" icon={<CreditCard className="w-5 h-5" />} title="สร้างสินเชื่อ" />
                        <QuickAction href="/dashboard/reports" icon={<BarChart3 className="w-5 h-5" />} title={t('quickActions.viewReports')} />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function StatCard({ title, value, icon, color, href, isAmount = false }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    href: string
    isAmount?: boolean
}) {
    return (
        <Link href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">{title}</p>
                        <p className={`text-2xl font-bold ${isAmount ? 'text-amber-600' : ''}`}>{value}</p>
                    </div>
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white shadow`}>
                        {icon}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className={`${color} rounded-lg p-3 text-center`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs">{label}</p>
        </div>
    )
}

function QuickAction({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
            <span className="text-muted-foreground group-hover:text-primary">{icon}</span>
            <span className="font-medium group-hover:text-primary">{title}</span>
        </Link>
    )
}
