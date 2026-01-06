'use server'

import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

/**
 * Reset all business data while keeping users and address data
 * Only SUPER_ADMIN can perform this action
 */
export async function resetDatabaseData() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can reset database')
    }

    try {
        // Delete in correct order due to foreign key constraints
        // 1. Delete payment-related data first
        await prisma.payment.deleteMany({})
        console.log('✓ Payments deleted')

        // 2. Delete loans
        await prisma.loan.deleteMany({})
        console.log('✓ Loans deleted')

        // 3. Delete commissions
        await prisma.commission.deleteMany({})
        console.log('✓ Commissions deleted')

        // 4. Delete SOS alerts
        await prisma.sosAlert.deleteMany({})
        console.log('✓ SOS Alerts deleted')

        // 5. Delete documents
        await prisma.document.deleteMany({})
        console.log('✓ Documents deleted')

        // 6. Delete material issues
        await prisma.materialIssue.deleteMany({})
        console.log('✓ Material Issues deleted')

        // 7. Delete orders
        await prisma.order.deleteMany({})
        console.log('✓ Orders deleted')

        // 8. Delete payroll files
        await prisma.payrollFile.deleteMany({})
        console.log('✓ Payroll Files deleted')

        // 9. Delete notifications
        await prisma.notification.deleteMany({})
        console.log('✓ Notifications deleted')

        // 10. Delete audit logs
        await prisma.auditLog.deleteMany({})
        console.log('✓ Audit Logs deleted')

        // 11. Delete workers (after their related data)
        await prisma.worker.deleteMany({})
        console.log('✓ Workers deleted')

        // 12. Delete agents
        await prisma.agent.deleteMany({})
        console.log('✓ Agents deleted')

        // 13. Delete clients
        await prisma.client.deleteMany({})
        console.log('✓ Clients deleted')

        // 14. Delete materials
        await prisma.material.deleteMany({})
        console.log('✓ Materials deleted')

        // Create audit log for reset action
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'DELETE',
                entity: 'DATABASE',
                entityId: 'ALL',
                oldValue: { action: 'FULL_RESET' },
            },
        })

        // Revalidate all paths
        revalidatePath('/dashboard')
        revalidatePath('/dashboard/workers')
        revalidatePath('/dashboard/agents')
        revalidatePath('/dashboard/clients')
        revalidatePath('/dashboard/finance')

        return {
            success: true,
            message: 'Database reset successful. Users and address data preserved.'
        }
    } catch (error) {
        console.error('Database reset error:', error)
        throw new Error('Failed to reset database: ' + (error as Error).message)
    }
}

/**
 * Re-seed demo data after reset
 */
export async function reseedDemoData() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const user = session.user as any
    if (user.role !== 'SUPER_ADMIN') {
        throw new Error('Only SUPER_ADMIN can re-seed database')
    }

    // This would ideally call the seed script
    // For now, return a message to run it manually
    return {
        success: true,
        message: 'Please run: docker exec v-erp-app node prisma/seed-full.js'
    }
}
