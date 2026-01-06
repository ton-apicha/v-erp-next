import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import {
    ArrowLeft,
    CreditCard,
    User,
    Calendar,
    DollarSign,
    FileText,
    AlertTriangle,
    CheckCircle,
    Clock,
} from 'lucide-react'
import PaymentForm from '@/components/finance/PaymentForm'

export default async function LoanDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const loan = await prisma.loan.findUnique({
        where: { id },
        include: {
            worker: {
                select: {
                    id: true,
                    workerId: true,
                    firstNameTH: true,
                    lastNameTH: true,
                    phoneNumber: true,
                    client: { select: { companyName: true } },
                },
            },
            payments: {
                orderBy: { paidAt: 'desc' },
                include: {
                    recordedBy: { select: { name: true } },
                },
            },
            createdBy: { select: { name: true } },
        },
    })

    if (!loan) {
        notFound()
    }

    const totalPaid = loan.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const progress = (totalPaid / Number(loan.principal)) * 100

    const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
        ACTIVE: { label: 'กำลังผ่อน', color: 'bg-blue-100 text-blue-800', icon: Clock },
        OVERDUE: { label: 'ค้างชำระ', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
        PAID_OFF: { label: 'ชำระครบแล้ว', color: 'bg-green-100 text-green-800', icon: CheckCircle },
        CANCELLED: { label: 'ยกเลิก', color: 'bg-gray-100 text-gray-800', icon: FileText },
    }

    const status = statusConfig[loan.status] || statusConfig.ACTIVE
    const StatusIcon = status.icon

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/finance/loans">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold font-mono">{loan.loanId}</h1>
                            <Badge className={status.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            สร้างเมื่อ {format(new Date(loan.createdAt), 'dd MMMM yyyy', { locale: th })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                สรุปสินเชื่อ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>ความคืบหน้าการชำระ</span>
                                    <span className="font-medium">{progress.toFixed(1)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                    <span>ชำระแล้ว ฿{totalPaid.toLocaleString()}</span>
                                    <span>ยอดรวม ฿{Number(loan.principal).toLocaleString()}</span>
                                </div>
                            </div>

                            <Separator />

                            {/* Amounts */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">ยอดกู้ทั้งหมด</p>
                                    <p className="text-2xl font-bold">฿{Number(loan.principal).toLocaleString()}</p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">ชำระแล้ว</p>
                                    <p className="text-2xl font-bold text-green-600">฿{totalPaid.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">คงเหลือ</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        ฿{Number(loan.balance).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Details */}
                            <div className="grid md:grid-cols-2 gap-4 text-sm">


                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">อัตราดอกเบี้ย</span>
                                    <span className="font-medium">{Number(loan.interestRate)}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">จำนวนครั้งที่ชำระ</span>
                                    <span className="font-medium">{loan.payments.length} ครั้ง</span>
                                </div>
                            </div>

                            {loan.purpose && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">หมายเหตุ</p>
                                        <p className="text-sm">{loan.purpose}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                ประวัติการชำระเงิน
                            </CardTitle>
                            <CardDescription>
                                {loan.payments.length} รายการ
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loan.payments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>ยังไม่มีการชำระเงิน</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {loan.payments.map((payment) => (
                                        <div
                                            key={payment.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium font-mono text-sm">{payment.paymentId}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(payment.paidAt), 'dd MMM yyyy HH:mm', { locale: th })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-green-600">
                                                    +฿{Number(payment.amount).toLocaleString()}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">{payment.method}</Badge>
                                                    {payment.recordedBy && (
                                                        <span className="text-xs text-muted-foreground">
                                                            โดย {payment.recordedBy.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Worker Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm">ข้อมูลแรงงาน</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Link
                                href={`/dashboard/workers/${loan.worker.id}`}
                                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {loan.worker.firstNameTH} {loan.worker.lastNameTH}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {loan.worker.workerId}
                                    </p>
                                </div>
                            </Link>

                            {loan.worker.client && (
                                <div className="mt-3 text-sm">
                                    <p className="text-muted-foreground">นายจ้าง</p>
                                    <p className="font-medium">{loan.worker.client.companyName}</p>
                                </div>
                            )}

                            {loan.worker.phoneNumber && (
                                <div className="mt-3 text-sm">
                                    <p className="text-muted-foreground">เบอร์โทร</p>
                                    <a href={`tel:${loan.worker.phoneNumber}`} className="font-medium hover:text-primary">
                                        {loan.worker.phoneNumber}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Record Payment */}
                    {loan.status !== 'PAID_OFF' && loan.status !== 'CANCELLED' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">บันทึกการชำระเงิน</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentForm loanId={loan.id} remainingBalance={Number(loan.balance)} />
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
                                <span>{loan.createdBy?.name || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันที่สร้าง</span>
                                <span>{format(new Date(loan.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">อัปเดตล่าสุด</span>
                                <span>{format(new Date(loan.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
