import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardShell from '@/components/layout/DashboardShell'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect('/login')
    }

    const user = {
        name: session.user?.name || 'ผู้ใช้',
        email: session.user?.email || '',
        role: (session.user as any)?.role || 'STAFF',
        image: (session.user as any)?.image,
    }

    return <DashboardShell user={user}>{children}</DashboardShell>
}
