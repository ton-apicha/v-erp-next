// =====================================================
// Workers List Page - Updated with Document Tags
// =====================================================

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Link } from '@/i18n/routing'
import { Plus, Search, LayoutGrid, Users, CheckCircle2, Briefcase, Clock, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

// Status colors and labels (matches Prisma WorkerStatus enum)
const statusConfig: Record<string, { label: string; color: string }> = {
    NEW: { label: 'ใหม่', color: 'bg-gray-100 text-gray-800' },
    DOCUMENTING: { label: 'กำลังทำเอกสาร', color: 'bg-yellow-100 text-yellow-800' },
    TRAINING: { label: 'กำลังฝึกอบรม', color: 'bg-blue-100 text-blue-800' },
    READY: { label: 'พร้อมส่งตัว', color: 'bg-green-100 text-green-800' },
    DEPLOYED: { label: 'ส่งตัวแล้ว', color: 'bg-purple-100 text-purple-800' },
    WORKING: { label: 'กำลังทำงาน', color: 'bg-indigo-100 text-indigo-800' },
    COMPLETED: { label: 'ครบสัญญา', color: 'bg-teal-100 text-teal-800' },
    TERMINATED: { label: 'ยกเลิก', color: 'bg-red-100 text-red-800' },
    RETURNED: { label: 'กลับประเทศ', color: 'bg-orange-100 text-orange-800' },
}

export default async function WorkersPage(props: {
    searchParams: Promise<{
        search?: string
        status?: string
        hasPassport?: string
        hasVisa?: string
        hasWorkPermit?: string
    }>
}) {
    const searchParams = await props.searchParams
    const session = await getServerSession(authOptions)

    // Build query
    const where: any = {}

    if (searchParams.search) {
        where.OR = [
            { workerId: { contains: searchParams.search, mode: 'insensitive' } },
            { firstNameTH: { contains: searchParams.search, mode: 'insensitive' } },
            { lastNameTH: { contains: searchParams.search, mode: 'insensitive' } },
            { phoneNumber: { contains: searchParams.search, mode: 'insensitive' } },
        ]
    }

    if (searchParams.status) {
        where.status = searchParams.status
    }

    // Document tag filters
    if (searchParams.hasPassport === 'true') where.hasPassport = true
    if (searchParams.hasVisa === 'true') where.hasVisa = true
    if (searchParams.hasWorkPermit === 'true') where.hasWorkPermit = true

    const workers = await prisma.worker.findMany({
        where,
        include: {
            createdBy: { select: { name: true } },
            partner: { select: { name: true } },
            client: { select: { companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    const stats = {
        total: await prisma.worker.count(),
        newWorkers: await prisma.worker.count({ where: { status: 'NEW' } }),
        ready: await prisma.worker.count({ where: { status: 'READY' } }),
        working: await prisma.worker.count({ where: { status: 'WORKING' } }),
        // Document completeness
        withPassport: await prisma.worker.count({ where: { hasPassport: true } }),
        withVisa: await prisma.worker.count({ where: { hasVisa: true } }),
        withWorkPermit: await prisma.worker.count({ where: { hasWorkPermit: true } }),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">แรงงาน</h1>
                    <p className="text-muted-foreground">จัดการข้อมูลแรงงานทั้งหมด</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/workers/pipeline">
                        <Button variant="outline">
                            <LayoutGrid className="w-4 h-4 mr-2" />
                            Pipeline
                        </Button>
                    </Link>
                    <Link href="/dashboard/workers/new">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            เพิ่มแรงงาน
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    label="ทั้งหมด"
                    value={stats.total}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                />
                <StatCard
                    label="รายใหม่"
                    value={stats.newWorkers}
                    icon={<Clock className="w-6 h-6 text-white" />}
                    color="bg-gray-500"
                />
                <StatCard
                    label="พร้อมส่งตัว"
                    value={stats.ready}
                    icon={<CheckCircle2 className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                />
                <StatCard
                    label="กำลังทำงาน"
                    value={stats.working}
                    icon={<Briefcase className="w-6 h-6 text-white" />}
                    color="bg-indigo-500"
                />
            </div>

            {/* Document Tags Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        สถานะเอกสาร
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Link href={`?hasPassport=true${searchParams.status ? `&status=${searchParams.status}` : ''}`}>
                            <Badge variant="outline" className={`cursor-pointer hover:bg-primary/10 ${searchParams.hasPassport === 'true' ? 'bg-primary/20 border-primary' : ''}`}>
                                มี Passport: {stats.withPassport}
                            </Badge>
                        </Link>
                        <Link href={`?hasVisa=true${searchParams.status ? `&status=${searchParams.status}` : ''}`}>
                            <Badge variant="outline" className={`cursor-pointer hover:bg-primary/10 ${searchParams.hasVisa === 'true' ? 'bg-primary/20 border-primary' : ''}`}>
                                มี Visa: {stats.withVisa}
                            </Badge>
                        </Link>
                        <Link href={`?hasWorkPermit=true${searchParams.status ? `&status=${searchParams.status}` : ''}`}>
                            <Badge variant="outline" className={`cursor-pointer hover:bg-primary/10 ${searchParams.hasWorkPermit === 'true' ? 'bg-primary/20 border-primary' : ''}`}>
                                มีใบอนุญาต: {stats.withWorkPermit}
                            </Badge>
                        </Link>
                        {(searchParams.hasPassport || searchParams.hasVisa || searchParams.hasWorkPermit) && (
                            <Link href={`?${searchParams.status ? `status=${searchParams.status}` : ''}`}>
                                <Badge variant="secondary" className="cursor-pointer">
                                    ล้างตัวกรอง
                                </Badge>
                            </Link>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Search & Filter */}
            <Card>
                <CardContent className="p-4">
                    <form method="GET" className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    name="search"
                                    placeholder="ค้นหาด้วย รหัส, ชื่อ, เบอร์โทร..."
                                    defaultValue={searchParams.search}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-48">
                            <select
                                name="status"
                                defaultValue={searchParams.status}
                                className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="">สถานะทั้งหมด</option>
                                <option value="NEW">ใหม่</option>
                                <option value="DOCUMENTING">กำลังทำเอกสาร</option>
                                <option value="TRAINING">กำลังฝึกอบรม</option>
                                <option value="READY">พร้อมส่งตัว</option>
                                <option value="DEPLOYED">ส่งตัวแล้ว</option>
                                <option value="WORKING">กำลังทำงาน</option>
                                <option value="COMPLETED">ครบสัญญา</option>
                                <option value="TERMINATED">ยกเลิก</option>
                                <option value="RETURNED">กลับประเทศ</option>
                            </select>
                        </div>
                        <Button type="submit">
                            ค้นหา
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Worker List */}
            <Card>
                <CardContent className="p-0">
                    {workers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>ไม่พบข้อมูลแรงงาน</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium">รหัส/ชื่อ</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">โทร</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">เอกสาร</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">พาร์ทเนอร์</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium">นายจ้าง</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium">สถานะ</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium">วันที่สร้าง</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workers.map((worker) => (
                                        <tr key={worker.id} className="border-b hover:bg-muted/30">
                                            <td className="py-3 px-4">
                                                <Link href={`/dashboard/workers/${worker.id}`} className="hover:text-primary">
                                                    <p className="font-medium">{worker.firstNameTH} {worker.lastNameTH}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{worker.workerId}</p>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{worker.phoneNumber || '-'}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center gap-1">
                                                    {worker.hasPassport && <Badge variant="secondary" className="text-xs">PP</Badge>}
                                                    {worker.hasVisa && <Badge variant="secondary" className="text-xs">V</Badge>}
                                                    {worker.hasWorkPermit && <Badge variant="secondary" className="text-xs">WP</Badge>}
                                                    {!worker.hasPassport && !worker.hasVisa && !worker.hasWorkPermit && (
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{worker.partner?.name || '-'}</td>
                                            <td className="py-3 px-4 text-sm">{worker.client?.companyName || '-'}</td>
                                            <td className="py-3 px-4 text-center">
                                                <Badge className={statusConfig[worker.status]?.color || 'bg-gray-100'}>
                                                    {statusConfig[worker.status]?.label || worker.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                                                {format(new Date(worker.createdAt), 'dd/MM/yy')}
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

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{label}</p>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}
