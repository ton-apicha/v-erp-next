'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'

export function StandardSection() {
    const t = useTranslations('Landing.Standard')

    const steps = ['sourcing', 'screening', 'incubation', 'deployment']

    return (
        <section className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('topic')}</h2>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block" />

                    <div className="grid md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.2 }}
                                className="relative bg-white z-10 p-6 text-center group"
                            >
                                <div className="w-16 h-16 mx-auto bg-white border-4 border-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6 shadow-lg group-hover:border-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                    {index + 1}
                                </div>
                                <h3 className="font-bold text-lg mb-3 uppercase tracking-wide text-slate-800">
                                    {step}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    {t(step)}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
