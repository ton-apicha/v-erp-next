import { prisma } from '@/lib/db'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ArrowLeft, DollarSign, Search, ArrowDownRight } from 'lucide-react'

export default async function PaymentsPage(props: {
    searchParams: Promise<{ search?: string; method?: string }>
}) {
    const searchParams = await props.searchParams

    const where: any = {}

    if (searchParams.method && searchParams.method !== 'ALL') {
        where.method = searchParams.method
    }

    if (searchParams.search) {
        where.OR = [
            { paymentId: { contains: searchParams.search, mode: 'insensitive' } },
            { reference: { contains: searchParams.search, mode: 'insensitive' } },
            { loan: { worker: { firstNameTH: { contains: searchParams.search, mode: 'insensitive' } } } },
        ]
    }

    const payments = await prisma.payment.findMany({
        where,
        include: {
            loan: {
                include: {
                    worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
                },
            },
            recordedBy: { select: { name: true } },
        },
        orderBy: { paidAt: 'desc' },
        take: 100,
    })

    const stats = {
        total: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
        cash: payments.filter((p) => p.method === 'CASH').reduce((sum, p) => sum + Number(p.amount || 0), 0),
        transfer: payments.filter((p) => p.method === 'BANK_TRANSFER').reduce((sum, p) => sum + Number(p.amount || 0), 0),
        deduction: payments.filter((p) => p.method === 'PAYROLL_DEDUCTION').reduce((sum, p) => sum + Number(p.amount || 0), 0),
    }

    const methodLabels: Record<string, string> = {
        CASH: 'เงินสด',
        TRANSFER: 'โอนเงิน',
        DEDUCTION: 'หักเงินเดือน',
        CHECK: 'เช็ค',
    }

    const methodColors: Record<string, string> = {
        CASH: 'bg-green-100 text-green-800',
        TRANSFER: 'bg-blue-100 text-blue-800',
        DEDUCTION: 'bg-purple-100 text-purple-800',
        CHECK: 'bg-yellow-100 text-yellow-800',
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/finance">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">การชำระเงิน</h1>
                    <p className="text-muted-foreground">ประวัติการชำระเงินทั้งหมด</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ยอดรวมทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ฿{stats.totalAmount.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">{stats.total} รายการ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            เงินสด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{stats.cash.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            โอนเงิน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{stats.transfer.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            หักเงินเดือน
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{stats.deduction.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="py-4">
                    <form method="GET" className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="ค้นหา รหัส, เลขอ้างอิง, ชื่อ..."
                                defaultValue={searchParams.search}
                                className="pl-9"
                            />
                        </div>
                        <select
                            name="method"
                            defaultValue={searchParams.method || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกวิธีการ</option>
                            <option value="CASH">เงินสด</option>
                            <option value="BANK_TRANSFER">โอนเงิน</option>
                            <option value="PAYROLL_DEDUCTION">หักเงินเดือน</option>
                            <option value="CHECK">เช็ค</option>
                        </select>
                        <Button type="submit">ค้นหา</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardContent className="p-0">
                    {payments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบข้อมูลการชำระเงิน</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">รหัส</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">แรงงาน</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">สินเชื่อ</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">จำนวน</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วิธีการ</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">เลขอ้างอิง</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วันที่</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">บันทึกโดย</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-sm">{payment.paymentId}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dashboard/workers/${payment.loan.workerId}`}
                                                    className="hover:text-primary"
                                                >
                                                    <p className="font-medium text-sm">
                                                        {payment.loan.worker.firstNameTH} {payment.loan.worker.lastNameTH}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {payment.loan.worker.workerId}
                                                    </p>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dashboard/finance/loans/${payment.loanId}`}
                                                    className="font-mono text-sm hover:text-primary"
                                                >
                                                    {payment.loan.loanId}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <span className="font-medium text-green-600">
                                                    +฿{Number(payment.amount).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={methodColors[payment.method]}>
                                                    {methodLabels[payment.method] || payment.method}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {payment.reference || '-'}
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm">
                                                {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground">
                                                {payment.recordedBy?.name || '-'}
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
