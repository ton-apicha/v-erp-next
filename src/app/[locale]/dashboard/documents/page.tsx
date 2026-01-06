import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    FileText,
    Search,
    Filter,
    Download,
    Eye,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    User,
    Building2,
    Handshake,
} from 'lucide-react'

export default async function DocumentsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; status?: string; search?: string }>
}) {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const params = await searchParams

    const where: any = {}

    if (params.type && params.type !== 'ALL') {
        where.type = params.type
    }

    if (params.status && params.status !== 'ALL') {
        where.status = params.status
    }

    if (params.search) {
        where.OR = [
            { title: { contains: params.search, mode: 'insensitive' } },
            { fileName: { contains: params.search, mode: 'insensitive' } },
        ]
    }

    const documents = await prisma.document.findMany({
        where,
        include: {
            worker: { select: { workerId: true, firstNameTH: true, lastNameTH: true } },
            agent: { select: { agentId: true, companyName: true } },
            client: { select: { clientId: true, companyName: true } },
            uploadedBy: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    // Get expiring documents (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringDocs = documents.filter(doc =>
        doc.expiryDate && new Date(doc.expiryDate) <= thirtyDaysFromNow && new Date(doc.expiryDate) > new Date()
    )

    const expiredDocs = documents.filter(doc =>
        doc.expiryDate && new Date(doc.expiryDate) <= new Date()
    )

    const stats = {
        total: documents.length,
        expiring: expiringDocs.length,
        expired: expiredDocs.length,
        pending: documents.filter(d => d.status === 'PENDING').length,
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        EXPIRED: 'bg-gray-100 text-gray-800',
    }

    const typeIcons: Record<string, React.ReactNode> = {
        WORKER_DOC: <User className="h-4 w-4" />,
        AGENT_DOC: <Handshake className="h-4 w-4" />,
        CLIENT_DOC: <Building2 className="h-4 w-4" />,
        SYSTEM_DOC: <FileText className="h-4 w-4" />,
    }

    const getEntityLink = (doc: any) => {
        if (doc.workerId && doc.worker) {
            return { href: `/dashboard/workers/${doc.workerId}`, label: `${doc.worker.firstNameTH} ${doc.worker.lastNameTH}`, id: doc.worker.workerId }
        }
        if (doc.agentId && doc.agent) {
            return { href: `/dashboard/agents/${doc.agentId}`, label: doc.agent.companyName, id: doc.agent.agentId }
        }
        if (doc.clientId && doc.client) {
            return { href: `/dashboard/clients/${doc.clientId}`, label: doc.client.companyName, id: doc.client.clientId }
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        เอกสารทั้งหมด
                    </h1>
                    <p className="text-muted-foreground">
                        จัดการเอกสารของแรงงาน ตัวแทน และนายจ้าง
                    </p>
                </div>
            </div>

            {/* Alert: Expiring Documents */}
            {(stats.expiring > 0 || stats.expired > 0) && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-orange-500" />
                            <div>
                                <p className="font-medium text-orange-700 dark:text-orange-300">
                                    แจ้งเตือนเอกสาร
                                </p>
                                <p className="text-sm text-orange-600 dark:text-orange-400">
                                    {stats.expired > 0 && `มี ${stats.expired} เอกสารหมดอายุแล้ว • `}
                                    {stats.expiring > 0 && `มี ${stats.expiring} เอกสารจะหมดอายุใน 30 วัน`}
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
                            เอกสารทั้งหมด
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            รอตรวจสอบ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card className={stats.expiring > 0 ? 'border-orange-300' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            ใกล้หมดอายุ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
                    </CardContent>
                </Card>
                <Card className={stats.expired > 0 ? 'border-red-300' : ''}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            หมดอายุแล้ว
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <Card>
                <CardContent className="py-4">
                    <form method="GET" className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="search"
                                placeholder="ค้นหาเอกสาร..."
                                defaultValue={params.search}
                                className="pl-9"
                            />
                        </div>
                        <select
                            name="type"
                            defaultValue={params.type || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกประเภท</option>
                            <option value="WORKER_DOC">เอกสารแรงงาน</option>
                            <option value="AGENT_DOC">เอกสารตัวแทน</option>
                            <option value="CLIENT_DOC">เอกสารนายจ้าง</option>
                        </select>
                        <select
                            name="status"
                            defaultValue={params.status || 'ALL'}
                            className="h-10 px-3 border rounded-md text-sm"
                        >
                            <option value="ALL">ทุกสถานะ</option>
                            <option value="PENDING">รอตรวจสอบ</option>
                            <option value="APPROVED">อนุมัติ</option>
                            <option value="REJECTED">ปฏิเสธ</option>
                            <option value="EXPIRED">หมดอายุ</option>
                        </select>
                        <Button type="submit">
                            <Filter className="h-4 w-4 mr-2" />
                            กรอง
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Documents Table */}
            <Card>
                <CardContent className="p-0">
                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบเอกสาร</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">เอกสาร</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">ประเภท</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">เจ้าของ</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">วันหมดอายุ</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {documents.map((doc) => {
                                        const entity = getEntityLink(doc)
                                        const isExpired = doc.expiryDate && new Date(doc.expiryDate) <= new Date()
                                        const isExpiring = doc.expiryDate && !isExpired && new Date(doc.expiryDate) <= thirtyDaysFromNow

                                        return (
                                            <tr key={doc.id} className="border-b hover:bg-muted/30">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium text-sm">{doc.title || doc.fileName}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">{doc.documentId}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        {typeIcons[doc.type]}
                                                        <span className="text-sm">{doc.category || doc.type}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {entity ? (
                                                        <Link href={entity.href} className="hover:text-primary">
                                                            <p className="text-sm">{entity.label}</p>
                                                            <p className="text-xs text-muted-foreground font-mono">{entity.id}</p>
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <Badge className={statusColors[doc.status]}>
                                                        {doc.status === 'PENDING' ? 'รอตรวจสอบ' :
                                                            doc.status === 'APPROVED' ? 'อนุมัติ' :
                                                                doc.status === 'REJECTED' ? 'ปฏิเสธ' : doc.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    {doc.expiryDate ? (
                                                        <span className={`text-sm ${isExpired ? 'text-red-600 font-medium' : isExpiring ? 'text-orange-600' : ''}`}>
                                                            {isExpired && '⚠️ '}
                                                            {format(new Date(doc.expiryDate), 'dd/MM/yyyy')}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon" title="ดู">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="ดาวน์โหลด">
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
