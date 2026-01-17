'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import {
    Brain, Users, Shield, TrendingUp, Zap,
    CheckCircle, ArrowRight, Activity, BarChart3, PieChart
} from 'lucide-react'

const AI_FEATURES = [
    {
        id: 'smart-matching',
        icon: Users,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        title: {
            th: 'Smart Matching Algorithm',
            la: 'Smart Matching Algorithm'
        },
        desc: {
            th: 'AI คัดกรองทักษะและประสบการณ์แรงงานให้ตรงกับความต้องการโรงงาน ลดอัตรา Turnover ได้ถึง 40%',
            la: 'AI ຄັດກອງທັກສະແລະປະສົບການແຮງງານໃຫ້ຕົງກັບຄວາມຕ້ອງການໂຮງງານ'
        },
        stats: { value: '40%', label: { th: 'ลด Turnover', la: 'ຫຼຸດ Turnover' } }
    },
    {
        id: 'compliance',
        icon: Shield,
        color: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/10',
        iconColor: 'text-green-400',
        title: {
            th: 'Real-time Compliance',
            la: 'Real-time Compliance'
        },
        desc: {
            th: 'ระบบแจ้งเตือน Passport, Visa, Work Permit ล่วงหน้าอัตโนมัติ ไม่พลาดกำหนด',
            la: 'ລະບົບແຈ້ງເຕືອນ Passport, Visa, Work Permit ລ່ວງໜ້າອັດຕະໂນມັດ'
        },
        stats: { value: '100%', label: { th: 'ถูกกฎหมาย', la: 'ຖືກກົດໝາຍ' } }
    },
    {
        id: 'safety',
        icon: TrendingUp,
        color: 'from-amber-500 to-orange-500',
        bgColor: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        title: {
            th: 'Predictive Analytics',
            la: 'Predictive Analytics'
        },
        desc: {
            th: 'วิเคราะห์แนวโน้มและพยากรณ์ความต้องการแรงงาน ช่วยวางแผนล่วงหน้า',
            la: 'ວິເຄາະແນວໂນ້ມແລະພະຍາກອນຄວາມຕ້ອງການແຮງງານ'
        },
        stats: { value: '95%', label: { th: 'แม่นยำ', la: 'ແມ່ນຢຳ' } }
    }
]

// Animated bar chart data
const CHART_DATA = [
    { label: 'Jan', value: 85, color: 'bg-blue-500' },
    { label: 'Feb', value: 72, color: 'bg-blue-500' },
    { label: 'Mar', value: 90, color: 'bg-cyan-500' },
    { label: 'Apr', value: 88, color: 'bg-cyan-500' },
    { label: 'May', value: 95, color: 'bg-green-500' },
    { label: 'Jun', value: 98, color: 'bg-green-500' },
]

