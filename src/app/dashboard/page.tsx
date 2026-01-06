import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    // Get statistics
    const [workerCount, agentCount, clientCount] = await Promise.all([
        prisma.worker.count(),
        prisma.agent.count(),
        prisma.client.count(),
    ])

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">ภาพรวมระบบ V-ERP</p>
            </div>

            {/* Welcome Card */}
            <div className="card bg-gradient-to-r from-primary-500 to-primary-600 text-white mb-8">
                <h2 className="text-2xl font-bold mb-2">
                    สวัสดี, {session?.user?.name}! 👋
                </h2>
                <p className="text-primary-100">
                    ยินดีต้อนรับสู่ระบบ V-ERP
                </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="แรงงานทั้งหมด"
                    value={workerCount}
                    icon="👷"
                    color="bg-blue-500"
                />
                <StatCard
                    title="ตัวแทน"
                    value={agentCount}
                    icon="🤝"
                    color="bg-green-500"
                />
                <StatCard
                    title="นายจ้าง"
                    value={clientCount}
                    icon="🏢"
                    color="bg-purple-500"
                />
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">เริ่มต้นใช้งาน</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction href="/dashboard/workers" icon="➕" title="เพิ่มแรงงาน" />
                    <QuickAction href="/dashboard/agents" icon="🤝" title="เพิ่มตัวแทน" />
                    <QuickAction href="/dashboard/clients" icon="🏢" title="เพิ่มนายจ้าง" />
                    <QuickAction href="/dashboard/reports" icon="📊" title="ดูรายงาน" />
                </div>
            </div>
        </div>
    )
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string
    value: number
    icon: string
    color: string
}) {
    return (
        <div className="card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold">{value}</p>
                </div>
                <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center text-2xl`}>
                    {icon}
                </div>
            </div>
        </div>
    )
}

function QuickAction({ href, icon, title }: { href: string; icon: string; title: string }) {
    return (
        <a
            href={href}
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
        >
            <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="font-medium text-gray-700 group-hover:text-primary-700">{title}</span>
        </a>
    )
}
