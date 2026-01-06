'use client'

import React, { useEffect, useState, useRef } from 'react'
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Clock, MapPin, Wallet, ShieldCheck } from 'lucide-react'

function Counter({ value, suffix = '' }: { value: number | string, suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null)
    const inView = useInView(ref, { once: true, margin: "-100px" })
    const motionValue = useMotionValue(0)
    const springValue = useSpring(motionValue, { damping: 50, stiffness: 100 })
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (inView && typeof value === 'number') {
            motionValue.set(value)
        }
    }, [inView, value, motionValue])

    useEffect(() => {
        springValue.on("change", (latest) => {
            setDisplayValue(Math.round(latest))
        })
    }, [springValue])

    if (typeof value === 'string') return <span ref={ref}>{value}</span>

    return <span ref={ref}>{displayValue}{suffix}</span>
}

export function StatsSection() {
    const t = useTranslations('Landing.TrustNumbers')

    const stats = [
        {
            key: 'days',
            icon: Clock,
            numeric: 30,
            suffix: ' Days',
            text: t('days.label')
        },
        {
            key: 'districts',
            icon: MapPin,
            numeric: 148,
            suffix: ' Dists',
            text: t('districts.label')
        },
        {
            key: 'finance',
            icon: Wallet,
            numeric: 100,
            suffix: '%',
            text: t('finance.label')
        },
        {
            key: 'risk',
            icon: ShieldCheck,
            textValue: 'Zero',
            suffix: ' Risk',
            text: t('risk.label')
        },
    ]

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <stat.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                                {stat.textValue ? (
                                    <span>{stat.textValue}{stat.suffix}</span>
                                ) : (
                                    <Counter value={stat.numeric || 0} suffix={stat.suffix} />
                                )}
                            </h3>
                            <p className="text-gray-500 font-medium">{stat.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
