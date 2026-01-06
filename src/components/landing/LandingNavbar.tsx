'use client'

import React, { useState, useEffect } from 'react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { Globe, LogIn, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function LandingNavbar() {
    const t = useTranslations('Landing.Footer') // Using Footer links or create new
    const tCommon = useTranslations('Common')
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [scrolled, setScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const switchLocale = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4 text-white'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl", scrolled ? "bg-primary text-white" : "bg-white text-primary")}>
                        V
                    </div>
                    <span className={cn("text-xl font-bold transition-colors", scrolled ? "text-primary" : "text-white")}>
                        V-GROUP
                    </span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-2">
                        <Globe className={cn("w-4 h-4", scrolled ? "text-gray-600" : "text-gray-300")} />
                        <button
                            onClick={() => switchLocale('th')}
                            className={cn("text-sm font-medium transition-colors hover:text-primary", locale === 'th' ? "underline decoration-2 underline-offset-4" : "", scrolled ? "text-gray-700" : "text-gray-200")}
                        >
                            TH
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                            onClick={() => switchLocale('en')}
                            className={cn("text-sm font-medium transition-colors hover:text-primary", locale === 'en' ? "underline decoration-2 underline-offset-4" : "", scrolled ? "text-gray-700" : "text-gray-200")}
                        >
                            EN
                        </button>
                        <span className="text-gray-400">|</span>
                        <button
                            onClick={() => switchLocale('la')}
                            className={cn("text-sm font-medium transition-colors hover:text-primary", locale === 'la' ? "underline decoration-2 underline-offset-4" : "", scrolled ? "text-gray-700" : "text-gray-200")}
                        >
                            LA
                        </button>
                    </div>

                    <Link href="/login">
                        <Button variant={scrolled ? "default" : "secondary"} className="gap-2 font-semibold">
                            <LogIn className="w-4 h-4" />
                            V-ERP Login
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                        {mobileMenuOpen ? <X className={scrolled ? "text-black" : "text-white"} /> : <Menu className={scrolled ? "text-black" : "text-white"} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 flex flex-col gap-4 border-t">
                    <div className="flex items-center justify-center gap-4 text-black">
                        <button onClick={() => switchLocale('th')} className={locale === 'th' ? "font-bold text-primary" : ""}>TH</button>
                        <button onClick={() => switchLocale('en')} className={locale === 'en' ? "font-bold text-primary" : ""}>EN</button>
                        <button onClick={() => switchLocale('la')} className={locale === 'la' ? "font-bold text-primary" : ""}>LA</button>
                    </div>
                    <Link href="/login" className="w-full">
                        <Button className="w-full">V-ERP Login</Button>
                    </Link>
                </div>
            )}
        </nav>
    )
}
