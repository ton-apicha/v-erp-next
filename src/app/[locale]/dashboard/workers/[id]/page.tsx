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
import DocumentUpload from '@/components/documents/DocumentUpload'
import DocumentList from '@/components/documents/DocumentList'
import {
    ArrowLeft,
    Edit,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    FileText,
    Briefcase,
    User,
    Building2,
    Handshake,
} from 'lucide-react'

const statusConfig: Record<string, { label: string; color: string }> = {
    NEW_LEAD: { label: 'รายชื่อใหม่', color: 'bg-gray-100 text-gray-800' },
    SCREENING: { label: 'รอตรวจสอบ', color: 'bg-yellow-100 text-yellow-800' },
    PROCESSING: { label: 'กำลังดำเนินการ', color: 'bg-blue-100 text-blue-800' },
    ACADEMY: { label: 'ฝึกอบรม', color: 'bg-indigo-100 text-indigo-800' },
    READY: { label: 'พร้อมส่งตัว', color: 'bg-green-100 text-green-800' },
    DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-teal-100 text-teal-800' },
    WORKING: { label: 'กำลังทำงาน', color: 'bg-purple-100 text-purple-800' },
    COMPLETED: { label: 'สิ้นสุดสัญญา', color: 'bg-slate-100 text-slate-800' },
    TERMINATED: { label: 'เลิกจ้าง', color: 'bg-red-100 text-red-800' },
    REJECTED: { label: 'ปฏิเสธ', color: 'bg-red-100 text-red-800' },
}

