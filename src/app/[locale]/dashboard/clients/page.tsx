import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
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
    Briefcase,
    FileSpreadsheet,
} from 'lucide-react'

export default async function ClientsPage(props: {
    searchParams: Promise<{ search?: string }>
}) {
    const searchParams = await props.searchParams

    const where: any = {
        status: 'ACTIVE',
    }

    if (searchParams.search) {
        where.OR = [
            { clientId: { contains: searchParams.search, mode: 'insensitive' } },
            { companyName: { contains: searchParams.search, mode: 'insensitive' } },
            { contactPerson: { contains: searchParams.search, mode: 'insensitive' } },
        ]
    }

    const clients = await prisma.client.findMany({
        where,
        include: {
            _count: {
                select: {
                    workers: true,
                    orders: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const stats = {
        total: clients.length,
        totalWorkers: clients.reduce((sum, c) => sum + c._count.workers, 0),
        totalOrders: clients.reduce((sum, c) => sum + c._count.orders, 0),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">นายจ้าง (Client)</h1>
                    <p className="text-muted-foreground">จัดการข้อมูลนายจ้างและบริษัทจ้างแรงงาน</p>
                </div>
                <Link href="/dashboard/clients/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        เพิ่มนายจ้าง
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            นายจ้างทั้งหมด
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
                            แรงงานทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            ออเดอร์ทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
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
                                placeholder="ค้นหา รหัส, ชื่อบริษัท..."
                                defaultValue={searchParams.search}
                                className="pl-9"
                            />
                        </div>
                        <Button type="submit">ค้นหา</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Clients Grid */}
            {clients.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>ไม่พบข้อมูลนายจ้าง</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map((client) => (
                        <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                                                {(client.companyName || client.personName || 'N/A').slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold truncate">{client.companyName || client.personName}</h3>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {client.clientId}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-2 text-sm">
                                        {client.industry && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Briefcase className="h-4 w-4" />
                                                <span className="truncate">{client.industry}</span>
                                            </div>
                                        )}
                                        {client.contactPerson && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span className="truncate">{client.contactPerson}</span>
                                            </div>
                                        )}
                                        {client.phoneNumber && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                <span>{client.phoneNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                <Users className="h-3 w-3 mr-1" />
                                                {client._count.workers}
                                            </Badge>
                                            <Badge variant="outline">
                                                <FileSpreadsheet className="h-3 w-3 mr-1" />
                                                {client._count.orders}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(client.createdAt), 'dd/MM/yyyy')}
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
