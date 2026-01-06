import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    Building2,
    Users,
    CreditCard,
    TrendingUp,
    FileText,
    Calendar,
    Handshake,
} from 'lucide-react'

export default async function AgentProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
            workers: {
                where: { isArchived: false },
                select: { id: true, status: true },
            },
            commissions: {
                where: { status: { in: ['PENDING', 'APPROVED'] } },
                select: { amount: true, status: true },
            },
            createdBy: { select: { name: true } },
        },
    })

    if (!agent) {
        notFound()
    }

    // Get recent workers for this agent
    const recentWorkers = await prisma.worker.findMany({
        where: { agentId: id, isArchived: false },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            workerId: true,
            firstNameTH: true,
            lastNameTH: true,
            status: true,
            createdAt: true,
        },
    })

    const stats = {
        totalWorkers: agent.workers.length,
        activeWorkers: agent.workers.filter((w) => w.status === 'WORKING').length,
        pendingWorkers: agent.workers.filter((w) => ['NEW_LEAD', 'SCREENING', 'PROCESSING'].includes(w.status)).length,
        pendingCommission: agent.commissions
            .filter((c) => c.status === 'PENDING')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0),
        approvedCommission: agent.commissions
            .filter((c) => c.status === 'APPROVED')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0),
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
                    <Link href="/dashboard/agents">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{agent.companyName}</h1>
                        <p className="text-muted-foreground font-mono">{agent.agentId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/agents/${id}/edit`}>
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
                            <Handshake className="h-4 w-4" />
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
                            <TrendingUp className="h-4 w-4" />
                            คอมมิชชั่นรออนุมัติ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ฿{stats.pendingCommission.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            คอมมิชชั่นรอจ่าย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            ฿{stats.approvedCommission.toLocaleString()}
                        </div>
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
                                    <div>
                                        <p className="font-bold">{agent.companyName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            เลขทะเบียน: {agent.taxId || '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                {agent.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${agent.phoneNumber}`} className="hover:text-primary">
                                            {agent.phoneNumber}
                                        </a>
                                    </div>
                                )}
                                {agent.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${agent.email}`} className="hover:text-primary truncate">
                                            {agent.email}
                                        </a>
                                    </div>
                                )}
                                {agent.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-muted-foreground">{agent.address}</span>
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
                                <span className="font-medium">{agent.contactPerson || '-'}</span>
                            </div>
                            {agent.phoneNumber && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">เบอร์โทร</span>
                                    <a href={`tel:${agent.phoneNumber}`} className="font-medium hover:text-primary">
                                        {agent.phoneNumber}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Commission Rate */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">อัตราค่าคอมมิชชั่น</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <p className="text-4xl font-bold text-primary">
                                    {Number(agent.commissionRate)}%
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">ต่อการจัดหาแรงงาน</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Workers */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Workers */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        แรงงานล่าสุด
                                    </CardTitle>
                                    <CardDescription>
                                        {stats.totalWorkers} คนในระบบ
                                    </CardDescription>
                                </div>
                                <Link href={`/dashboard/workers?agentId=${id}`}>
                                    <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {recentWorkers.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ยังไม่มีแรงงานในระบบ</p>
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
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {worker.workerId}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={workerStatus.color}>{workerStatus.label}</Badge>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(worker.createdAt), 'dd/MM/yyyy')}
                                                    </p>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {agent.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    หมายเหตุ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {agent.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Audit Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลการสร้าง</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">สร้างโดย</span>
                                <span>{agent.createdBy?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันที่สร้าง</span>
                                <span>{format(new Date(agent.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                                <span>{format(new Date(agent.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
