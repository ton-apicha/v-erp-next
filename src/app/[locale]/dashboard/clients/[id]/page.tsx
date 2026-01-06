import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    Building2,
    Users,
    FileSpreadsheet,
    Briefcase,
    FileText,
} from 'lucide-react'
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'

export default async function ClientProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            workers: {
                where: { isArchived: false },
                select: { id: true, status: true, firstNameTH: true, lastNameTH: true, workerId: true, position: true, createdAt: true },
            },
            orders: {
                take: 5,
                orderBy: { createdAt: 'desc' },
            },
            documents: {
                orderBy: { createdAt: 'desc' },
            },
            createdBy: { select: { name: true } },
        },
    })

    if (!client) {
        notFound()
    }

    // Get recent workers for this client
    const recentWorkers = client.workers.slice(0, 5)

    const stats = {
        totalWorkers: client.workers.length,
        activeWorkers: client.workers.filter((w) => w.status === 'WORKING').length,
        totalOrders: client.orders.length,
        pendingOrders: client.orders.filter((o) => o.status === 'DRAFT' || o.status === 'QUOTED' || o.status === 'APPROVED').length,
    }

    const statusConfig: Record<string, { label: string; color: string }> = {
        NEW_LEAD: { label: 'รายชื่อใหม่', color: 'bg-gray-100 text-gray-800' },
        SCREENING: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
        PROCESSING: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800' },
        ACADEMY: { label: 'ฝึกอบรม', color: 'bg-indigo-100 text-indigo-800' },
        READY: { label: 'พร้อมส่งตัว', color: 'bg-green-100 text-green-800' },
        DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-teal-100 text-teal-800' },
        WORKING: { label: 'กำลังทำงาน', color: 'bg-purple-100 text-purple-800' },
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/clients">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{client.companyName}</h1>
                        <p className="text-muted-foreground font-mono">{client.clientId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/clients/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                            <Briefcase className="h-4 w-4" />
                            กำลังทำงาน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.activeWorkers}</div>
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
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            ออเดอร์รอดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Profile */}
                <div className="space-y-6">
                    {/* Company Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลบริษัท</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold">{client.companyName}</p>
                                    {client.companyNameEN && (
                                        <p className="text-sm text-muted-foreground">{client.companyNameEN}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                {client.industry && (
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span>{client.industry}</span>
                                    </div>
                                )}
                                {client.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${client.phoneNumber}`} className="hover:text-primary">
                                            {client.phoneNumber}
                                        </a>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${client.email}`} className="hover:text-primary truncate">
                                            {client.email}
                                        </a>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-muted-foreground">{client.address}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Person */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ผู้ติดต่อ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ชื่อ</span>
                                <span className="font-medium">{client.contactPerson || '-'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Workers & Orders */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Workers */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        แรงงานที่นายจ้าง
                                    </CardTitle>
                                    <CardDescription>
                                        {stats.totalWorkers} คนทั้งหมด, {stats.activeWorkers} คนกำลังทำงาน
                                    </CardDescription>
                                </div>
                                <Link href={`/dashboard/workers?clientId=${id}`}>
                                    <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentWorkers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ยังไม่มีแรงงาน</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {recentWorkers.map((worker) => {
                                        const workerStatus = statusConfig[worker.status] || { label: worker.status, color: 'bg-gray-100' }
                                        return (
                                            <Link
                                                key={worker.id}
                                                href={`/dashboard/workers/${worker.id}`}
                                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                            {worker.firstNameTH?.[0]}{worker.lastNameTH?.[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {worker.firstNameTH} {worker.lastNameTH}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {worker.position || worker.workerId}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge className={workerStatus.color}>{workerStatus.label}</Badge>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileSpreadsheet className="h-5 w-5" />
                                        ออเดอร์ล่าสุด
                                    </CardTitle>
                                    <CardDescription>
                                        รายการสั่งจ้างแรงงาน
                                    </CardDescription>
                                </div>
                                <Link href={`/dashboard/orders?clientId=${id}`}>
                                    <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {client.orders.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ยังไม่มีออเดอร์</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {client.orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium font-mono text-sm">{order.orderId}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.requestedCount} คน
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <Badge
                                                    variant={
                                                        order.status === 'COMPLETED'
                                                            ? 'default'
                                                            : order.status === 'CANCELLED'
                                                                ? 'destructive'
                                                                : 'secondary'
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(order.createdAt), 'dd/MM/yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    เอกสาร (Documents)
                                </CardTitle>
                                <DocumentUpload clientId={id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DocumentList documents={client.documents} />
                        </CardContent>
                    </Card>

                    {/* Audit Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลการสร้าง</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สร้างโดย</span>
                                <span>{client.createdBy?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันที่สร้าง</span>
                                <span>{format(new Date(client.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                                <span>{format(new Date(client.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
