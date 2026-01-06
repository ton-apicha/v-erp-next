'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    Handshake,
    Building2,
    FileText,
    CreditCard,
    GraduationCap,
    BarChart3,
    Settings,
    ChevronRight,
    LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
    user: {
        name: string
        email: string
        role: string
    }
    collapsed?: boolean
}

const menuItems = [
    {
        title: 'ภาพรวม',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Operation Hub',
        items: [
            { href: '/dashboard/workers', label: 'แรงงาน', icon: Users },
            { href: '/dashboard/agents', label: 'ตัวแทน', icon: Handshake },
            { href: '/dashboard/clients', label: 'นายจ้าง', icon: Building2 },
        ],
    },
    {
        title: 'การเงิน',
        items: [
            { href: '/dashboard/finance', label: 'ศูนย์การเงิน', icon: CreditCard },
        ],
    },
    {
        title: 'อื่นๆ',
        items: [
            { href: '/dashboard/documents', label: 'เอกสาร', icon: FileText },
            { href: '/dashboard/academy', label: 'ศูนย์ฝึก', icon: GraduationCap },
            { href: '/dashboard/reports', label: 'รายงาน', icon: BarChart3 },
            { href: '/dashboard/settings', label: 'ตั้งค่า', icon: Settings },
        ],
    },
]

export default function Sidebar({ user, collapsed = false }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-full bg-sidebar-background border-r border-sidebar-border transition-all duration-300 z-40',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className={cn('p-4 flex items-center gap-3', collapsed && 'justify-center')}>
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                        V
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="font-bold text-sidebar-foreground">V-CORE</h1>
                            <p className="text-xs text-muted-foreground">Admin Portal</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-2">
                    <TooltipProvider delayDuration={0}>
                        {menuItems.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="mb-4">
                                {!collapsed && (
                                    <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {section.title}
                                    </p>
                                )}
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                    const Icon = item.icon

                                    const linkContent = (
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                                isActive
                                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                                collapsed && 'justify-center'
                                            )}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                            {!collapsed && (
                                                <>
                                                    <span className="flex-1">{item.label}</span>
                                                    {isActive && <ChevronRight className="w-4 h-4" />}
                                                </>
                                            )}
                                        </Link>
                                    )

                                    if (collapsed) {
                                        return (
                                            <Tooltip key={item.href}>
                                                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                                <TooltipContent side="right">
                                                    <p>{item.label}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    }

                                    return <div key={item.href}>{linkContent}</div>
                                })}
                            </div>
                        ))}
                    </TooltipProvider>
                </nav>

                <Separator />

                {/* User & Logout */}
                <div className={cn('p-4', collapsed && 'flex justify-center')}>
                    {!collapsed && (
                        <div className="mb-3 p-3 bg-sidebar-accent rounded-lg">
                            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            <p className="text-xs text-primary font-medium mt-1">{user.role}</p>
                        </div>
                    )}
                    <form action="/api/auth/signout" method="POST">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size={collapsed ? 'icon' : 'default'}
                                        className={cn('w-full', collapsed && 'w-10 h-10')}
                                        type="submit"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        {!collapsed && <span className="ml-2">ออกจากระบบ</span>}
                                    </Button>
                                </TooltipTrigger>
                                {collapsed && (
                                    <TooltipContent side="right">
                                        <p>ออกจากระบบ</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </form>
                    {!collapsed && (
                        <div className="mt-2 text-center">
                            <p className="text-[10px] text-muted-foreground/50">v1.1.0</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
