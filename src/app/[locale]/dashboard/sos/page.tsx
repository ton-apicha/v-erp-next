import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    MapPin,
    Phone,
    User,
    XCircle,
    AlertCircle,
} from 'lucide-react'

export default async function SosAlertsPage({
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

    const alerts = await prisma.sosAlert.findMany({
        where,
        include: {
            worker: {
                select: {
                    workerId: true,
                    firstNameTH: true,
                    lastNameTH: true,
                    phoneNumber: true,
                    client: { select: { companyName: true } },
                },
            },
            resolvedBy: { select: { name: true } },
        },
        orderBy: [
            { status: 'asc' }, // OPEN first
            { createdAt: 'desc' },
        ],
    })

    const stats = {
        total: alerts.length,
        open: alerts.filter(a => a.status === 'OPEN').length,
        inProgress: alerts.filter(a => a.status === 'IN_PROGRESS').length,
        resolved: alerts.filter(a => a.status === 'RESOLVED').length,
    }

    const priorityColors: Record<string, string> = {
        CRITICAL: 'bg-red-500 text-white animate-pulse',
        HIGH: 'bg-orange-500 text-white',
        MEDIUM: 'bg-yellow-500 text-white',
        LOW: 'bg-blue-500 text-white',
    }

    const statusColors: Record<string, string> = {
        OPEN: 'bg-red-100 text-red-800 border-red-300',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        RESOLVED: 'bg-green-100 text-green-800 border-green-300',
    }

    const statusIcons: Record<string, React.ReactNode> = {
        OPEN: <AlertCircle className="h-4 w-4" />,
        IN_PROGRESS: <Clock className="h-4 w-4" />,
        RESOLVED: <CheckCircle className="h-4 w-4" />,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        SOS Alerts
                    </h1>
                    <p className="text-muted-foreground">
                        ระบบแจ้งเหตุฉุกเฉินจากแรงงาน
                    </p>
                </div>
            </div>

            {/* Urgent Alert Banner */}
            {stats.open > 0 && (
                <Card className="border-red-500 bg-red-50 dark:bg-red-950/30">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                <Bell className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="font-bold text-red-700 dark:text-red-300 text-lg">
                                    มี {stats.open} แจ้งเตือนรอดำเนินการ!
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    กรุณาตรวจสอบและดำเนินการโดยเร็ว
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            ทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className={stats.open > 0 ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            รอดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.open}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            กำลังดำเนินการ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            แก้ไขแล้ว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
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
                            <option value="OPEN">รอดำเนินการ</option>
                            <option value="IN_PROGRESS">กำลังดำเนินการ</option>
                            <option value="RESOLVED">แก้ไขแล้ว</option>
                        </select>
                        <Button type="submit">กรอง</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                            <p className="text-lg font-medium">ไม่มีการแจ้งเตือน</p>
                            <p className="text-sm">ระบบปลอดภัย ไม่มีเหตุฉุกเฉิน</p>
                        </CardContent>
                    </Card>
                ) : (
                    alerts.map((alert) => (
                        <Card
                            key={alert.id}
                            className={`transition-all ${alert.status === 'OPEN'
                                ? 'border-red-300 shadow-lg shadow-red-100 dark:shadow-red-950'
                                : ''
                                }`}
                        >
                            <CardContent className="py-4">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left: Alert Info */}
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${alert.status === 'OPEN' ? 'bg-red-100' :
                                            alert.status === 'IN_PROGRESS' ? 'bg-yellow-100' : 'bg-green-100'
                                            }`}>
                                            {statusIcons[alert.status]}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm text-muted-foreground">
                                                    {alert.alertId}
                                                </span>
                                                <Badge className={priorityColors[alert.priority]}>
                                                    {alert.priority}
                                                </Badge>
                                                <Badge variant="outline" className={statusColors[alert.status]}>
                                                    {alert.status === 'OPEN' ? 'รอดำเนินการ' :
                                                        alert.status === 'IN_PROGRESS' ? 'กำลังดำเนินการ' : 'แก้ไขแล้ว'}
                                                </Badge>
                                            </div>

                                            {/* Worker Info */}
                                            {alert.worker && (
                                                <div className="flex items-center gap-4 text-sm">
                                                    <Link
                                                        href={`/dashboard/workers/${alert.workerId}`}
                                                        className="flex items-center gap-1 hover:text-primary"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        {alert.worker.firstNameTH} {alert.worker.lastNameTH}
                                                    </Link>
                                                    {alert.worker.phoneNumber && (
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <Phone className="h-4 w-4" />
                                                            {alert.worker.phoneNumber}
                                                        </span>
                                                    )}
                                                    {alert.worker.client && (
                                                        <span className="text-muted-foreground">
                                                            @ {alert.worker.client.companyName}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Description */}
                                            {alert.description && (
                                                <p className="text-sm bg-muted p-2 rounded">
                                                    💬 {alert.description}
                                                </p>
                                            )}

                                            {/* Location */}
                                            {(alert.latitude && alert.longitude) && (
                                                <a
                                                    href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    <MapPin className="h-4 w-4" />
                                                    ดูตำแหน่งบน Google Maps
                                                </a>
                                            )}

                                            {/* Resolution */}
                                            {alert.resolution && (
                                                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                                                    <strong>การแก้ไข:</strong> {alert.resolution}
                                                    {alert.resolvedBy && (
                                                        <span className="text-muted-foreground ml-2">
                                                            — โดย {alert.resolvedBy.name}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Time & Actions */}
                                    <div className="text-right text-sm space-y-2">
                                        <p className="text-muted-foreground">
                                            {formatDistanceToNow(new Date(alert.createdAt), {
                                                addSuffix: true,
                                                locale: th
                                            })}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(alert.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </p>
                                        {alert.status !== 'RESOLVED' && (
                                            <Button size="sm" variant="outline" disabled>
                                                ดำเนินการ
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
