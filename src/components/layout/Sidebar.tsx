'use client'

import { Link, usePathname } from '@/i18n/routing'
import { useTranslations, useLocale } from 'next-intl'
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
    AlertTriangle,
    UserCog,
    ShoppingCart,
    Home,
    Truck,
    Stamp,
    Sparkles,
    History,
    Shield,
    Factory,
    UserCircle,
    FileSignature,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

// =========================================
// Types
// =========================================

interface MenuItem {
    href: string
    labelTH: string
    labelLA: string
    icon: any
    module: string
    action?: string
}

interface MenuSection {
    company: 'V_CONNECT' | 'V_WORK' | 'V_CARE' | 'V_HOLDING'
    titleTH: string
    titleLA: string
    emoji: string
    items: MenuItem[]
}

interface SidebarProps {
    user: {
        name: string
        email: string
        role: {
            name: string
            displayName: string
            companyAccess: string[]
        }
        permissions: string[] // format: "module:action"
    }
    collapsed?: boolean
}

// =========================================
// Menu Configuration
// =========================================

const menuSections: MenuSection[] = [
    {
        company: 'V_CONNECT',
        titleTH: 'V-Connect (ลาว)',
        titleLA: 'V-Connect (ລາວ)',
        emoji: '🇱🇦',
        items: [
            { href: '/dashboard/workers', labelTH: 'แรงงาน', labelLA: 'ແຮງງານ', icon: Users, module: 'workers', action: 'read' },
            { href: '/dashboard/partners', labelTH: 'พาร์ทเนอร์', labelLA: 'ພາດເນີ', icon: Handshake, module: 'partners', action: 'read' },
            { href: '/dashboard/documents', labelTH: 'เอกสาร', labelLA: 'ເອກະສານ', icon: FileText, module: 'documents', action: 'read' },
            { href: '/dashboard/academy', labelTH: 'ศูนย์ฝึกอบรม', labelLA: 'ສູນຝຶກອົບຮົມ', icon: GraduationCap, module: 'academy', action: 'read' },
        ],
    },
    {
        company: 'V_WORK',
        titleTH: 'V-Work (ไทย B2B)',
        titleLA: 'V-Work (ໄທ B2B)',
        emoji: '🏭',
        items: [
            { href: '/dashboard/clients', labelTH: 'ลูกค้าโรงงาน', labelLA: 'ລູກຄ້າໂຮງງານ', icon: Factory, module: 'clients', action: 'read' },
            { href: '/dashboard/deployment', labelTH: 'จัดส่งแรงงาน', labelLA: 'ຈັດສົ່ງແຮງງານ', icon: Truck, module: 'deployment', action: 'read' },
            { href: '/dashboard/visa', labelTH: 'วีซ่า/ใบอนุญาต', labelLA: 'ວີຊ່າ/ໃບອະນຸຍາດ', icon: Stamp, module: 'visa', action: 'read' },
            { href: '/dashboard/orders', labelTH: 'คำสั่งซื้อ', labelLA: 'ຄຳສັ່ງຊື້', icon: ShoppingCart, module: 'orders', action: 'read' },
        ],
    },
    {
        company: 'V_CARE',
        titleTH: 'V-Care (ไทย B2C)',
        titleLA: 'V-Care (ໄທ B2C)',
        emoji: '🏠',
        items: [
            { href: '/dashboard/care', labelTH: 'ภาพรวม', labelLA: 'ພາບລວມ', icon: Home, module: 'care', action: 'read' },
            { href: '/dashboard/clients?type=INDIVIDUAL', labelTH: 'ลูกค้าบุคคล', labelLA: 'ລູກຄ້າບຸກຄົນ', icon: UserCircle, module: 'clients', action: 'read' },
            { href: '/dashboard/deployment', labelTH: 'จัดส่งแม่บ้าน', labelLA: 'ຈັດສົ່ງແມ່ບ້ານ', icon: Sparkles, module: 'deployment', action: 'read' },
        ],
    },
    {
        company: 'V_HOLDING',
        titleTH: 'V-Holding (ภาพรวม)',
        titleLA: 'V-Holding (ພາບລວມ)',
        emoji: '📊',
        items: [
            { href: '/dashboard', labelTH: 'แดชบอร์ด', labelLA: 'ແດຊບອດ', icon: LayoutDashboard, module: 'dashboard', action: 'read' },
            { href: '/dashboard/finance', labelTH: 'การเงิน', labelLA: 'ການເງິນ', icon: CreditCard, module: 'finance', action: 'read' },
            { href: '/dashboard/reports', labelTH: 'รายงาน', labelLA: 'ລາຍງານ', icon: BarChart3, module: 'reports', action: 'read' },
            { href: '/dashboard/users', labelTH: 'ผู้ใช้งาน', labelLA: 'ຜູ້ໃຊ້ງານ', icon: UserCog, module: 'users', action: 'read' },
            { href: '/dashboard/roles', labelTH: 'บทบาท', labelLA: 'ບົດບາດ', icon: Shield, module: 'roles', action: 'read' },
            { href: '/dashboard/contract-templates', labelTH: 'แม่แบบสัญญา', labelLA: 'ແມ່ແບບສັນຍາ', icon: FileSignature, module: 'contractTemplates', action: 'read' },
            { href: '/dashboard/audit-logs', labelTH: 'ประวัติการใช้งาน', labelLA: 'ປະຫວັດການໃຊ້ງານ', icon: History, module: 'auditLogs', action: 'read' },
            { href: '/dashboard/settings', labelTH: 'ตั้งค่า', labelLA: 'ຕັ້ງຄ່າ', icon: Settings, module: 'settings', action: 'read' },
        ],
    },
]

