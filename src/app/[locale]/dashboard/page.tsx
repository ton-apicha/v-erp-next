import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'
import {
    Users,
    Building2,
    Briefcase, // Changed from Handshake to Briefcase for Agent/Partner concept
    BarChart3,
    Plus,
    Handshake
} from 'lucide-react'

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const t = await getTranslations('Dashboard')

    // Get statistics
    const [workerCount, agentCount, clientCount] = await Promise.all([
        prisma.worker.count(),
        prisma.agent.count(),
        prisma.client.count(),
    ])

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            {/* Welcome Card */}
            <div className="rounded-xl bg-gradient-to-r from-primary/90 to-primary text-primary-foreground p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-2">
                    {t('welcome', { name: session?.user?.name || 'User' })}
                </h2>
                <p className="text-primary-foreground/90">
                    {t('welcomeMessage')}
                </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
                <StatCard
                    title={t('stats.totalWorkers')}
                    value={workerCount}
                    icon={<Users className="w-8 h-8 text-white" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title={t('stats.agents')}
                    value={agentCount}
                    icon={<Handshake className="w-8 h-8 text-white" />}
                    color="bg-green-500"
                />
                <StatCard
                    title={t('stats.clients')}
                    value={clientCount}
                    icon={<Building2 className="w-8 h-8 text-white" />}
                    color="bg-purple-500"
                />
            </div>

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">{t('quickActions.title')}</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickAction
                            href="/dashboard/workers/new"
                            icon={<Users className="w-6 h-6" />}
                            title={t('quickActions.addWorker')}
                        />
                        <QuickAction
                            href="/dashboard/agents/new"
                            icon={<Handshake className="w-6 h-6" />}
                            title={t('quickActions.addAgent')}
                        />
                        <QuickAction
                            href="/dashboard/clients/new"
                            icon={<Building2 className="w-6 h-6" />}
                            title={t('quickActions.addClient')}
                        />
                        <QuickAction
                            href="/dashboard/reports"
                            icon={<BarChart3 className="w-6 h-6" />}
                            title={t('quickActions.viewReports')}
                        />
                    </div>
                </CardContent>
            </Card>
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
    icon: React.ReactNode
    color: string
}) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground mb-1">{title}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`w-14 h-14 ${color} rounded-lg flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

function QuickAction({ href, icon, title }: { href: string; icon: React.ReactNode; title: string }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
        >
            <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
            <span className="font-medium text-foreground group-hover:text-primary transition-colors">{title}</span>
        </Link>
    )
}
