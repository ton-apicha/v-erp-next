// =====================================================
// Finance Dashboard - Simplified Version
// Commission/PayrollFile models are being redesigned
// =====================================================

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FinanceCharts from '@/components/dashboard/FinanceCharts'
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  ArrowDownRight,
  Wallet,
  Plus,
} from 'lucide-react'

export default async function FinancePage() {
  const session = await getServerSession(authOptions)

  // Get loan statistics (Loan model still exists)
  const loans = await prisma.loan.findMany({
    where: { status: { not: 'CANCELLED' } },
    include: {
      worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
    },
  })

  const loanStats = {
    total: loans.length,
    active: loans.filter((l) => l.status === 'ACTIVE').length,
    overdue: loans.filter((l) => l.status === 'OVERDUE').length,
    paidOff: loans.filter((l) => l.status === 'PAID_OFF').length,
    totalOutstanding: loans
      .filter((l) => ['ACTIVE', 'OVERDUE'].includes(l.status))
      .reduce((sum, l) => sum + Number(l.balance || 0), 0),
  }

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    take: 5,
    orderBy: { paidAt: 'desc' },
    include: {
      loan: {
        include: {
          worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ศูนย์การเงิน</h1>
          <p className="text-muted-foreground">จัดการเงินกู้และชำระเงิน</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/finance/loans/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              สร้างสินเชื่อ
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              ยอดค้างชำระรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{loanStats.totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              จาก {loanStats.active + loanStats.overdue} รายการ
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
            <div className="text-2xl font-bold">{loanStats.total}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs">{loanStats.active} Active</Badge>
              {loanStats.overdue > 0 && (
                <Badge variant="destructive" className="text-xs">{loanStats.overdue} Overdue</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ค่าคอมมิชชั่น
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              อยู่ระหว่างการพัฒนา
            </div>
            <Link href="/dashboard/finance/commissions">
              <Button variant="link" size="sm" className="px-0">ดูรายละเอียด</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              ชำระแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{loanStats.paidOff}</div>
            <p className="text-xs text-muted-foreground mt-1">รายการ</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <FinanceCharts loanStats={loanStats} />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Loans Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">สินเชื่อ/เงินกู้</CardTitle>
                <CardDescription>รายการสินเชื่อล่าสุด</CardDescription>
              </div>
              <Link href="/dashboard/finance/loans">
                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {loans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีข้อมูลสินเชื่อ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {loans.slice(0, 5).map((loan) => (
                  <Link
                    key={loan.id}
                    href={`/dashboard/finance/loans/${loan.id}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium font-mono text-sm">{loan.loanId}</p>
                      <p className="text-xs text-muted-foreground">
                        {loan.worker.firstNameTH} {loan.worker.lastNameTH}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">฿{Number(loan.balance).toLocaleString()}</p>
                      <Badge
                        variant={
                          loan.status === 'PAID_OFF'
                            ? 'default'
                            : loan.status === 'OVERDUE'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-xs"
                      >
                        {loan.status === 'ACTIVE' ? 'กำลังผ่อน' :
                          loan.status === 'OVERDUE' ? 'ค้างชำระ' :
                            loan.status === 'PAID_OFF' ? 'ชำระแล้ว' : loan.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">การชำระเงินล่าสุด</CardTitle>
                <CardDescription>รายการชำระเงินย้อนหลัง</CardDescription>
              </div>
              <Link href="/dashboard/finance/payments">
                <Button variant="outline" size="sm">ดูทั้งหมด</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>ยังไม่มีการชำระเงิน</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {payment.loan.worker.firstNameTH} {payment.loan.worker.lastNameTH}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.paidAt), 'dd/MM/yyyy HH:mm', { locale: th })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +฿{Number(payment.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
