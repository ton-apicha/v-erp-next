'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLocale } from 'next-intl'
import {
    Brain, Users, Shield, TrendingUp, Zap,
    CheckCircle, ArrowRight, Sparkles
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
            th: 'ระบบแจ้งเตือน Passport, Visa, Work Permit ล่วงหน้าอัตโนมัติ ไม่มีการทำผิดกฎหมาย 100%',
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
            th: 'Predictive Safety Analytics',
            la: 'Predictive Safety Analytics'
        },
        desc: {
            th: 'วิเคราะห์ความเสี่ยงด้านสุขภาพและความปลอดภัย ป้องกันอุบัติเหตุก่อนเกิดขึ้น',
            la: 'ວິເຄາະຄວາມສ່ຽງດ້ານສຸຂະພາບແລະຄວາມປອດໄພ'
        },
        stats: { value: '85%', label: { th: 'ลดอุบัติเหตุ', la: 'ຫຼຸດອຸບັດຕິເຫດ' } }
    }
]

export function AIAdvantageSection() {
    const locale = useLocale() as 'th' | 'la'
    const [activeIndex, setActiveIndex] = useState(0)
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], [0, -30])

    // Auto-rotate features
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % AI_FEATURES.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative" id="ai-advantage">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-cyan-500/30">
                        <Brain className="w-4 h-4" />
                        V-Group Intelligence System
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
                        {locale === 'th' ? 'ข้อได้เปรียบ AI ที่คู่แข่งไม่มี' : 'ຂໍ້ໄດ້ປຽບ AI ທີ່ຄູ່ແຂ່ງບໍ່ມີ'}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        {locale === 'th'
                            ? 'ระบบ AI ที่พัฒนาขึ้นเฉพาะสำหรับการบริหารจัดการแรงงานข้ามชาติ'
                            : 'ລະບົບ AI ທີ່ພັດທະນາຂຶ້ນສະເພາະສຳລັບການບໍລິຫານຈັດການແຮງງານຂ້າມຊາດ'
                        }
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                                className={`p-6 rounded-2xl cursor-pointer transition-all ${activeIndex === index
                                        ? 'bg-gradient-to-r ' + feature.color + ' bg-opacity-10 border border-white/20 shadow-lg'
                                        : 'bg-slate-800/50 border border-slate-700 hover:bg-slate-800'
                                    }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center shrink-0`}>
                                        <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold mb-2">{feature.title[locale]}</h3>
                                        <p className={`text-sm ${activeIndex === index ? 'text-slate-200' : 'text-slate-400'}`}>
                                            {feature.desc[locale]}
                                        </p>

                                        {/* Stats */}
                                        <div className={`mt-4 flex items-center gap-3 ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`}>
                                            <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <span className="font-bold text-lg">{feature.stats.value}</span>
                                                <span className="text-xs text-slate-300">{feature.stats.label[locale]}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Visual Display */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{ y }}
                        className="relative"
                    >
                        {/* AI Dashboard Preview */}
                        <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-2 shadow-2xl">
                            {/* Browser Chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-t-2xl border-b border-slate-700">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <div className="flex-1 bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 text-center">
                                    v-erp.itd.in.th/dashboard
                                </div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-6 space-y-4">
                                {/* Header Bar */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold">AI Analytics Dashboard</h4>
                                        <p className="text-xs text-slate-400">Real-time workforce intelligence</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                                        <Sparkles className="w-3 h-3" />
                                        Live
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { label: 'Active Workers', value: '5,420', trend: '+12%' },
                                        { label: 'Compliance', value: '100%', trend: '✓' },
                                        { label: 'Safety Score', value: '98.5', trend: '+2.3' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
                                            <p className="text-xs text-slate-400">{stat.label}</p>
                                            <p className="text-xl font-bold text-white">{stat.value}</p>
                                            <p className="text-xs text-green-400">{stat.trend}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Activity */}
                                <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
                                    <p className="text-xs text-slate-400 mb-3">AI Activity Log</p>
                                    <div className="space-y-2">
                                        {[
                                            { icon: CheckCircle, text: 'Matched 12 workers to Toyota Motor', color: 'text-green-400' },
                                            { icon: Shield, text: 'Visa renewal alert: 5 workers (30 days)', color: 'text-amber-400' },
                                            { icon: TrendingUp, text: 'Turnover risk detected: Factory A (Low)', color: 'text-blue-400' }
                                        ].map((log, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <log.icon className={`w-4 h-4 ${log.color}`} />
                                                <span className="text-slate-300">{log.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            className="absolute -top-6 -right-6 bg-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg shadow-cyan-500/30"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                        >
                            AI Powered ⚡
                        </motion.div>
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
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                        {locale === 'th' ? 'ทดลองใช้งาน AI ฟรี' : 'ທົດລອງໃຊ້ງານ AI ຟຣີ'}
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
