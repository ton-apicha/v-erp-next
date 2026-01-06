'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Landmark, Users, HandHeart } from 'lucide-react'

export function EsgSection() {
    const t = useTranslations('Landing.ESG')

    const items = [
        { key: 'policy', icon: Landmark, color: 'text-amber-600' },
        { key: 'literacy', icon: Landmark, color: 'text-green-600' },
        { key: 'community', icon: Users, color: 'text-blue-600' }
    ]

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="md:w-1/2"
                    >
                        {/* Placeholder for Emotional Image */}
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl relative bg-slate-200">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform hover:scale-105 duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white max-w-sm">
                                <HandHeart className="w-10 h-10 mb-4 text-amber-400" />
                                <h3 className="text-2xl font-bold">Empowering Lives</h3>
                                <p className="text-white/80">More than just a job, we build future for families.</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="md:w-1/2">
                        <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-6">
                            Sustainability
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-8">{t('topic')}</h2>

                        <div className="space-y-8">
                            {items.map((item) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="flex gap-4"
                                >
                                    <div className="shrink-0 w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <item.icon className={`w-5 h-5 ${item.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{t(`${item.key}.title`)}</h3>
                                        <p className="text-gray-600 leading-relaxed">{t(`${item.key}.desc`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
