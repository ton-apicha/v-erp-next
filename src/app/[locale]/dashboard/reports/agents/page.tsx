import { prisma } from '@/lib/db'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    ArrowLeft,
    Building2,
    Users,
    DollarSign,
    TrendingUp,
    Award,
    Target,
} from 'lucide-react'

export default async function AgentsReportPage() {
    const now = new Date()

    // All active agents with stats
    const agents = await prisma.agent.findMany({
        where: { status: 'ACTIVE' },
        include: {
            workers: {
                where: { isArchived: false },
                select: { id: true, status: true },
            },
            commissions: {
                select: { amount: true, status: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Calculate agent performance metrics
    const agentMetrics = agents.map((agent) => {
        const totalWorkers = agent.workers.length
        const activeWorkers = agent.workers.filter((w) => w.status === 'WORKING').length
        const totalCommission = agent.commissions.reduce((sum, c) => sum + Number(c.amount || 0), 0)
        const paidCommission = agent.commissions
            .filter((c) => c.status === 'PAID')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0)
        const pendingCommission = agent.commissions
            .filter((c) => c.status === 'PENDING' || c.status === 'APPROVED')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0)

        return {
            id: agent.id,
            agentId: agent.agentId,
            companyName: agent.companyName,
            contactPerson: agent.contactPerson,
            commissionRate: Number(agent.commissionRate),
            tier: agent.tier,
            totalWorkers,
            activeWorkers,
            totalCommission,
            paidCommission,
            pendingCommission,
            successRate: totalWorkers > 0 ? (activeWorkers / totalWorkers * 100) : 0,
        }
    })

    // Sort by different criteria
    const topByWorkers = [...agentMetrics].sort((a, b) => b.totalWorkers - a.totalWorkers).slice(0, 5)
    const topByCommission = [...agentMetrics].sort((a, b) => b.totalCommission - a.totalCommission).slice(0, 5)
    const topBySuccessRate = [...agentMetrics]
        .filter((a) => a.totalWorkers >= 5) // Only consider agents with at least 5 workers
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 5)

    // Summary stats
    const totalAgents = agents.length
    const totalWorkersFromAgents = agentMetrics.reduce((sum, a) => sum + a.totalWorkers, 0)
    const totalCommissionPaid = agentMetrics.reduce((sum, a) => sum + a.paidCommission, 0)
    const totalCommissionPending = agentMetrics.reduce((sum, a) => sum + a.pendingCommission, 0)
    const avgWorkersPerAgent = totalAgents > 0 ? (totalWorkersFromAgents / totalAgents).toFixed(1) : 0

    // Commission by tier
    const commissionByTier = await prisma.agent.groupBy({
        by: ['tier'],
        where: { status: 'ACTIVE' },
        _count: true,
    })

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
                    <h1 className="text-2xl font-bold">รายงานตัวแทน</h1>
                    <p className="text-muted-foreground">
                        ประสิทธิภาพและสถิติตัวแทนจัดหาแรงงาน
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            ตัวแทนทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalAgents}</div>
                        <p className="text-sm text-muted-foreground">ที่ใช้งานอยู่</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            แรงงานจากตัวแทน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalWorkersFromAgents}</div>
                        <p className="text-sm text-muted-foreground">เฉลี่ย {avgWorkersPerAgent} คน/ตัวแทน</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            คอมมิชชั่นจ่ายแล้ว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            ฿{totalCommissionPaid.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            คอมมิชชั่นรอจ่าย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            ฿{totalCommissionPending.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tier Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        การกระจายตาม Tier
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((tier) => {
                            const tierData = commissionByTier.find((t) => t.tier === tier)
                            const count = tierData?._count || 0
                            const percentage = totalAgents > 0 ? (count / totalAgents * 100).toFixed(0) : 0

                            return (
                                <div
                                    key={tier}
                                    className={`p-6 rounded-lg text-center ${tier === 1
                                            ? 'bg-yellow-50 border-2 border-yellow-200'
                                            : tier === 2
                                                ? 'bg-gray-50 border-2 border-gray-200'
                                                : 'bg-orange-50 border-2 border-orange-200'
                                        }`}
                                >
                                    <div
                                        className={`text-4xl font-bold ${tier === 1 ? 'text-yellow-600' : tier === 2 ? 'text-gray-600' : 'text-orange-600'
                                            }`}
                                    >
                                        {count}
                                    </div>
                                    <p className="font-medium mt-1">Tier {tier}</p>
                                    <p className="text-sm text-muted-foreground">{percentage}%</p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Top by Workers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            ตัวแทนที่มีแรงงานมากที่สุด
                        </CardTitle>
                        <CardDescription>Top 5</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topByWorkers.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="space-y-3">
                                {topByWorkers.map((agent, idx) => (
                                    <Link
                                        key={agent.id}
                                        href={`/dashboard/agents/${agent.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : idx === 1
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : idx === 2
                                                            ? 'bg-orange-100 text-orange-600'
                                                            : 'bg-muted'
                                                }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{agent.companyName}</p>
                                            <p className="text-xs text-muted-foreground">{agent.agentId}</p>
                                        </div>
                                        <Badge>{agent.totalWorkers}</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top by Commission */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            คอมมิชชั่นสูงสุด
                        </CardTitle>
                        <CardDescription>Top 5</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topByCommission.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="space-y-3">
                                {topByCommission.map((agent, idx) => (
                                    <Link
                                        key={agent.id}
                                        href={`/dashboard/agents/${agent.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : idx === 1
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : idx === 2
                                                            ? 'bg-orange-100 text-orange-600'
                                                            : 'bg-muted'
                                                }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{agent.companyName}</p>
                                            <p className="text-xs text-muted-foreground">{agent.agentId}</p>
                                        </div>
                                        <span className="text-sm font-medium text-green-600">
                                            ฿{(agent.totalCommission / 1000).toFixed(0)}k
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Top by Success Rate */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            อัตราความสำเร็จสูงสุด
                        </CardTitle>
                        <CardDescription>Top 5 (แรงงาน ≥5 คน)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {topBySuccessRate.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">ไม่มีข้อมูล</div>
                        ) : (
                            <div className="space-y-3">
                                {topBySuccessRate.map((agent, idx) => (
                                    <Link
                                        key={agent.id}
                                        href={`/dashboard/agents/${agent.id}`}
                                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-lg"
                                    >
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : idx === 1
                                                        ? 'bg-gray-100 text-gray-600'
                                                        : idx === 2
                                                            ? 'bg-orange-100 text-orange-600'
                                                            : 'bg-muted'
                                                }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{agent.companyName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {agent.activeWorkers}/{agent.totalWorkers} คน
                                            </p>
                                        </div>
                                        <Badge variant="secondary">{agent.successRate.toFixed(0)}%</Badge>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* All Agents Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">รายชื่อตัวแทนทั้งหมด</CardTitle>
                            <CardDescription>เรียงตามจำนวนแรงงาน</CardDescription>
                        </div>
                        <Link href="/dashboard/agents">
                            <Button variant="outline" size="sm">จัดการตัวแทน</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-2">ตัวแทน</th>
                                    <th className="text-center py-3 px-2">Tier</th>
                                    <th className="text-center py-3 px-2">อัตรา</th>
                                    <th className="text-center py-3 px-2">แรงงาน</th>
                                    <th className="text-center py-3 px-2">ทำงาน</th>
                                    <th className="text-right py-3 px-2">คอมมิชชั่นรวม</th>
                                    <th className="text-right py-3 px-2">รอจ่าย</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agentMetrics
                                    .sort((a, b) => b.totalWorkers - a.totalWorkers)
                                    .slice(0, 20)
                                    .map((agent) => (
                                        <tr key={agent.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-2">
                                                <Link href={`/dashboard/agents/${agent.id}`} className="hover:text-primary">
                                                    <p className="font-medium">{agent.companyName}</p>
                                                    <p className="text-xs text-muted-foreground">{agent.agentId}</p>
                                                </Link>
                                            </td>
                                            <td className="text-center py-3 px-2">
                                                <Badge
                                                    variant={agent.tier === 1 ? 'default' : agent.tier === 2 ? 'secondary' : 'outline'}
                                                >
                                                    Tier {agent.tier}
                                                </Badge>
                                            </td>
                                            <td className="text-center py-3 px-2">{agent.commissionRate}%</td>
                                            <td className="text-center py-3 px-2 font-medium">{agent.totalWorkers}</td>
                                            <td className="text-center py-3 px-2">
                                                <span className="text-green-600">{agent.activeWorkers}</span>
                                            </td>
                                            <td className="text-right py-3 px-2">
                                                ฿{agent.totalCommission.toLocaleString()}
                                            </td>
                                            <td className="text-right py-3 px-2 text-orange-600">
                                                ฿{agent.pendingCommission.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
