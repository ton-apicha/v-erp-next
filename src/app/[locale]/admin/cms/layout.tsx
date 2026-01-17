import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CmsSidebar } from '@/components/cms/CmsSidebar'

export default async function CmsLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        redirect(`/${locale}/login`)
    }

    // Check SUPER_ADMIN role
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { role: true }
    })

    if (!user || user.role.name !== 'SUPER_ADMIN') {
        redirect(`/${locale}/dashboard`)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <CmsSidebar locale={locale} />
            <main className="flex-1 ml-64">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
