'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
    Bell,
    Search,
    Menu,
    Moon,
    Sun,
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

interface HeaderProps {
    user: {
        name: string
        email: string
        role: string
        image?: string
    }
    onToggleSidebar?: () => void
    notificationCount?: number
}

export default function Header({ user, onToggleSidebar, notificationCount = 0 }: HeaderProps) {
    const [isDark, setIsDark] = useState(false)
    const [locale, setLocale] = useState('th')

    const toggleTheme = () => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle('dark')
    }

    const initials = user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 sm:px-6">
            {/* Toggle Sidebar */}
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
                <Menu className="h-5 w-5" />
            </Button>

            {/* Global Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="ค้นหาแรงงาน, ตัวแทน, นายจ้าง..."
                        className="pl-9 w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Globe className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>ภาษา / Language</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setLocale('th')}>
                            🇹🇭 ไทย {locale === 'th' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocale('la')}>
                            🇱🇦 ລາວ {locale === 'la' && '✓'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLocale('en')}>
                            🇺🇸 English {locale === 'en' && '✓'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

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
                            <span>การแจ้งเตือน</span>
                            <Badge variant="secondary">{notificationCount} ใหม่</Badge>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-64 overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <p className="text-sm font-medium">🔴 SOS แจ้งเหตุฉุกเฉิน</p>
                                <p className="text-xs text-muted-foreground">แรงงาน W-20260106-001 ส่งสัญญาณ SOS</p>
                                <p className="text-xs text-muted-foreground">5 นาทีที่แล้ว</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <p className="text-sm font-medium">📄 วีซ่าใกล้หมดอายุ</p>
                                <p className="text-xs text-muted-foreground">มี 3 คนที่วีซ่าจะหมดอายุใน 30 วัน</p>
                                <p className="text-xs text-muted-foreground">1 ชั่วโมงที่แล้ว</p>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                                <p className="text-sm font-medium">💰 มีค่าคอมมิชชั่นรออนุมัติ</p>
                                <p className="text-xs text-muted-foreground">Agent A-0012 มียอด 15,000 บาท</p>
                                <p className="text-xs text-muted-foreground">2 ชั่วโมงที่แล้ว</p>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/notifications" className="w-full text-center text-primary">
                                ดูทั้งหมด
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
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-sm font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.role}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/profile">โปรไฟล์</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">ตั้งค่า</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-destructive">
                            <form action="/api/auth/signout" method="POST" className="w-full">
                                <button type="submit" className="w-full text-left">
                                    ออกจากระบบ
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
