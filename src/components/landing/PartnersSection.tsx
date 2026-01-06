'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Quote, Building2, HardHat, Ship, Leaf, Utensils, Zap } from 'lucide-react'

export function PartnersSection() {
    const t = useTranslations('Landing.Trust')

    const partners = [
        { icon: Building2, name: "Mega Estate Group" },
        { icon: HardHat, name: "Thai Construction" },
        { icon: Leaf, name: "Agri-Tech Asia" },
        { icon: Utensils, name: "Siam Food Public" },
        { icon: Ship, name: "Global Logistics" },
        { icon: Zap, name: "Volt Energy" }
    ]

    return (
        <section className="py-20 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 text-center">

                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-10">Trusted by Industry Leaders</p>

                {/* Logo Grid - Professional Placeholders */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-20">
                    {partners.map((partner, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center justify-center gap-3 opacity-50 hover:opacity-100 transition-all duration-300 group cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                                <partner.icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-800">{partner.name}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonial */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 p-10 md:p-14 rounded-[2rem] relative shadow-lg shadow-blue-100/50"
                >
                    <Quote className="absolute top-8 left-8 w-12 h-12 text-blue-200" />
                    <p className="text-2xl md:text-3xl font-serif text-slate-800 italic relative z-10 mb-8 leading-relaxed">
                        "{t('quote')}"
                    </p>
                    <div className="flex items-center justify-center gap-5">
                        <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />
                        </div>
                        <div className="text-left">
                            <div className="font-bold text-slate-900 text-lg">Poompat S.</div>
                            <div className="text-sm text-slate-500 font-medium">HR Director, Top 50 Stock Exchange</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
