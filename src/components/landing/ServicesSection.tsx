'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Factory, Heart, Network } from 'lucide-react'

export function ServicesSection() {
    const t = useTranslations('Landing.Services')

    const services = [
        {
            key: 'vwork',
            icon: Factory,
            color: 'bg-blue-500',
            title: 'V-WORK',
            tag: 'High Volume, Speed Guarantee'
        },
        {
            key: 'vcare',
            icon: Heart,
            color: 'bg-rose-500',
            title: 'V-CARE',
            tag: 'Screened, Trained, Insured'
        },
        {
            key: 'vconnect',
            icon: Network,
            color: 'bg-emerald-500',
            title: 'V-CONNECT',
            tag: 'Nationwide Reach'
        }
    ]

    return (
        <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive workforce solutions tailored for every industry need.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.key}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group"
                        >
                            <div className={`absolute top-0 right-0 w-32 h-32 ${service.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150`} />

                            <div className={`${service.color} w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/20`}>
                                <service.icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-3">{service.title}</h3>
                            <p className="text-gray-600 mb-6 min-h-[80px]">
                                {t(`${service.key}.desc`)}
                            </p>

                            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                                {service.tag}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
