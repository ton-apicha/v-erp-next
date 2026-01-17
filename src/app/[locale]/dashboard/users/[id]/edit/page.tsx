import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import EditUserForm from './EditUserForm'

export default async function EditUserPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    const currentUser = session?.user as any

    // Only SUPER_ADMIN and MANAGER can edit users
    const currentRoleName = currentUser.role?.name || ''
    if (!['SUPER_ADMIN', 'MANAGER'].includes(currentRoleName)) {
        redirect('/dashboard')
    }

    // Get user to edit
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            role: { select: { name: true, displayName: true } },
        },
    })

    if (!user) {
        notFound()
    }

    // MANAGER cannot edit SUPER_ADMIN
    const userRoleName = user.role?.name || ''
    if (userRoleName === 'SUPER_ADMIN' && currentRoleName !== 'SUPER_ADMIN') {
        redirect('/dashboard/users')
    }

    // Transform for form
    const userForForm = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role?.name || '',
    }

    return <EditUserForm user={userForForm} currentUserRole={currentRoleName} />
}
