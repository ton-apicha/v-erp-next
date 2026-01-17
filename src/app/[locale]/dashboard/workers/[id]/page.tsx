// =====================================================
// Worker Detail Page - Simplified Version
// Removed: agent, loans, documents, email, lineId, religion, firstNameEN, lastNameEN
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
    User,
    Phone,
    MapPin,
    Calendar,
    Building2,
    ArrowLeft,
    Edit,
    FileText,
    CheckCircle,
    XCircle,
} from 'lucide-react'

export default async function WorkerDetailPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params

    const worker = await prisma.worker.findUnique({
        where: { id: params.id },
        include: {
            client: { select: { id: true, clientId: true, companyName: true } },
            partner: { select: { id: true, partnerId: true, name: true } },
            createdBy: { select: { id: true, name: true } },
        },
    })

    if (!worker) {
        notFound()
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        TRAINING: 'bg-blue-100 text-blue-800',
        READY: 'bg-green-100 text-green-800',
        DEPLOYED: 'bg-purple-100 text-purple-800',
        INACTIVE: 'bg-gray-100 text-gray-800',
        TERMINATED: 'bg-red-100 text-red-800',
    }

    const statusLabels: Record<string, string> = {
        PENDING: 'รอดำเนินการ',
        TRAINING: 'กำลังฝึกอบรม',
        READY: 'พร้อมทำงาน',
        DEPLOYED: 'ได้รับการจัดส่ง',
        INACTIVE: 'ไม่ได้ใช้งาน',
        TERMINATED: 'สิ้นสุดสัญญา',
    }

    // Document tags
    const documentTags = [
        { key: 'hasIdCard', label: 'บัตรประชาชน', value: worker.hasIdCard },
        { key: 'hasPassport', label: 'Passport', value: worker.hasPassport },
        { key: 'hasVisa', label: 'Visa', value: worker.hasVisa },
        { key: 'hasWorkPermit', label: 'ใบอนุญาตทำงาน', value: worker.hasWorkPermit },
        { key: 'hasMedicalCert', label: 'ใบรับรองแพทย์', value: worker.hasMedicalCert },
        { key: 'hasAcademyTraining', label: 'ผ่านการฝึกอบรม', value: worker.hasAcademyTraining },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/workers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{worker.firstNameTH} {worker.lastNameTH}</h1>
                        <p className="text-muted-foreground font-mono">{worker.workerId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/workers/${worker.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            ข้อมูลส่วนตัว
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                    {worker.firstNameTH[0]}{worker.lastNameTH?.[0] || ''}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold">{worker.firstNameTH} {worker.lastNameTH}</h2>
                                {worker.nickname && (
                                    <p className="text-muted-foreground">({worker.nickname})</p>
                                )}
                                <Badge className={statusColors[worker.status]}>
                                    {statusLabels[worker.status]}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        วันเกิด: {worker.dateOfBirth ? format(new Date(worker.dateOfBirth), 'dd MMMM yyyy', { locale: th }) : '-'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">โทร: {worker.phoneNumber || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        {worker.province || '-'}, {worker.district || '-'}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {worker.partner && (
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            พาร์ทเนอร์: <Link href={`/dashboard/partners/${worker.partner.id}`} className="text-primary hover:underline">{worker.partner.name}</Link>
                                        </span>
                                    </div>
                                )}
                                {worker.client && (
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            นายจ้าง: <Link href={`/dashboard/clients/${worker.client.id}`} className="text-primary hover:underline">{worker.client.companyName}</Link>
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Document Tags */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            เอกสาร
                        </CardTitle>
                        <CardDescription>สถานะเอกสารของแรงงาน</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {documentTags.map(tag => (
                                <div key={tag.key} className="flex items-center justify-between">
                                    <span className="text-sm">{tag.label}</span>
                                    {tag.value ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-gray-300" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Passport Expiry */}
                        {worker.passportExpiry && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">Passport หมดอายุ:</p>
                                <p className="font-medium">{format(new Date(worker.passportExpiry), 'dd/MM/yyyy')}</p>
                            </div>
                        )}

                        {/* Visa Expiry */}
                        {worker.visaExpiry && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">Visa หมดอายุ:</p>
                                <p className="font-medium">{format(new Date(worker.visaExpiry), 'dd/MM/yyyy')}</p>
                            </div>
                        )}

                        {/* Work Permit Expiry */}
                        {worker.workPermitExpiry && (
                            <div className="mt-2">
                                <p className="text-sm text-muted-foreground">ใบอนุญาตหมดอายุ:</p>
                                <p className="font-medium">{format(new Date(worker.workPermitExpiry), 'dd/MM/yyyy')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Notes */}
            {worker.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>หมายเหตุ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap">{worker.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Meta */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                        <span>สร้างโดย: {worker.createdBy?.name || '-'}</span>
                        <span>สร้างเมื่อ: {format(new Date(worker.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        <span>แก้ไขล่าสุด: {format(new Date(worker.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