export default async function WorkerProfilePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const worker = await prisma.worker.findUnique({
        where: { id },
        include: {
            agent: true,
            client: true,
            documents: {
                orderBy: { createdAt: 'desc' },
            },
            loans: {
                orderBy: { createdAt: 'desc' },
            },
            createdBy: { select: { name: true } },
        },
    })

    if (!worker) {
        notFound()
    }

    const initials = `${worker.firstNameTH?.[0] || ''}${worker.lastNameTH?.[0] || ''}`
    const status = statusConfig[worker.status] || { label: worker.status, color: 'bg-gray-100' }
    const age = worker.dateOfBirth
        ? Math.floor((Date.now() - new Date(worker.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : null

    const totalLoanBalance = worker.loans.reduce(
        (sum, loan) => sum + Number(loan.balance || 0),
        0
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/workers">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">ข้อมูลแรงงาน</h1>
                        <p className="text-muted-foreground font-mono">{worker.workerId}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/workers/${id}/edit`}>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            แก้ไข
                        </Button>
                    </Link>
                    <Button variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        View as User
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column - Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center">
                                <Avatar className="h-24 w-24 mx-auto mb-4">
                                    <AvatarImage src={undefined} alt={worker.firstNameTH} />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold">
                                    {worker.firstNameTH} {worker.lastNameTH}
                                </h2>
                                {worker.firstNameEN && (
                                    <p className="text-sm text-muted-foreground">
                                        {worker.firstNameEN} {worker.lastNameEN}
                                    </p>
                                )}
                                {worker.nickname && (
                                    <p className="text-sm text-muted-foreground">({worker.nickname})</p>
                                )}
                                <div className="mt-3">
                                    <Badge className={status.color}>{status.label}</Badge>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-3 text-sm">
                                {worker.phoneNumber && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a href={`tel:${worker.phoneNumber}`} className="hover:text-primary">
                                            {worker.phoneNumber}
                                        </a>
                                    </div>
                                )}
                                {worker.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${worker.email}`} className="hover:text-primary truncate">
                                            {worker.email}
                                        </a>
                                    </div>
                                )}
                                {worker.address && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <span className="text-muted-foreground">{worker.address}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลสรุป</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">อายุ</span>
                                <span>{age ? `${age} ปี` : '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">เพศ</span>
                                <span>
                                    {worker.gender === 'MALE' ? 'ชาย' : worker.gender === 'FEMALE' ? 'หญิง' : 'อื่นๆ'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">สัญชาติ</span>
                                <span>{worker.nationality}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">เอกสาร</span>
                                <span>{worker.documents.length} ไฟล์</span>
                            </div>
                            {totalLoanBalance > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">ยอดค้างชำระ</span>
                                    <span className="text-destructive font-medium">
                                        ฿{totalLoanBalance.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Tabs Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5" />
                                ข้อมูลส่วนตัว
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">วันเกิด</p>
                                    <p className="font-medium">
                                        {worker.dateOfBirth
                                            ? format(new Date(worker.dateOfBirth), 'dd MMMM yyyy', { locale: th })
                                            : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">ศาสนา</p>
                                    <p className="font-medium">{worker.religion || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Line ID</p>
                                    <p className="font-medium">{worker.lineId || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">ผู้ติดต่อฉุกเฉิน</p>
                                    <p className="font-medium">
                                        {worker.emergencyName
                                            ? `${worker.emergencyName} (${worker.emergencyRelation || '-'}) ${worker.emergencyPhone || ''}`
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Section - Updated */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        เอกสาร
                                    </CardTitle>
                                    <CardDescription>
                                        Passport, Visa, Work Permit และเอกสารอื่นๆ
                                    </CardDescription>
                                </div>
                                <DocumentUpload workerId={id} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Quick Reference Cards */}
                            <div className="grid md:grid-cols-3 gap-4 text-sm mb-6">
                                <div className="p-4 border rounded-lg">
                                    <p className="text-muted-foreground">Passport</p>
                                    <p className="font-medium font-mono">{worker.passportNo || '-'}</p>
                                    {worker.passportExpiry && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            หมด: {format(new Date(worker.passportExpiry), 'dd/MM/yyyy')}
                                        </p>
                                    )}
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <p className="text-muted-foreground">Visa</p>
                                    <p className="font-medium font-mono">{worker.visaNo || '-'}</p>
                                    {worker.visaExpiry && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            หมด: {format(new Date(worker.visaExpiry), 'dd/MM/yyyy')}
                                        </p>
                                    )}
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <p className="text-muted-foreground">Work Permit</p>
                                    <p className="font-medium font-mono">{worker.workPermitNo || '-'}</p>
                                    {worker.workPermitExpiry && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            หมด: {format(new Date(worker.workPermitExpiry), 'dd/MM/yyyy')}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Document List with Upload/Download/Version Control */}
                            <DocumentList documents={worker.documents} showVersionHistory />
                        </CardContent>
                    </Card>

                    {/* Employment */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Briefcase className="h-5 w-5" />
                                การจ้างงาน
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Agent */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Handshake className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">ตัวแทน</p>
                                    </div>
                                    {worker.agent ? (
                                        <Link
                                            href={`/dashboard/agents/${worker.agent.id}`}
                                            className="font-medium hover:text-primary"
                                        >
                                            {worker.agent.companyName}
                                        </Link>
                                    ) : (
                                        <p className="text-muted-foreground">-</p>
                                    )}
                                </div>

                                {/* Client */}
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">นายจ้าง</p>
                                    </div>
                                    {worker.client ? (
                                        <Link
                                            href={`/dashboard/clients/${worker.client.id}`}
                                            className="font-medium hover:text-primary"
                                        >
                                            {worker.client.companyName}
                                        </Link>
                                    ) : (
                                        <p className="text-muted-foreground">-</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">ตำแหน่ง</p>
                                    <p className="font-medium">{worker.position || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">เงินเดือน</p>
                                    <p className="font-medium">
                                        {worker.salary ? `฿${Number(worker.salary).toLocaleString()}` : '-'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">วันเริ่มงาน</p>
                                    <p className="font-medium">
                                        {worker.startDate
                                            ? format(new Date(worker.startDate), 'dd/MM/yyyy')
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial */}
                    {worker.loans.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    ข้อมูลการเงิน
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {worker.loans.map((loan) => (
                                        <div
                                            key={loan.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium font-mono">{loan.loanId}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    ยอดกู้: ฿{Number(loan.principal).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-destructive">
                                                    ฿{Number(loan.balance).toLocaleString()}
                                                </p>
                                                <Badge
                                                    variant={loan.status === 'PAID_OFF' ? 'default' : 'destructive'}
                                                    className="text-xs"
                                                >
                                                    {loan.status === 'PAID_OFF' ? 'ชำระแล้ว' : 'ค้างชำระ'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
