import { prisma } from '@/lib/db'
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeft,
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    PiggyBank,
    AlertTriangle,
} from 'lucide-react'

export default async function FinancialReportPage() {
    const now = new Date()

    // Get last 6 months for trend
    const monthsInterval = eachMonthOfInterval({
        start: subMonths(now, 5),
        end: now,
    })

    // Monthly payment data
    const monthlyPayments = await Promise.all(
        monthsInterval.map(async (month) => {
            const start = startOfMonth(month)
            const end = endOfMonth(month)

            const payments = await prisma.payment.findMany({
                where: { paidAt: { gte: start, lte: end } },
            })

            return {
                month: format(month, 'MMM', { locale: th }),
                fullMonth: format(month, 'MMMM yyyy', { locale: th }),
                total: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
                count: payments.length,
            }
        })
    )

    // Loan summary
    const loanStats = await prisma.loan.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
            principal: true,
            balance: true,
        },
    })

    const totalLoans = loanStats.reduce((sum, s) => sum + s._count, 0)
    const activeLoansData = loanStats.find(s => s.status === 'ACTIVE')
    const overdueLoansData = loanStats.find(s => s.status === 'OVERDUE')
    const paidLoansData = loanStats.find(s => s.status === 'PAID_OFF')

    // Commission summary
    const commissionStats = await prisma.commission.groupBy({
        by: ['status'],
        _count: true,
        _sum: {
            amount: true,
        },
    })

    const pendingCommissions = commissionStats.find(s => s.status === 'PENDING')
    const approvedCommissions = commissionStats.find(s => s.status === 'APPROVED')
    const paidCommissions = commissionStats.find(s => s.status === 'PAID')

    // Recent payments
    const recentPayments = await prisma.payment.findMany({
        take: 10,
        orderBy: { paidAt: 'desc' },
        include: {
            loan: {
                include: {
                    worker: {
                        select: { firstNameTH: true, lastNameTH: true, workerId: true }
                    }
                }
            }
        }
    })

    // Calculate totals
    const totalPaymentsAllTime = await prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
    })

    const maxMonthlyPayment = Math.max(...monthlyPayments.map(m => m.total))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/reports">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">รายงานการเงิน</h1>
                    <p className="text-muted-foreground">
                        สรุปข้อมูลสินเชื่อ การชำระเงิน และค่าคอมมิชชั่น
                    </p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Wallet className="h-4 w-4" />
                            ยอดชำระรวมทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ฿{Number(totalPaymentsAllTime._sum.amount || 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {totalPaymentsAllTime._count} รายการ
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            สินเชื่อทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLoans}</div>
                        <p className="text-sm text-muted-foreground">
                            ค้างชำระ {Number(activeLoansData?._sum.balance || 0).toLocaleString()} บาท
                        </p>
                    </CardContent>
                </Card>

                <Card className={overdueLoansData?._count ? 'border-red-200 bg-red-50' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            สินเชื่อเกินกำหนด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {overdueLoansData?._count || 0}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            ยอดค้าง ฿{Number(overdueLoansData?._sum.balance || 0).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <PiggyBank className="h-4 w-4" />
                            คอมมิชชั่นรอจ่าย
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ฿{Number(pendingCommissions?._sum.amount || 0).toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {pendingCommissions?._count || 0} รายการ
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        แนวโน้มการชำระเงินรายเดือน
                    </CardTitle>
                    <CardDescription>
                        6 เดือนล่าสุด
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end justify-between gap-4 h-48">
                        {monthlyPayments.map((month, idx) => {
                            const height = maxMonthlyPayment > 0
                                ? (month.total / maxMonthlyPayment * 100)
                                : 0
                            const isCurrentMonth = idx === monthlyPayments.length - 1

                            return (
                                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="text-sm font-medium">
                                        ฿{(month.total / 1000).toFixed(0)}k
                                    </div>
                                    <div className="w-full bg-muted rounded-t-lg flex items-end" style={{ height: '140px' }}>
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'bg-primary' : 'bg-primary/60'
                                                }`}
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">{month.month}</div>
                                    <div className="text-xs text-muted-foreground">{month.count} รายการ</div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Loan Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            สรุปสินเชื่อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">กำลังผ่อนชำระ</p>
                                <p className="text-xl font-bold text-blue-600">{activeLoansData?._count || 0} รายการ</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
                                <p className="font-bold">฿{Number(activeLoansData?._sum.balance || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">ชำระครบแล้ว</p>
                                <p className="text-xl font-bold text-green-600">{paidLoansData?._count || 0} รายการ</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">ยอดรวม</p>
                                <p className="font-bold">฿{Number(paidLoansData?._sum.principal || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {(overdueLoansData?._count || 0) > 0 && (
                            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                <div>
                                    <p className="text-sm text-muted-foreground">เกินกำหนดชำระ</p>
                                    <p className="text-xl font-bold text-red-600">{overdueLoansData?._count || 0} รายการ</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">ยอดค้าง</p>
                                    <p className="font-bold text-red-600">฿{Number(overdueLoansData?._sum.balance || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Commission Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            สรุปค่าคอมมิชชั่น
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">รอดำเนินการ</p>
                                <p className="text-xl font-bold text-orange-600">{pendingCommissions?._count || 0} รายการ</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">฿{Number(pendingCommissions?._sum.amount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">รออนุมัติจ่าย</p>
                                <p className="text-xl font-bold text-blue-600">{approvedCommissions?._count || 0} รายการ</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">฿{Number(approvedCommissions?._sum.amount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">จ่ายแล้ว</p>
                                <p className="text-xl font-bold text-green-600">{paidCommissions?._count || 0} รายการ</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">฿{Number(paidCommissions?._sum.amount || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Payments */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">การชำระเงินล่าสุด</CardTitle>
                            <CardDescription>10 รายการล่าสุด</CardDescription>
                        </div>
                        <Link href="/dashboard/finance/payments">
                            <Button variant="outline" size="sm">ดูทั้งหมด</Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {recentPayments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            ยังไม่มีการชำระเงิน
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentPayments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium text-sm">
                                            {payment.loan?.worker?.firstNameTH} {payment.loan?.worker?.lastNameTH}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {payment.loan?.loanId} • {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">
                                            +฿{Number(payment.amount).toLocaleString()}
                                        </p>
                                        <Badge variant="secondary" className="text-xs">
                                            {payment.method}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
