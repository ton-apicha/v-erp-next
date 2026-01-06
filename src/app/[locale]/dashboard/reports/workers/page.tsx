import { prisma } from '@/lib/db'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    Users,
    UserPlus,
    UserCheck,
    UserX,
    TrendingUp,
    MapPin,
    Briefcase,
} from 'lucide-react'

export default async function WorkersReportPage() {
    const now = new Date()

    // Get last 6 months for trend
    const monthsInterval = eachMonthOfInterval({
        start: subMonths(now, 5),
        end: now,
    })

    // Monthly new workers data
    const monthlyWorkers = await Promise.all(
        monthsInterval.map(async (month) => {
            const start = startOfMonth(month)
            const end = endOfMonth(month)

            const newWorkers = await prisma.worker.count({
                where: {
                    isArchived: false,
                    createdAt: { gte: start, lte: end }
                },
            })

            return {
                month: format(month, 'MMM', { locale: th }),
                fullMonth: format(month, 'MMMM yyyy', { locale: th }),
                count: newWorkers,
            }
        })
    )

    // Worker stats by status
    const workersByStatus = await prisma.worker.groupBy({
        by: ['status'],
        _count: true,
        where: { isArchived: false },
    })

    const totalWorkers = workersByStatus.reduce((sum, s) => sum + s._count, 0)

    // Workers by nationality
    const workersByNationality = await prisma.worker.groupBy({
        by: ['nationality'],
        _count: true,
        where: { isArchived: false },
    })

    // Workers by gender
    const workersByGender = await prisma.worker.groupBy({
        by: ['gender'],
        _count: true,
        where: { isArchived: false },
    })

    // Top agents by worker count
    const topAgents = await prisma.agent.findMany({
        where: { status: 'ACTIVE' },
        include: {
            _count: {
                select: { workers: true }
            }
        },
        orderBy: {
            workers: { _count: 'desc' }
        },
        take: 5,
    })

    // Top clients by worker count
    const topClients = await prisma.client.findMany({
        where: { status: 'ACTIVE' },
        include: {
            _count: {
                select: { workers: true }
            }
        },
        orderBy: {
            workers: { _count: 'desc' }
        },
        take: 5,
    })

    const statusLabels: Record<string, { label: string; color: string }> = {
        NEW_LEAD: { label: 'รายชื่อใหม่', color: 'bg-gray-500' },
        SCREENING: { label: 'รอตรวจสอบ', color: 'bg-yellow-500' },
        PROCESSING: { label: 'กำลังดำเนินการ', color: 'bg-blue-500' },
        ACADEMY: { label: 'ฝึกอบรม', color: 'bg-indigo-500' },
        READY: { label: 'พร้อมส่งตัว', color: 'bg-green-500' },
        DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-teal-500' },
        WORKING: { label: 'กำลังทำงาน', color: 'bg-purple-500' },
        CONTRACT_END: { label: 'สิ้นสุดสัญญา', color: 'bg-orange-500' },
        TERMINATED: { label: 'ยกเลิก', color: 'bg-red-500' },
    }

    const genderLabels: Record<string, string> = {
        MALE: 'ชาย',
        FEMALE: 'หญิง',
        OTHER: 'อื่นๆ',
    }

    const maxMonthlyWorkers = Math.max(...monthlyWorkers.map(m => m.count))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/reports">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">รายงานแรงงาน</h1>
                    <p className="text-muted-foreground">
                        สถิติและการกระจายข้อมูลแรงงาน
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            กำลังทำงาน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {workersByStatus.find(s => s.status === 'WORKING')?._count || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            รอดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {workersByStatus
                                .filter(s => ['NEW_LEAD', 'SCREENING', 'PROCESSING', 'ACADEMY', 'READY'].includes(s.status))
                                .reduce((sum, s) => sum + s._count, 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <UserX className="h-4 w-4" />
                            สิ้นสุด/ยกเลิก
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-muted-foreground">
                            {workersByStatus
                                .filter(s => ['CONTRACT_END', 'TERMINATED'].includes(s.status))
                                .reduce((sum, s) => sum + s._count, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        แรงงานใหม่รายเดือน
                    </CardTitle>
                    <CardDescription>
                        6 เดือนล่าสุด
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between gap-4 h-48">
                        {monthlyWorkers.map((month, idx) => {
                            const height = maxMonthlyWorkers > 0
                                ? (month.count / maxMonthlyWorkers * 100)
                                : 0
                            const isCurrentMonth = idx === monthlyWorkers.length - 1

                            return (
                                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="text-lg font-bold">{month.count}</div>
                                    <div className="w-full bg-muted rounded-t-lg flex items-end" style={{ height: '140px' }}>
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'bg-blue-500' : 'bg-blue-400'
                                                }`}
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{month.month}</div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">การกระจายตามสถานะ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {workersByStatus
                            .sort((a, b) => b._count - a._count)
                            .map((s) => {
                                const percentage = totalWorkers > 0 ? (s._count / totalWorkers * 100) : 0
                                const config = statusLabels[s.status] || { label: s.status, color: 'bg-gray-500' }
                                return (
                                    <div key={s.status} className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${config.color}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm">{config.label}</span>
                                                <span className="text-sm font-medium">{s._count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={`h-full ${config.color}`} style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </CardContent>
                </Card>

                {/* Demographics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">ข้อมูลประชากร</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Nationality */}
                        <div>
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                สัญชาติ
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {workersByNationality
                                    .sort((a, b) => b._count - a._count)
                                    .map((n) => (
                                        <Badge key={n.nationality} variant="secondary" className="text-sm">
                                            {n.nationality}: {n._count}
                                        </Badge>
                                    ))}
                            </div>
                        </div>

                        {/* Gender */}
                        <div>
                            <h4 className="text-sm font-medium mb-3">เพศ</h4>
                            <div className="grid grid-cols-3 gap-4">
                                {workersByGender.map((g) => {
                                    const percentage = totalWorkers > 0 ? (g._count / totalWorkers * 100) : 0
                                    return (
                                        <div key={g.gender} className="text-center p-4 bg-muted rounded-lg">
                                            <p className="text-2xl font-bold">{g._count}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {genderLabels[g.gender] || g.gender}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {percentage.toFixed(1)}%
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Agents */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    ตัวแทนที่มีแรงงานมากที่สุด
                                </CardTitle>
                                <CardDescription>5 อันดับแรก</CardDescription>
                            </div>
                            <Link href="/dashboard/agents">
                                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {topAgents.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                ไม่มีข้อมูล
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topAgents.map((agent, idx) => (
                                    <Link
                                        key={agent.id}
                                        href={`/dashboard/agents/${agent.id}`}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{agent.companyName}</p>
                                                <p className="text-xs text-muted-foreground">{agent.agentId}</p>
                                            </div>
                                        </div>
                                        <Badge>{agent._count.workers} คน</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top Clients */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    นายจ้างที่มีแรงงานมากที่สุด
                                </CardTitle>
                                <CardDescription>5 อันดับแรก</CardDescription>
                            </div>
                            <Link href="/dashboard/clients">
                                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {topClients.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                ไม่มีข้อมูล
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {topClients.map((client, idx) => (
                                    <Link
                                        key={client.id}
                                        href={`/dashboard/clients/${client.id}`}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-sm text-blue-600">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{client.companyName}</p>
                                                <p className="text-xs text-muted-foreground">{client.clientId}</p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">{client._count.workers} คน</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
