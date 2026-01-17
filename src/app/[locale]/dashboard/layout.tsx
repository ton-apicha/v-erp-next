import { getServerSession } from 'next-auth'
import { redirect } from '@/i18n/routing'
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

    // Default role for fallback
    const defaultRole = {
        id: '',
        name: 'STAFF',
        displayName: 'พนักงาน',
        displayNameLA: 'ພະນັກງານ',
        companyAccess: [] as string[],
    }

    const user = {
        name: session?.user?.name || 'ผู้ใช้',
        email: session?.user?.email || '',
        role: (session?.user as any)?.role || defaultRole,
        permissions: (session?.user as any)?.permissions || [],
        image: (session?.user as any)?.image,
    }

    return <DashboardShell user={user}>{children}</DashboardShell>
}
