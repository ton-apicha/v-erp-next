import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Search,
  Plus,
} from 'lucide-react'

export default async function FinancePage() {
  const session = await getServerSession(authOptions)

  // Get loan statistics
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

  // Get pending commissions
  const pendingCommissions = await prisma.commission.findMany({
    where: { status: 'PENDING' },
    include: {
      agent: { select: { agentId: true, companyName: true } },
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  const totalPendingCommission = pendingCommissions.reduce(
    (sum, c) => sum + Number(c.amount || 0),
    0
  )

  // Get payroll files
  const recentPayrollFiles = await prisma.payrollFile.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ศูนย์การเงิน</h1>
          <p className="text-muted-foreground">จัดการเงินกู้ ชำระเงิน และค่าคอมมิชชั่น</p>
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
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              ค่าคอมมิชชั่นรออนุมัติ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{totalPendingCommission.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingCommissions.length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Payroll Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPayrollFiles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ล่าสุด: {recentPayrollFiles[0]
                ? format(new Date(recentPayrollFiles[0].createdAt), 'dd/MM/yyyy')
                : '-'}
            </p>
          </CardContent>
        </Card>
      </div>

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

      {/* Commissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">ค่าคอมมิชชั่นรออนุมัติ</CardTitle>
              <CardDescription>ค่าคอมมิชชั่นตัวแทนที่รอดำเนินการ</CardDescription>
            </div>
            <Link href="/dashboard/finance/commissions">
              <Button variant="outline" size="sm">ดูทั้งหมด</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {pendingCommissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>ไม่มีค่าคอมมิชชั่นรออนุมัติ</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="py-2">รหัสตัวแทน</th>
                    <th className="py-2">บริษัท</th>
                    <th className="py-2">ประเภท</th>
                    <th className="py-2 text-right">จำนวน</th>
                    <th className="py-2 text-right">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCommissions.map((commission) => (
                    <tr key={commission.id} className="border-b">
                      <td className="py-3 font-mono text-sm">{commission.agent.agentId}</td>
                      <td className="py-3">{commission.agent.companyName}</td>
                      <td className="py-3">
                        <Badge variant="outline">{commission.type}</Badge>
                      </td>
                      <td className="py-3 text-right font-medium">
                        ฿{Number(commission.amount).toLocaleString()}
                      </td>
                      <td className="py-3 text-right text-sm text-muted-foreground">
                        {format(new Date(commission.createdAt), 'dd/MM/yyyy')}
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
