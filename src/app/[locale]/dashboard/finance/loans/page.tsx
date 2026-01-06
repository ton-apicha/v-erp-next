import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Filter, ArrowLeft, CreditCard } from 'lucide-react'

export default async function LoansPage(props: {
    searchParams: Promise<{ status?: string; search?: string }>
}) {
    const searchParams = await props.searchParams

    const where: any = {}

    if (searchParams.status && searchParams.status !== 'ALL') {
        where.status = searchParams.status
    }

    if (searchParams.search) {
        where.OR = [
            { loanId: { contains: searchParams.search, mode: 'insensitive' } },
            { worker: { firstNameTH: { contains: searchParams.search, mode: 'insensitive' } } },
            { worker: { lastNameTH: { contains: searchParams.search, mode: 'insensitive' } } },
        ]
    }

    const loans = await prisma.loan.findMany({
        where,
        include: {
            worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
            payments: { select: { id: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: loans.length,
        totalAmount: loans.reduce((sum, l) => sum + Number(l.principal || 0), 0),
        totalBalance: loans.reduce((sum, l) => sum + Number(l.balance || 0), 0),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/finance">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">สินเชื่อ/เงินกู้</h1>
                        <p className="text-muted-foreground">จัดการข้อมูลสินเชื่อแรงงาน</p>
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
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            จำนวนสินเชื่อ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total} รายการ</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ยอดสินเชื่อรวม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">฿{stats.totalAmount.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ยอดค้างชำระรวม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            ฿{stats.totalBalance.toLocaleString()}
                        </div>
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
                                placeholder="ค้นหา รหัส, ชื่อแรงงาน..."
                                defaultValue={searchParams.search}
                                className="pl-9"
                            />
                        </div>
                        <select
                            name="status"
                            defaultValue={searchParams.status || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="ACTIVE">กำลังผ่อน</option>
                            <option value="OVERDUE">ค้างชำระ</option>
                            <option value="PAID_OFF">ชำระแล้ว</option>
                            <option value="CANCELLED">ยกเลิก</option>
                        </select>
                        <Button type="submit">ค้นหา</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Loans Table */}
            <Card>
                <CardContent className="p-0">
                    {loans.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบข้อมูลสินเชื่อ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">รหัสสินเชื่อ</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">แรงงาน</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">ยอดกู้</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วันที่สร้าง</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loans.map((loan) => (
                                        <tr key={loan.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-sm">{loan.loanId}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dashboard/workers/${loan.workerId}`}
                                                    className="hover:text-primary"
                                                >
                                                    <p className="font-medium text-sm">
                                                        {loan.worker.firstNameTH} {loan.worker.lastNameTH}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {loan.worker.workerId}
                                                    </p>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                ฿{Number(loan.principal).toLocaleString()}
                                            </td>

                                            <td className="py-3 px-4 text-center">
                                                <Badge
                                                    variant={
                                                        loan.status === 'PAID_OFF'
                                                            ? 'default'
                                                            : loan.status === 'OVERDUE'
                                                                ? 'destructive'
                                                                : loan.status === 'CANCELLED'
                                                                    ? 'outline'
                                                                    : 'secondary'
                                                    }
                                                >
                                                    {loan.status === 'ACTIVE' ? 'กำลังผ่อน' :
                                                        loan.status === 'OVERDUE' ? 'ค้างชำระ' :
                                                            loan.status === 'PAID_OFF' ? 'ชำระแล้ว' :
                                                                loan.status === 'CANCELLED' ? 'ยกเลิก' : loan.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                                                {format(new Date(loan.createdAt), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/dashboard/finance/loans/${loan.id}`}>
                                                    <Button variant="ghost" size="sm">ดู</Button>
                                                </Link>
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
