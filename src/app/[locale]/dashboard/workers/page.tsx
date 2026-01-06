import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Plus, Search, LayoutGrid, Users, CheckCircle2, FlaskConical, Briefcase } from 'lucide-react'
import WorkerTable from '@/components/workers/WorkerTable'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function WorkersPage(props: {
    searchParams: Promise<{ search?: string; status?: string }>
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

    if (searchParams.status && searchParams.status !== 'image/png') { // Fix for weird ghost param if any
        where.status = searchParams.status
    }

    const workers = await prisma.worker.findMany({
        where,
        include: {
            createdBy: { select: { name: true } },
            agent: { select: { companyName: true } },
            client: { select: { companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const stats = {
        total: await prisma.worker.count(),
        newLead: await prisma.worker.count({ where: { status: 'NEW_LEAD' } }),
        working: await prisma.worker.count({ where: { status: 'WORKING' } }),
        ready: await prisma.worker.count({ where: { status: 'READY' } }),
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
                    label="รายชื่อใหม่"
                    value={stats.newLead}
                    icon={<FlaskConical className="w-6 h-6 text-white" />}
                    color="bg-gray-500"
                />
                <StatCard
                    label="พร้อมทำงาน"
                    value={stats.ready}
                    icon={<CheckCircle2 className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                />
                <StatCard
                    label="กำลังทำงาน"
                    value={stats.working}
                    icon={<Briefcase className="w-6 h-6 text-white" />}
                    color="bg-purple-500"
                />
            </div>

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
                            <NativeSelectWrapper
                                name="status"
                                defaultValue={searchParams.status}
                            />
                        </div>
                        <Button type="submit">
                            ค้นหา
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Worker Table */}
            <Card>
                <CardContent className="p-0">
                    <WorkerTable workers={workers} />
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

// Helper for select to work with server-side form submission
function NativeSelectWrapper({ name, defaultValue }: { name: string, defaultValue?: string }) {
    return (
        <div className="relative">
            <select
                name={name}
                defaultValue={defaultValue}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            >
                <option value="">สถานะทั้งหมด</option>
                <option value="NEW_LEAD">รายชื่อใหม่</option>
                <option value="SCREENING">รอตรวจสอบ</option>
                <option value="PROCESSING">กำลังดำเนินการ</option>
                <option value="ACADEMY">ฝึกอบรม</option>
                <option value="READY">พร้อมส่งตัว</option>
                <option value="DEPLOYED">ส่งตัวแล้ว</option>
                <option value="WORKING">กำลังทำงาน</option>
                <option value="COMPLETED">สิ้นสุดสัญญา</option>
                <option value="TERMINATED">เลิกจ้าง</option>
                <option value="REJECTED">ปฏิเสธ</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    )
}