export function AIAdvantageSection() {
    const locale = useLocale() as 'th' | 'la'
    const [activeIndex, setActiveIndex] = useState(0)
    const [animatedValue, setAnimatedValue] = useState(0)

    // Auto-rotate features
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % AI_FEATURES.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    // Animate counter
    useEffect(() => {
        const target = 5420
        const duration = 2000
        const step = target / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
            current += step
            if (current >= target) {
                setAnimatedValue(target)
                clearInterval(timer)
            } else {
                setAnimatedValue(Math.floor(current))
            }
        }, 16)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative" id="ai-advantage">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900/50" />
                <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-cyan-500/20">
                        <Brain className="w-4 h-4" />
                        V-Group Intelligence System
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                            {locale === 'th' ? 'ระบบ AI ที่ออกแบบเพื่อ' : 'ລະບົບ AI ທີ່ອອກແບບເພື່ອ'}
                        </span>
                        <br />
                        <span className="text-cyan-400">
                            {locale === 'th' ? 'ธุรกิจแรงงานโดยเฉพาะ' : 'ທຸລະກິດແຮງງານໂດຍສະເພາະ'}
                        </span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Features List */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        {AI_FEATURES.map((feature, index) => (
                            <motion.div
                                key={feature.id}
                                onClick={() => setActiveIndex(index)}
                                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${activeIndex === index
                                        ? 'bg-gradient-to-r from-slate-800 to-slate-800/50 border-l-4 border-cyan-500 shadow-xl'
                                        : 'bg-slate-800/30 border-l-4 border-transparent hover:bg-slate-800/50'
                                    }`}
                                whileHover={{ x: 5 }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center shrink-0`}>
                                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-1">{feature.title[locale]}</h3>
                                        <p className="text-sm text-slate-400 mb-3">
                                            {feature.desc[locale]}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className={`h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden`}>
                                                <motion.div
                                                    className={`h-full bg-gradient-to-r ${feature.color}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: activeIndex === index ? '100%' : '0%' }}
                                                    transition={{ duration: 4 }}
                                                />
                                            </div>
                                            <span className="text-xs font-bold text-cyan-400">{feature.stats.value}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Visual Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* Main Dashboard Card */}
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-6 shadow-2xl">
                            {/* Stats Row */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <motion.div
                                    className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs text-slate-400">Active</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        {animatedValue.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-green-400 mt-1">+12% ↑</p>
                                </motion.div>
                                <motion.div
                                    className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-4 h-4 text-green-400" />
                                        <span className="text-xs text-slate-400">Compliance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">100%</p>
                                    <p className="text-xs text-green-400 mt-1">✓ Legal</p>
                                </motion.div>
                                <motion.div
                                    className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-amber-400" />
                                        <span className="text-xs text-slate-400">Status</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white">98.5</p>
                                    <p className="text-xs text-green-400 mt-1">Excellent</p>
                                </motion.div>
                            </div>

                            {/* Animated Chart */}
                            <div className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50 mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm font-medium">Performance Trend</span>
                                    </div>
                                    <span className="text-xs text-slate-400">Last 6 months</span>
                                </div>
                                <div className="flex items-end gap-2 h-32">
                                    {CHART_DATA.map((bar, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex-1 flex flex-col items-center gap-1"
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                        >
                                            <motion.div
                                                className={`w-full rounded-t-lg ${bar.color}`}
                                                initial={{ height: 0 }}
                                                whileInView={{ height: `${bar.value}%` }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                            />
                                            <span className="text-[10px] text-slate-500">{bar.label}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Activity */}
                            <div className="space-y-2">
                                {[
                                    { icon: CheckCircle, text: locale === 'th' ? 'จับคู่แรงงาน 12 คนให้ Toyota' : 'Matched 12 workers to Toyota', time: '2 min ago', color: 'text-green-400' },
                                    { icon: Shield, text: locale === 'th' ? 'แจ้งเตือน Visa: 5 คน (30 วัน)' : 'Visa alert: 5 workers (30 days)', time: '5 min ago', color: 'text-amber-400' },
                                    { icon: TrendingUp, text: locale === 'th' ? 'พยากรณ์: ต้องการ +50 คน Q2' : 'Forecast: Need +50 workers Q2', time: '10 min ago', color: 'text-blue-400' }
                                ].map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
                                    >
                                        <log.icon className={`w-4 h-4 ${log.color} shrink-0`} />
                                        <span className="text-sm text-slate-300 flex-1">{log.text}</span>
                                        <span className="text-xs text-slate-500">{log.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg shadow-cyan-500/30 flex items-center gap-2"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <Zap className="w-4 h-4" />
                            AI Powered
                        </motion.div>

                        {/* Decorative circles */}
                        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <a
                        href="#calculator"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-xl hover:shadow-cyan-500/20 transition-all hover:scale-105"
                    >
                        {locale === 'th' ? 'ลองคำนวณค่าใช้จ่าย' : 'ລອງຄຳນວນຄ່າໃຊ້ຈ່າຍ'}
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
