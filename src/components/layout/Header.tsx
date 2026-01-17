'use client'

import { useState } from 'react'
import { Link, useRouter, usePathname } from '@/i18n/routing'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import {
    Bell,
    Search,
    Menu,
    Globe,
    ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

interface HeaderProps {
    user: {
        name: string
        email: string
        role: UserRole
        permissions: string[]
        image?: string
    }
    onToggleSidebar?: () => void
    notificationCount?: number
}

// =========================================
// Component
// =========================================

export default function Header({ user, onToggleSidebar, notificationCount = 0 }: HeaderProps) {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const changeLocale = (nextLocale: string) => {
        router.replace(pathname, { locale: nextLocale as "th" | "la" })
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    // Labels based on locale
    const labels = {
        search: locale === 'la' ? 'ຄົ້ນຫາ...' : 'ค้นหา...',
        language: locale === 'la' ? 'ພາສາ' : 'ภาษา',
        notifications: locale === 'la' ? 'ການແຈ້ງເຕືອນ' : 'การแจ้งเตือน',
        new: locale === 'la' ? 'ໃໝ່' : 'ใหม่',
        viewAll: locale === 'la' ? 'ເບິ່ງທັງໝົດ' : 'ดูทั้งหมด',
        profile: locale === 'la' ? 'ໂປຣໄຟລ໌' : 'โปรไฟล์',
        settings: locale === 'la' ? 'ຕັ້ງຄ່າ' : 'ตั้งค่า',
        logOut: locale === 'la' ? 'ອອກຈາກລະບົບ' : 'ออกจากระบบ',
    }

    // Get role display name based on locale
    const roleDisplayName = locale === 'la' && user.role.displayNameLA
        ? user.role.displayNameLA
        : user.role.displayName

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white/95 backdrop-blur px-4 sm:px-6 shadow-sm">
            {/* Toggle Sidebar */}
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
                <Menu className="h-5 w-5" />
            </Button>

            {/* Global Search */}
            <div className="flex-1">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        type="search"
                        placeholder={labels.search}
                        className="pl-9 w-full bg-gray-50 border-gray-200"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Language Switcher - Only TH and LA */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Globe className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{labels.language}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => changeLocale('th')}>
                            🇹🇭 ไทย {locale === 'th' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLocale('la')}>
                            🇱🇦 ລາວ {locale === 'la' && '✓'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>{labels.notifications}</span>
                            <Badge variant="secondary">{notificationCount} {labels.new}</Badge>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-64 overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <p className="text-sm font-medium">🔴 SOS Alert</p>
                                <p className="text-xs text-gray-500">Worker W-0001 sent SOS</p>
                                <p className="text-xs text-gray-400">5 mins ago</p>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/notifications" className="w-full text-center text-primary-600">
                                {labels.viewAll}
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.image} alt={user.name} />
                                <AvatarFallback className="bg-primary-600 text-white text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-gray-500">{roleDisplayName}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">{labels.profile}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">{labels.settings}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-red-600">
                            <form action="/api/auth/signout" method="POST" className="w-full">
                                <button type="submit" className="w-full text-left">
                                    {labels.logOut}
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
