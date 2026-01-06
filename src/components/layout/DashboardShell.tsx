'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
    children: React.ReactNode
    user: {
        name: string
        email: string
        role: string
        image?: string
    }
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-background">
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
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
