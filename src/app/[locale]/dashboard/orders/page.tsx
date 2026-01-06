import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    ShoppingCart,
    Plus,
    Building2,
    Users,
    Calendar,
    DollarSign,
    FileText,
    Check,
    Clock,
    XCircle,
    Send,
} from 'lucide-react'

export default async function OrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const params = await searchParams

    const where: any = {}
    if (params.status && params.status !== 'ALL') {
        where.status = params.status
    }

    const orders = await prisma.order.findMany({
        where,
        include: {
            client: { select: { clientId: true, companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: orders.length,
        draft: orders.filter(o => o.status === 'DRAFT').length,
        quoted: orders.filter(o => o.status === 'QUOTED').length,
        approved: orders.filter(o => o.status === 'APPROVED').length,
        deploying: orders.filter(o => o.status === 'DEPLOYING').length,
        completed: orders.filter(o => o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED').length,
        totalWorkers: orders.reduce((sum, o) => sum + o.requestedCount, 0),
        totalValue: orders
            .filter(o => o.totalPrice)
            .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0),
    }

    const statusColors: Record<string, string> = {
        DRAFT: 'bg-gray-100 text-gray-800',
        QUOTED: 'bg-blue-100 text-blue-800',
        APPROVED: 'bg-green-100 text-green-800',
        DEPLOYING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-emerald-100 text-emerald-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    const statusLabels: Record<string, string> = {
        DRAFT: 'แบบร่าง',
        QUOTED: 'เสนอราคา',
        APPROVED: 'อนุมัติ',
        DEPLOYING: 'กำลังส่งตัว',
        COMPLETED: 'เสร็จสิ้น',
        CANCELLED: 'ยกเลิก',
    }

    const statusIcons: Record<string, React.ReactNode> = {
        DRAFT: <FileText className="h-4 w-4" />,
        QUOTED: <DollarSign className="h-4 w-4" />,
        APPROVED: <Check className="h-4 w-4" />,
        DEPLOYING: <Send className="h-4 w-4" />,
        COMPLETED: <Check className="h-4 w-4" />,
        CANCELLED: <XCircle className="h-4 w-4" />,
    }

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6" />
                        รายการสั่งแรงงาน
                    </h1>
                    <p className="text-muted-foreground">
                        จัดการออเดอร์จากลูกค้าและติดตามการส่งตัวแรงงาน
                    </p>
                </div>
                <Link href="/dashboard/orders/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        สร้างออเดอร์
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ออเดอร์ทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            รอดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.quoted + stats.approved}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Send className="h-4 w-4" />
                            กำลังส่งตัว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.deploying}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            เสร็จสิ้น
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            แรงงานทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalWorkers} คน</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            มูลค่ารวม
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-primary">
                            {formatMoney(stats.totalValue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="py-4">
                    <form method="GET" className="flex items-center gap-4">
                        <select
                            name="status"
                            defaultValue={params.status || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="DRAFT">แบบร่าง</option>
                            <option value="QUOTED">เสนอราคา</option>
                            <option value="APPROVED">อนุมัติ</option>
                            <option value="DEPLOYING">กำลังส่งตัว</option>
                            <option value="COMPLETED">เสร็จสิ้น</option>
                            <option value="CANCELLED">ยกเลิก</option>
                        </select>
                        <Button type="submit">กรอง</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    {orders.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่มีออเดอร์</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">ออเดอร์</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">ลูกค้า</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">จำนวน</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วันเริ่มงาน</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">มูลค่า</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-mono text-sm font-medium">{order.orderId}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dashboard/clients/${order.clientId}`}
                                                    className="hover:text-primary"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm">{order.client.companyName}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {order.client.clientId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{order.requestedCount}</span>
                                                    <span className="text-muted-foreground">คน</span>
                                                </div>
                                                {order.gender && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {order.gender === 'MALE' ? '👨 ชาย' : order.gender === 'FEMALE' ? '👩 หญิง' : ''}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {format(new Date(order.startDate), 'dd MMM yyyy', { locale: th })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {order.totalPrice ? (
                                                    <span className="font-medium text-primary">
                                                        {formatMoney(Number(order.totalPrice))}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={statusColors[order.status]}>
                                                    {statusIcons[order.status]}
                                                    <span className="ml-1">{statusLabels[order.status]}</span>
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link href={`/dashboard/orders/${order.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        ดูรายละเอียด
                                                    </Button>
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

            {/* Order Flow Info */}
            <Card>
                <CardContent className="py-4">
                    <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-2">ขั้นตอนการดำเนินการออเดอร์:</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={statusColors.DRAFT}>แบบร่าง</Badge>
                            <span>→</span>
                            <Badge className={statusColors.QUOTED}>เสนอราคา</Badge>
                            <span>→</span>
                            <Badge className={statusColors.APPROVED}>อนุมัติ</Badge>
                            <span>→</span>
                            <Badge className={statusColors.DEPLOYING}>กำลังส่งตัว</Badge>
                            <span>→</span>
                            <Badge className={statusColors.COMPLETED}>เสร็จสิ้น</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
