'use client'

import React from 'react'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import { MapPin, Phone, Mail } from 'lucide-react'

export function LandingFooter() {
    const t = useTranslations('Landing.Footer')

    return (
        <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-6 text-white">
                        <div className="w-8 h-8 bg-white text-slate-900 rounded flex items-center justify-center font-bold">V</div>
                        <span className="text-xl font-bold">V-GROUP</span>
                    </div>
                    <p className="max-w-xs text-slate-400">
                        Connecting Potential. Building Nations. <br />
                        The Human Infrastructure of ASEAN.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Offices</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                            <span>{t('addressLaos')}</span>
                        </li>
                        <li className="flex gap-3">
                            <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                            <span>{t('addressThai')}</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Contact</h4>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <Phone className="w-5 h-5 text-slate-500" />
                            <span>+66 2 123 4567</span>
                        </li>
                        <li className="flex gap-3">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <span>contact@v-group.la</span>
                        </li>
                    </ul>

                    <div className="mt-8 pt-8 border-t border-slate-800 text-sm flex flex-col gap-2">
                        <Link href="#" className="hover:text-white transition-colors">{t('links.privacy')}</Link>
                        <Link href="#" className="hover:text-white transition-colors">{t('links.investor')}</Link>
                        <Link href="#" className="hover:text-white transition-colors">{t('links.careers')}</Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-600">
                © {new Date().getFullYear()} V-GROUP. All rights reserved.
            </div>
        </footer>
    )
}
