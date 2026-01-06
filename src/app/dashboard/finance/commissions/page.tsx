import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, TrendingUp, Check, X } from 'lucide-react'
import { approveCommission, markCommissionPaid } from '@/actions/finance'

export default async function CommissionsPage(props: {
    searchParams: Promise<{ status?: string }>
}) {
    const searchParams = await props.searchParams

    const where: any = {}
    if (searchParams.status && searchParams.status !== 'ALL') {
        where.status = searchParams.status
    }

    const commissions = await prisma.commission.findMany({
        where,
        include: {
            agent: { select: { agentId: true, companyName: true } },
            calculatedBy: { select: { name: true } },
            approvedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: commissions.length,
        pending: commissions.filter((c) => c.status === 'PENDING').length,
        approved: commissions.filter((c) => c.status === 'APPROVED').length,
        paid: commissions.filter((c) => c.status === 'PAID').length,
        totalPending: commissions
            .filter((c) => c.status === 'PENDING')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0),
        totalApproved: commissions
            .filter((c) => c.status === 'APPROVED')
            .reduce((sum, c) => sum + Number(c.amount || 0), 0),
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-blue-100 text-blue-800',
        PAID: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusLabels: Record<string, string> = {
        PENDING: 'รออนุมัติ',
        APPROVED: 'อนุมัติแล้ว',
        PAID: 'จ่ายแล้ว',
        CANCELLED: 'ยกเลิก',
    }

    const typeLabels: Record<string, string> = {
        RECRUITMENT: 'ค่าจัดหา',
        MONTHLY: 'รายเดือน',
        BONUS: 'โบนัส',
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
                        <h1 className="text-2xl font-bold">ค่าคอมมิชชั่น</h1>
                        <p className="text-muted-foreground">จัดการค่าคอมมิชชั่นตัวแทน</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total} รายการ</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            รออนุมัติ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            ฿{stats.totalPending.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            อนุมัติแล้ว (รอจ่าย)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
                        <p className="text-xs text-muted-foreground">
                            ฿{stats.totalApproved.toLocaleString()}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            จ่ายแล้ว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="py-4">
                    <form method="GET" className="flex items-center gap-4">
                        <select
                            name="status"
                            defaultValue={searchParams.status || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="PENDING">รออนุมัติ</option>
                            <option value="APPROVED">อนุมัติแล้ว</option>
                            <option value="PAID">จ่ายแล้ว</option>
                            <option value="CANCELLED">ยกเลิก</option>
                        </select>
                        <Button type="submit">กรอง</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Commissions Table */}
            <Card>
                <CardContent className="p-0">
                    {commissions.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบข้อมูลค่าคอมมิชชั่น</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">ตัวแทน</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">ประเภท</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">จำนวน</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วันที่</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {commissions.map((commission) => (
                                        <tr key={commission.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dashboard/agents/${commission.agentId}`}
                                                    className="hover:text-primary"
                                                >
                                                    <p className="font-medium text-sm">{commission.agent.companyName}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        {commission.agent.agentId}
                                                    </p>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">
                                                    {typeLabels[commission.type] || commission.type}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                ฿{Number(commission.amount).toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={statusColors[commission.status]}>
                                                    {statusLabels[commission.status] || commission.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-muted-foreground">
                                                {format(new Date(commission.createdAt), 'dd/MM/yyyy')}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {commission.status === 'PENDING' && (
                                                    <form
                                                        action={async () => {
                                                            'use server'
                                                            await approveCommission(commission.id)
                                                            revalidatePath('/dashboard/finance/commissions')
                                                        }}
                                                    >
                                                        <Button variant="outline" size="sm" type="submit">
                                                            <Check className="h-3 w-3 mr-1" />
                                                            อนุมัติ
                                                        </Button>
                                                    </form>
                                                )}
                                                {commission.status === 'APPROVED' && (
                                                    <form
                                                        action={async () => {
                                                            'use server'
                                                            await markCommissionPaid(commission.id, new Date())
                                                            revalidatePath('/dashboard/finance/commissions')
                                                        }}
                                                    >
                                                        <Button variant="default" size="sm" type="submit">
                                                            จ่ายแล้ว
                                                        </Button>
                                                    </form>
                                                )}
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
