'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowRight, Globe, Users, Building2 } from 'lucide-react'

export function HeroSection() {
    const t = useTranslations('Landing.Hero')

    return (
        <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Background Video Simulator (Replace with <video> tag in production) */}
            <div className="absolute inset-0 z-0">
                {/* Placeholder for Video: Professional Industrial/Worker vibe */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 animate-pan-background" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-900/80 to-slate-900/90" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
                        {t('headline').split('.').map((part, i) => (
                            <span key={i} className="block">{part}{i === 0 && '.'}</span>
                        ))}
                    </h1>

                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10 font-light">
                        {t('subHeadline')}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-amber-500/20 transition-all">
                            <Building2 className="w-5 h-5 mr-2" />
                            {t('ctaClient')}
                        </Button>
                        <Button size="lg" className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-lg px-8 py-6 rounded-full shadow-lg transition-all border-2 border-transparent hover:border-white/50">
                            <Users className="w-5 h-5 mr-2" />
                            {t('ctaWorker')}
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Ticker at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md border-t border-white/10 py-3">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-sm md:text-base text-blue-200 overflow-hidden">
                    <motion.div
                        className="flex gap-8 whitespace-nowrap"
                        animate={{ x: ["100%", "-100%"] }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    >
                        {/* Duplicated for continuous effect if needed, but simple marquee here */}
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {t('ticker.workers', { count: '5,420' })}</span>
                        <span className="text-white/20">|</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {t('ticker.delivered', { count: '450' })}</span>
                        <span className="text-white/20">|</span>
                        <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {t('ticker.districts', { count: '148' })}</span>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