// =========================================
// Permission Helper
// =========================================

function hasPermission(userPermissions: string[], module: string, action: string = 'read'): boolean {
    // Check for exact permission
    if (userPermissions.includes(`${module}:${action}`)) return true
    // Check for wildcard
    if (userPermissions.includes(`${module}:*`)) return true
    if (userPermissions.includes('*:*')) return true
    if (userPermissions.includes('*')) return true
    return false
}

function hasCompanyAccess(userCompanyAccess: string[], company: string): boolean {
    return userCompanyAccess.includes(company)
}

// =========================================
// Sidebar Component
// =========================================

export default function Sidebar({ user, collapsed = false }: SidebarProps) {
    const pathname = usePathname()
    const t = useTranslations('Sidebar')
    const locale = useLocale()

    // Filter sections based on company access
    const visibleSections = menuSections.filter(section =>
        hasCompanyAccess(user.role.companyAccess, section.company)
    )

    // Filter items based on permissions
    const sectionsWithPermissions = visibleSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
            hasPermission(user.permissions, item.module, item.action)
        )
    })).filter(section => section.items.length > 0)

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 shadow-sm',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            <div className="flex flex-col h-full">
                {/* Logo */}
                <div className={cn('p-4 flex items-center gap-3 bg-primary-50', collapsed && 'justify-center')}>
                    <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                        V
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="font-bold text-gray-900">V-ERP</h1>
                            <p className="text-xs text-gray-500">
                                {locale === 'la' ? 'ລະບົບບໍລິຫານ' : 'ระบบบริหาร'}
                            </p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Navigation with Company Sections */}
                <nav className="flex-1 overflow-y-auto py-2">
                    <TooltipProvider delayDuration={0}>
                        {sectionsWithPermissions.map((section, sectionIdx) => (
                            <div key={sectionIdx} className="mb-2">
                                {/* Section Header */}
                                {!collapsed && (
                                    <div className="px-3 py-2 flex items-center gap-2">
                                        <span className="text-lg">{section.emoji}</span>
                                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {locale === 'la' ? section.titleLA : section.titleTH}
                                        </span>
                                    </div>
                                )}

                                {collapsed && sectionIdx > 0 && (
                                    <div className="mx-2 my-2">
                                        <Separator />
                                    </div>
                                )}

                                {/* Section Items */}
                                <div className="px-2">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                        const Icon = item.icon
                                        const label = locale === 'la' ? item.labelLA : item.labelTH

                                        const linkContent = (
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                                                    isActive
                                                        ? 'bg-primary-100 text-primary-700 shadow-sm'
                                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                                                    collapsed && 'justify-center px-2'
                                                )}
                                            >
                                                <Icon className={cn(
                                                    'w-5 h-5 shrink-0',
                                                    isActive ? 'text-primary-600' : 'text-gray-500'
                                                )} />
                                                {!collapsed && (
                                                    <>
                                                        <span className="flex-1">{label}</span>
                                                        {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
                                                    </>
                                                )}
                                            </Link>
                                        )

                                        if (collapsed) {
                                            return (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                                    <TooltipContent side="right" className="font-medium">
                                                        <p>{label}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )
                                        }

                                        return <div key={item.href}>{linkContent}</div>
                                    })}
                                </div>
                            </div>
                        ))}
                    </TooltipProvider>
                </nav>

                <Separator />

                {/* User & Logout */}
                <div className={cn('p-4', collapsed && 'flex flex-col items-center gap-2')}>
                    {!collapsed && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            <p className="text-xs text-primary-600 font-medium mt-1">
                                {user.role.displayName}
                            </p>
                        </div>
                    )}

                    <form action="/api/auth/signout" method="POST">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size={collapsed ? 'icon' : 'default'}
                                        className={cn(
                                            'w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                                            collapsed && 'w-10 h-10'
                                        )}
                                        type="submit"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        {!collapsed && (
                                            <span className="ml-2">
                                                {locale === 'la' ? 'ອອກຈາກລະບົບ' : 'ออกจากระบบ'}
                                            </span>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                {collapsed && (
                                    <TooltipContent side="right">
                                        <p>{locale === 'la' ? 'ອອກຈາກລະບົບ' : 'ออกจากระบบ'}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </TooltipProvider>
                    </form>

                    {!collapsed && (
                        <div className="mt-2 text-center">
                            <p className="text-[10px] text-gray-400">v2.0.0</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}
