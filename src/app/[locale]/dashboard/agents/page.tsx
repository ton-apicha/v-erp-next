import { prisma } from '@/lib/db'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    Plus,
    Search,
    Building2,
    Users,
    Phone,
    Mail,
    TrendingUp,
} from 'lucide-react'

export default async function AgentsPage(props: {
    searchParams: Promise<{ search?: string }>
}) {
    const searchParams = await props.searchParams

    const where: any = {
        status: 'ACTIVE',
    }

    if (searchParams.search) {
        where.OR = [
            { agentId: { contains: searchParams.search, mode: 'insensitive' } },
            { companyName: { contains: searchParams.search, mode: 'insensitive' } },
            { contactPerson: { contains: searchParams.search, mode: 'insensitive' } },
        ]
    }

    const agents = await prisma.agent.findMany({
        where,
        include: {
            _count: {
                select: {
                    workers: true,
                    commissions: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const stats = {
        total: agents.length,
        totalWorkers: agents.reduce((sum, a) => sum + a._count.workers, 0),
        avgWorkers: agents.length > 0
            ? Math.round(agents.reduce((sum, a) => sum + a._count.workers, 0) / agents.length)
            : 0,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">ตัวแทน (Agent)</h1>
                    <p className="text-muted-foreground">จัดการข้อมูลตัวแทนจัดหาแรงงาน</p>
                </div>
                <Link href="/dashboard/agents/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มตัวแทน
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            ตัวแทนทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            แรงงานในระบบ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            เฉลี่ยต่อตัวแทน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgWorkers} คน</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="py-4">
                    <form method="GET" className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="ค้นหา รหัส, ชื่อบริษัท, ชื่อผู้ติดต่อ..."
                                defaultValue={searchParams.search}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">ค้นหา</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Agents Grid */}
            {agents.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>ไม่พบข้อมูลตัวแทน</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {agents.map((agent) => (
                        <Link key={agent.id} href={`/dashboard/agents/${agent.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {agent.companyName.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate">{agent.companyName}</h3>
                                            <p className="text-sm text-muted-foreground font-mono">
                                                {agent.agentId}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        {agent.contactPerson && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span className="truncate">{agent.contactPerson}</span>
                                            </div>
                                        )}
                                        {agent.phoneNumber && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{agent.phoneNumber}</span>
                                            </div>
                                        )}
                                        {agent.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                <span className="truncate">{agent.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                <Users className="h-3 w-3 mr-1" />
                                                {agent._count.workers}
                                            </Badge>
                                            <Badge variant="outline">
                                                {Number(agent.commissionRate)}%
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(agent.createdAt), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
