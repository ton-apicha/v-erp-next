import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Plus, Search, LayoutGrid } from 'lucide-react'
import WorkerTable from '@/components/workers/WorkerTable'

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

    if (searchParams.status) {
        where.status = searchParams.status
    }

    const workers = await prisma.worker.findMany({
        where,
        include: {
            createdBy: {
                select: { name: true },
            },
            agent: {
                select: { companyName: true },
            },
            client: {
                select: { companyName: true },
            },
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
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">แรงงาน</h1>
                    <p className="text-gray-600">จัดการข้อมูลแรงงานทั้งหมด</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/dashboard/workers/pipeline" className="btn btn-secondary flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5" />
                        Pipeline
                    </Link>
                    <Link href="/dashboard/workers/new" className="btn btn-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        เพิ่มแรงงาน
                    </Link>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="ทั้งหมด" value={stats.total} color="bg-blue-500" />
                <StatCard label="รายชื่อใหม่" value={stats.newLead} color="bg-gray-500" />
                <StatCard label="พร้อมทำงาน" value={stats.ready} color="bg-green-500" />
                <StatCard label="กำลังทำงาน" value={stats.working} color="bg-purple-500" />
            </div>

            {/* Search & Filter */}
            <div className="card mb-6">
                <form method="GET" className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                placeholder="ค้นหาด้วย รหัส, ชื่อ, เบอร์โทร..."
                                defaultValue={searchParams.search}
                                className="input pl-10"
                            />
                        </div>
                    </div>
                    <select name="status" defaultValue={searchParams.status} className="input w-48">
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
                    <button type="submit" className="btn btn-primary">
                        ค้นหา
                    </button>
                </form>
            </div>

            {/* Worker Table */}
            <div className="card">
                <WorkerTable workers={workers} />
            </div>
        </div>
    )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="card">
            <p className="text-sm text-gray-600 mb-1">{label}</p>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{value}</p>
                <div className={`w-10 h-10 ${color} rounded-lg`}></div>
            </div>
        </div>
    )
}
