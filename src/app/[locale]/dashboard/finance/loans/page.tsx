import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Link } from '@/i18n/routing'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    CreditCard,
    Plus,
    Search,
    AlertTriangle,
    CheckCircle,
    Clock,
    ArrowLeft,
} from 'lucide-react'

export default async function LoansPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>
}) {
    const session = await getServerSession(authOptions)
    const params = await searchParams
    const search = params.search || ''
    const statusFilter = params.status || 'all'

    const where: any = {}

    if (statusFilter !== 'all') {
        where.status = statusFilter
    }

    if (search) {
        where.OR = [
            { loanId: { contains: search, mode: 'insensitive' } },
            { worker: { firstNameTH: { contains: search, mode: 'insensitive' } } },
            { worker: { lastNameTH: { contains: search, mode: 'insensitive' } } },
        ]
    }

    const loans = await prisma.loan.findMany({
        where,
        include: {
            worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
            _count: { select: { payments: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    // Stats
    const allLoans = await prisma.loan.findMany({ where: { status: { not: 'CANCELLED' } } })
    const stats = {
        total: allLoans.length,
        active: allLoans.filter((l) => l.status === 'ACTIVE').length,
        overdue: allLoans.filter((l) => l.status === 'OVERDUE').length,
        paidOff: allLoans.filter((l) => l.status === 'PAID_OFF').length,
        totalOutstanding: allLoans
            .filter((l) => ['ACTIVE', 'OVERDUE'].includes(l.status))
            .reduce((sum, l) => sum + Number(l.balance), 0),
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default" className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />กำลังผ่อน</Badge>
            case 'OVERDUE':
                return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />ค้างชำระ</Badge>
            case 'PAID_OFF':
                return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />ชำระแล้ว</Badge>
            case 'CANCELLED':
                return <Badge variant="secondary">ยกเลิก</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/finance">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">สินเชื่อ/เงินกู้</h1>
                        <p className="text-muted-foreground">จัดการสินเชื่อและเงินกู้ของแรงงาน</p>
                    </div>
                </div>
                <Link href="/dashboard/finance/loans/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        สร้างสินเชื่อใหม่
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold">฿{stats.totalOutstanding.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">ยอดค้างชำระรวม</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">กำลังผ่อน</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                        <p className="text-xs text-muted-foreground">ค้างชำระ</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <div className="text-2xl font-bold text-green-600">{stats.paidOff}</div>
                        <p className="text-xs text-muted-foreground">ชำระแล้ว</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-4">
                    <form className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="ค้นหาด้วยรหัสสินเชื่อ หรือชื่อแรงงาน..."
                                defaultValue={search}
                                className="pl-10"
                            />
                        </div>
                        <select
                            name="status"
                            defaultValue={statusFilter}
                            className="border rounded-md px-3 py-2"
                        >
                            <option value="all">ทั้งหมด</option>
                            <option value="ACTIVE">กำลังผ่อน</option>
                            <option value="OVERDUE">ค้างชำระ</option>
                            <option value="PAID_OFF">ชำระแล้ว</option>
                        </select>
                        <Button type="submit">ค้นหา</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Loans Table */}
            <Card>
                <CardHeader>
                    <CardTitle>รายการสินเชื่อ ({loans.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loans.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>ไม่พบข้อมูลสินเชื่อ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-2">รหัสสินเชื่อ</th>
                                        <th className="text-left py-3 px-2">แรงงาน</th>
                                        <th className="text-right py-3 px-2">เงินต้น</th>
                                        <th className="text-right py-3 px-2">ยอดคงเหลือ</th>
                                        <th className="text-center py-3 px-2">ชำระแล้ว</th>
                                        <th className="text-center py-3 px-2">สถานะ</th>
                                        <th className="text-center py-3 px-2">วันครบกำหนด</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan) => (
                                        <tr key={loan.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-2">
                                                <Link
                                                    href={`/dashboard/finance/loans/${loan.id}`}
                                                    className="font-mono text-sm text-primary hover:underline"
                                                >
                                                    {loan.loanId}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-2">
                                                <div>
                                                    <p className="font-medium">
                                                        {loan.worker.firstNameTH} {loan.worker.lastNameTH}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {loan.worker.workerId}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 text-right font-medium">
                                                ฿{Number(loan.principal).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2 text-right font-medium">
                                                ฿{Number(loan.balance).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {loan._count.payments} ครั้ง
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {getStatusBadge(loan.status)}
                                            </td>
                                            <td className="py-3 px-2 text-center text-sm">
                                                {loan.dueDate
                                                    ? format(new Date(loan.dueDate), 'dd/MM/yyyy', { locale: th })
                                                    : '-'}
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
