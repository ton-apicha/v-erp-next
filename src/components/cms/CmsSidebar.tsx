'use client'

import { Link } from '@/i18n/routing'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Image,
    HelpCircle,
    Users,
    Factory,
    Settings,
    ArrowLeft,
    Newspaper
} from 'lucide-react'

interface CmsSidebarProps {
    locale: string
}

export function CmsSidebar({ locale }: CmsSidebarProps) {
    const pathname = usePathname()

    const menuItems = [
        { href: `/admin/cms`, icon: LayoutDashboard, label: 'Dashboard', labelLA: 'ແດດບອດ' },
        { href: `/admin/cms/pages`, icon: FileText, label: 'Pages', labelLA: 'ໜ້າເວັບ' },
        { href: `/admin/cms/blog`, icon: Newspaper, label: 'Blog', labelLA: 'ບົດຄວາມ' },
        { href: `/admin/cms/media`, icon: Image, label: 'Media', labelLA: 'ສື່' },
        { href: `/admin/cms/faq`, icon: HelpCircle, label: 'FAQ', labelLA: 'ຄຳຖາມ' },
        { href: `/admin/cms/partners`, icon: Users, label: 'Partners', labelLA: 'ພາດເນີ' },
        { href: `/admin/cms/estates`, icon: Factory, label: 'Estates', labelLA: 'ນິຄົມ' },
        { href: `/admin/cms/settings`, icon: Settings, label: 'Settings', labelLA: 'ຕັ້ງຄ່າ' },
    ]

    const isActive = (href: string) => {
        const fullPath = `/${locale}${href}`
        if (href === '/admin/cms') {
            return pathname === fullPath
        }
        return pathname.startsWith(fullPath)
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">
                        V
                    </div>
                    <div>
                        <h1 className="font-bold text-lg">V-CMS</h1>
                        <p className="text-xs text-slate-400">Content Management</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.href)
                                ? 'bg-cyan-500/20 text-cyan-400 border-l-4 border-cyan-400'
                                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span>{locale === 'la' ? item.labelLA : item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-700">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>{locale === 'la' ? 'ກັບໄປ ERP' : 'Back to ERP'}</span>
                </Link>
            </div>
        </aside>
    )
}
