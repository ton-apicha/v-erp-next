// =====================================================
// Partner Detail Page
// Shows partner info, stats, and linked workers
// =====================================================

import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    ArrowLeft,
    Edit,
    Phone,
    MapPin,
    Users,
    Calendar,
    FileText,
    CheckCircle,
    Clock,
    Briefcase,
} from 'lucide-react'

// Status config
const statusConfig: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'ใช้งาน', color: 'bg-green-100 text-green-800' },
    INACTIVE: { label: 'หยุดชั่วคราว', color: 'bg-yellow-100 text-yellow-800' },
    BLACKLISTED: { label: 'บัญชีดำ', color: 'bg-red-100 text-red-800' },
}

// Worker status config
const workerStatusConfig: Record<string, { label: string; color: string }> = {
    NEW: { label: 'ใหม่', color: 'bg-gray-100 text-gray-800' },
    DOCUMENTING: { label: 'ทำเอกสาร', color: 'bg-yellow-100 text-yellow-800' },
    TRAINING: { label: 'ฝึกอบรม', color: 'bg-blue-100 text-blue-800' },
    READY: { label: 'พร้อมส่งตัว', color: 'bg-green-100 text-green-800' },
    DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-purple-100 text-purple-800' },
    WORKING: { label: 'ทำงาน', color: 'bg-indigo-100 text-indigo-800' },
    COMPLETED: { label: 'ครบสัญญา', color: 'bg-teal-100 text-teal-800' },
    TERMINATED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
    RETURNED: { label: 'กลับประเทศ', color: 'bg-orange-100 text-orange-800' },
}

export default async function PartnerDetailPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params

    const partner = await prisma.partner.findUnique({
        where: { id: params.id },
        include: {
            createdBy: { select: { id: true, name: true } },
            workers: {
                select: {
                    id: true,
                    workerId: true,
                    firstNameTH: true,
                    lastNameTH: true,
                    phoneNumber: true,
                    status: true,
                    hasPassport: true,
                    hasVisa: true,
                    hasWorkPermit: true,
                    createdAt: true,
                    client: { select: { companyName: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!partner) {
        notFound()
    }

    // Calculate worker stats
    const workerStats = {
        total: partner.workers.length,
        new: partner.workers.filter(w => w.status === 'NEW').length,
        ready: partner.workers.filter(w => w.status === 'READY').length,
        working: partner.workers.filter(w => ['WORKING', 'DEPLOYED'].includes(w.status)).length,
        completed: partner.workers.filter(w => ['COMPLETED', 'RETURNED', 'TERMINATED'].includes(w.status)).length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/partners">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {partner.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold">{partner.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <span className="font-mono text-sm">{partner.partnerId}</span>
                                <Badge className={statusConfig[partner.status]?.color}>
                                    {statusConfig[partner.status]?.label || partner.status}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
                <Link href={`/dashboard/partners/${partner.id}/edit`}>
                    <Button>
                        <Edit className="h-4 w-4 mr-2" />
                        แก้ไข
                    </Button>
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Partner Info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            ข้อมูลพาร์ทเนอร์
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {partner.nickname && (
                            <div>
                                <p className="text-sm text-muted-foreground">ชื่อเล่น</p>
                                <p className="font-medium">{partner.nickname}</p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" /> เบอร์โทรศัพท์
                            </p>
                            <p className="font-medium">{partner.phoneNumber}</p>
                        </div>

                        {(partner.address || partner.village || partner.district || partner.province) && (
                            <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" /> ที่อยู่
                                </p>
                                <p className="font-medium">
                                    {[partner.address, partner.village, partner.district, partner.province]
                                        .filter(Boolean)
                                        .join(', ')}
                                </p>
                            </div>
                        )}

                        {partner.notes && (
                            <div>
                                <p className="text-sm text-muted-foreground">หมายเหตุ</p>
                                <p className="text-sm whitespace-pre-wrap">{partner.notes}</p>
                            </div>
                        )}

                        <div className="pt-4 border-t">
                            <p className="text-xs text-muted-foreground">
                                สร้างโดย: {partner.createdBy?.name || '-'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                สร้างเมื่อ: {format(new Date(partner.createdAt), 'dd MMMM yyyy', { locale: th })}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Worker Stats */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            แรงงานที่พามา
                        </CardTitle>
                        <CardDescription>
                            สถิติแรงงานที่พาร์ทเนอร์นี้พามา
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Users className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                                <p className="text-2xl font-bold text-blue-700">{workerStats.total}</p>
                                <p className="text-xs text-blue-600">ทั้งหมด</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <Clock className="h-6 w-6 mx-auto text-gray-500 mb-2" />
                                <p className="text-2xl font-bold text-gray-700">{workerStats.new}</p>
                                <p className="text-xs text-gray-600">ใหม่</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                                <p className="text-2xl font-bold text-green-700">{workerStats.ready}</p>
                                <p className="text-xs text-green-600">พร้อมส่งตัว</p>
                            </div>
                            <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                <Briefcase className="h-6 w-6 mx-auto text-indigo-500 mb-2" />
                                <p className="text-2xl font-bold text-indigo-700">{workerStats.working}</p>
                                <p className="text-xs text-indigo-600">กำลังทำงาน</p>
                            </div>
                            <div className="text-center p-4 bg-teal-50 rounded-lg">
                                <Calendar className="h-6 w-6 mx-auto text-teal-500 mb-2" />
                                <p className="text-2xl font-bold text-teal-700">{workerStats.completed}</p>
                                <p className="text-xs text-teal-600">สิ้นสุด</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Workers List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>รายชื่อแรงงาน ({partner.workers.length})</CardTitle>
                        <Link href={`/dashboard/workers/new?partnerId=${partner.id}`}>
                            <Button variant="outline" size="sm">
                                + เพิ่มแรงงาน
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {partner.workers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ยังไม่มีแรงงาน</p>
                            <Link href={`/dashboard/workers/new?partnerId=${partner.id}`}>
                                <Button variant="link" size="sm">
                                    เพิ่มแรงงานคนแรก
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">รหัส/ชื่อ</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">โทร</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">เอกสาร</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">นายจ้าง</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">วันที่เพิ่ม</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partner.workers.map((worker) => (
                                        <tr key={worker.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <Link href={`/dashboard/workers/${worker.id}`} className="hover:text-primary">
                                                    <p className="font-medium">{worker.firstNameTH} {worker.lastNameTH}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{worker.workerId}</p>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{worker.phoneNumber || '-'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center gap-1">
                                                    {worker.hasPassport && <Badge variant="secondary" className="text-xs">PP</Badge>}
                                                    {worker.hasVisa && <Badge variant="secondary" className="text-xs">V</Badge>}
                                                    {worker.hasWorkPermit && <Badge variant="secondary" className="text-xs">WP</Badge>}
                                                    {!worker.hasPassport && !worker.hasVisa && !worker.hasWorkPermit && (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{worker.client?.companyName || '-'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={workerStatusConfig[worker.status]?.color || 'bg-gray-100'}>
                                                    {workerStatusConfig[worker.status]?.label || worker.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                                                {format(new Date(worker.createdAt), 'dd/MM/yy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
