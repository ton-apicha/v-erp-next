'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

// =========================================
// Types
// =========================================

interface UserRole {
    id: string
    name: string
    displayName: string
    displayNameLA?: string | null
    companyAccess: string[]
}

interface DashboardUser {
    name: string
    email: string
    role: UserRole
    permissions: string[]
    image?: string
}

interface DashboardShellProps {
    children: React.ReactNode
    user: DashboardUser
}

// =========================================
// Component
// =========================================

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar user={user} collapsed={sidebarCollapsed} />

            {/* Main Content Area */}
            <div
                className={cn(
                    'transition-all duration-300',
                    sidebarCollapsed ? 'ml-16' : 'ml-64'
                )}
            >
                {/* Header */}
                <Header
                    user={user}
                    onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
                    notificationCount={3}
                />

                {/* Page Content */}
                <main>
                    {children}
                </main>
            </div>
        </div>
    )
}
