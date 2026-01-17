// =====================================================
// Deployment Page
// Shows workers ready for deployment and deployment history
// =====================================================

import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Truck,
    Users,
    CheckCircle,
    Clock,
    Briefcase,
    Search,
    Factory,
    UserCircle,
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

// Status config
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    READY: { label: 'พร้อมส่งตัว', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-purple-100 text-purple-800', icon: Truck },
    WORKING: { label: 'ทำงาน', color: 'bg-indigo-100 text-indigo-800', icon: Briefcase },
}

export default async function DeploymentPage(props: {
    searchParams: Promise<{
        tab?: string
        search?: string
        page?: string
    }>
}) {
    const searchParams = await props.searchParams
    const tab = searchParams.tab || 'ready'
    const page = parseInt(searchParams.page || '1')
    const pageSize = 20

    // Status filter based on tab
    const statusFilter = tab === 'ready' ? 'READY'
        : tab === 'deployed' ? 'DEPLOYED'
            : tab === 'working' ? 'WORKING'
                : 'READY'

    // Build where clause
    const where: any = {
        status: statusFilter,
    }

    if (searchParams.search) {
        where.OR = [
            { firstNameTH: { contains: searchParams.search, mode: 'insensitive' } },
            { lastNameTH: { contains: searchParams.search, mode: 'insensitive' } },
            { workerId: { contains: searchParams.search, mode: 'insensitive' } },
        ]
    }

    // Fetch workers
    const [workers, total] = await Promise.all([
        prisma.worker.findMany({
            where,
            include: {
                partner: { select: { name: true, partnerId: true } },
                client: { select: { companyName: true, personName: true, clientId: true, type: true } },
            },
            orderBy: tab === 'ready' ? { createdAt: 'desc' } : { deploymentDate: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.worker.count({ where }),
    ])

    const totalPages = Math.ceil(total / pageSize)

    // Get stats
    const stats = {
        ready: await prisma.worker.count({ where: { status: 'READY' } }),
        deployed: await prisma.worker.count({ where: { status: 'DEPLOYED' } }),
        working: await prisma.worker.count({ where: { status: 'WORKING' } }),
    }

    // Get clients with workers
    const clientsWithWorkers = await prisma.client.findMany({
        where: {
            workers: {
                some: { status: { in: ['READY', 'DEPLOYED', 'WORKING'] } },
            },
        },
        include: {
            _count: {
                select: { workers: true },
            },
        },
        take: 5,
        orderBy: { workers: { _count: 'desc' } },
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <Truck className="h-8 w-8" />
                        จัดส่งแรงงาน
                    </h1>
                    <p className="text-muted-foreground">จัดการการส่งตัวแรงงานไปทำงาน</p>
                </div>
                <Link href="/dashboard/deployment/new">
                    <Button>
                        <Truck className="h-4 w-4 mr-2" />
                        ส่งตัวแรงงาน
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Link href="?tab=ready">
                    <Card className={`cursor-pointer hover:shadow-md transition ${tab === 'ready' ? 'ring-2 ring-green-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                            <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
                            <p className="text-xs text-muted-foreground">พร้อมส่งตัว</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="?tab=deployed">
                    <Card className={`cursor-pointer hover:shadow-md transition ${tab === 'deployed' ? 'ring-2 ring-purple-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <Truck className="h-6 w-6 mx-auto text-purple-500 mb-2" />
                            <p className="text-2xl font-bold text-purple-700">{stats.deployed}</p>
                            <p className="text-xs text-muted-foreground">ส่งตัวแล้ว</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="?tab=working">
                    <Card className={`cursor-pointer hover:shadow-md transition ${tab === 'working' ? 'ring-2 ring-indigo-500' : ''}`}>
                        <CardContent className="p-4 text-center">
                            <Briefcase className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
                            <p className="text-2xl font-bold text-indigo-700">{stats.working}</p>
                            <p className="text-xs text-muted-foreground">กำลังทำงาน</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Search */}
                    <Card>
                        <CardContent className="p-4">
                            <form method="GET" className="flex gap-4">
                                <input type="hidden" name="tab" value={tab} />
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        name="search"
                                        placeholder="ค้นหาด้วยชื่อ, รหัส..."
                                        defaultValue={searchParams.search}
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit">ค้นหา</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Workers List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {statusFilter === 'READY' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                {statusFilter === 'DEPLOYED' && <Truck className="h-5 w-5 text-purple-500" />}
                                {statusFilter === 'WORKING' && <Briefcase className="h-5 w-5 text-indigo-500" />}
                                {statusConfig[statusFilter]?.label} ({total})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {workers.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ไม่พบแรงงาน</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="text-left py-3 px-4 text-sm font-medium">รหัส/ชื่อ</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium">พาร์ทเนอร์</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium">นายจ้าง</th>
                                                <th className="text-center py-3 px-4 text-sm font-medium">เอกสาร</th>
                                                <th className="text-right py-3 px-4 text-sm font-medium">วันที่</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {workers.map((worker) => (
                                                <tr key={worker.id} className="border-b hover:bg-muted/30">
                                                    <td className="py-3 px-4">
                                                        <Link href={`/dashboard/workers/${worker.id}`} className="hover:text-primary">
                                                            <p className="font-medium">{worker.firstNameTH} {worker.lastNameTH}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">{worker.workerId}</p>
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        {worker.partner ? (
                                                            <Link href={`/dashboard/partners/${worker.partnerId}`} className="hover:text-primary">
                                                                {worker.partner.name}
                                                            </Link>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {worker.client ? (
                                                            <div className="flex items-center gap-2">
                                                                {worker.client.type === 'FACTORY' ? (
                                                                    <Factory className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                                <span className="text-sm">
                                                                    {worker.client.companyName || worker.client.personName}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">ยังไม่ระบุ</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex justify-center gap-1">
                                                            {worker.hasPassport && <Badge variant="secondary" className="text-xs">PP</Badge>}
                                                            {worker.hasVisa && <Badge variant="secondary" className="text-xs">V</Badge>}
                                                            {worker.hasWorkPermit && <Badge variant="secondary" className="text-xs">WP</Badge>}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        {worker.deploymentDate ? (
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(worker.deploymentDate), 'dd MMM yy', { locale: th })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
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
                                <Link href={`?tab=${tab}&page=${page - 1}`}>
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
                                <Link href={`?tab=${tab}&page=${page + 1}`}>
                                    <Button variant="outline" size="sm">
                                        ถัดไป
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar - Top Clients */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Factory className="h-4 w-4" />
                                นายจ้างที่มีแรงงาน
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {clientsWithWorkers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">ยังไม่มี</p>
                            ) : (
                                clientsWithWorkers.map((client) => (
                                    <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                                        <div className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                                            <div className="flex items-center gap-2">
                                                {client.type === 'FACTORY' ? (
                                                    <Factory className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span className="text-sm font-medium truncate max-w-[120px]">
                                                    {client.companyName || client.personName}
                                                </span>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                                {client._count.workers}
                                            </Badge>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">ดำเนินการด่วน</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href="/dashboard/workers?status=READY" className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    ดูแรงงานพร้อมส่ง
                                </Button>
                            </Link>
                            <Link href="/dashboard/clients" className="block">
                                <Button variant="outline" className="w-full justify-start">
                                    <Factory className="h-4 w-4 mr-2" />
                                    จัดการนายจ้าง
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
