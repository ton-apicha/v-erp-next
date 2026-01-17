'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import {
    ScanFace, Smartphone, Map, User, FileCheck, Briefcase,
    Shield, Calendar, MapPin, CheckCircle, Clock
} from 'lucide-react'

// Sample worker data for realistic mockup
const WORKER_PROFILE = {
    name: { th: 'นาย สมชาย แก้วมณี', la: 'ທ. ສົມໄຊ ແກ້ວມະນີ' },
    nameEn: 'Somchai Kaewmanee',
    nationality: { th: 'ลาว', la: 'ລາວ' },
    age: 28,
    position: { th: 'พนักงานผลิต', la: 'ພະນັກງານຜະລິດ' },
    status: 'ACTIVE',
    factory: 'Toyota Motor Thailand',
    location: 'Amata City, Chonburi',
    documents: [
        { name: 'Passport', status: 'valid', expiry: '2028-05-15' },
        { name: 'Visa', status: 'valid', expiry: '2026-08-20' },
        { name: 'Work Permit', status: 'valid', expiry: '2026-08-20' }
    ],
    stats: {
        daysWorked: 847,
        attendance: 98.5,
        rating: 4.8
    }
}

export function TechSection() {
    const t = useTranslations('Landing.Tech')
    const locale = useLocale() as 'th' | 'la'
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'tracking'>('profile')

    // Auto-rotate tabs
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveTab(prev => {
                if (prev === 'profile') return 'documents'
                if (prev === 'documents') return 'tracking'
                return 'profile'
            })
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Features */}
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent"
                        >
                            {t('topic')}
                        </motion.h2>

                        <div className="space-y-6">
                            {[
                                { key: 'tracking', icon: Map, color: 'text-blue-400', tab: 'tracking' as const },
                                { key: 'wallet', icon: Smartphone, color: 'text-green-400', tab: 'documents' as const },
                                { key: 'biometric', icon: ScanFace, color: 'text-amber-400', tab: 'profile' as const }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    onClick={() => setActiveTab(item.tab)}
                                    className={`flex gap-4 p-4 rounded-xl cursor-pointer transition-all ${activeTab === item.tab
                                            ? 'bg-white/10 border-l-4 border-cyan-500'
                                            : 'hover:bg-white/5 border-l-4 border-transparent'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center ${item.color} shrink-0`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{t(`${item.key}.title`)}</h3>
                                        <p className="text-slate-400">{t(`${item.key}.desc`)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Interactive Dashboard Mockup */}
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="relative z-10"
                        >
                            {/* Dashboard Container */}
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">V</div>
                                        <span className="font-semibold text-sm">V-ERP Dashboard</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span className="text-xs text-green-400">Live</span>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-slate-700/50">
                                    {[
                                        { id: 'profile' as const, label: locale === 'th' ? 'โปรไฟล์' : 'ໂປຣໄຟລ໌', icon: User },
                                        { id: 'documents' as const, label: locale === 'th' ? 'เอกสาร' : 'ເອກະສານ', icon: FileCheck },
                                        { id: 'tracking' as const, label: locale === 'th' ? 'ตำแหน่ง' : 'ຕຳແໜ່ງ', icon: MapPin }
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${activeTab === tab.id
                                                    ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50'
                                                    : 'text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="p-6 min-h-[320px]">
                                    <AnimatePresence mode="wait">
                                        {/* Profile Tab */}
                                        {activeTab === 'profile' && (
                                            <motion.div
                                                key="profile"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                {/* Worker Card */}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl font-bold">
                                                        {WORKER_PROFILE.nameEn.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-lg">{WORKER_PROFILE.name[locale]}</h4>
                                                            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                                                                {WORKER_PROFILE.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-slate-400 text-sm">{WORKER_PROFILE.position[locale]}</p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                🇱🇦 {WORKER_PROFILE.nationality[locale]}
                                                            </span>
                                                            <span>•</span>
                                                            <span>{WORKER_PROFILE.age} {locale === 'th' ? 'ปี' : 'ປີ'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                                        <p className="text-2xl font-bold text-white">{WORKER_PROFILE.stats.daysWorked}</p>
                                                        <p className="text-xs text-slate-400">{locale === 'th' ? 'วันทำงาน' : 'ວັນເຮັດວຽກ'}</p>
                                                    </div>
                                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                                        <p className="text-2xl font-bold text-green-400">{WORKER_PROFILE.stats.attendance}%</p>
                                                        <p className="text-xs text-slate-400">{locale === 'th' ? 'เข้างาน' : 'ເຂົ້າງານ'}</p>
                                                    </div>
                                                    <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                                                        <p className="text-2xl font-bold text-amber-400">⭐ {WORKER_PROFILE.stats.rating}</p>
                                                        <p className="text-xs text-slate-400">{locale === 'th' ? 'คะแนน' : 'ຄະແນນ'}</p>
                                                    </div>
                                                </div>

                                                {/* Current Assignment */}
                                                <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Briefcase className="w-4 h-4 text-blue-400" />
                                                        <span className="text-sm font-medium">{locale === 'th' ? 'ที่ทำงานปัจจุบัน' : 'ບ່ອນເຮັດວຽກປະຈຸບັນ'}</span>
                                                    </div>
                                                    <p className="text-white font-semibold">{WORKER_PROFILE.factory}</p>
                                                    <p className="text-slate-400 text-sm">{WORKER_PROFILE.location}</p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Documents Tab */}
                                        {activeTab === 'documents' && (
                                            <motion.div
                                                key="documents"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-bold text-lg">{locale === 'th' ? 'เอกสารสำคัญ' : 'ເອກະສານສຳຄັນ'}</h4>
                                                    <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        {locale === 'th' ? 'ถูกต้องครบถ้วน' : 'ຖືກຕ້ອງຄົບຖ້ວນ'}
                                                    </span>
                                                </div>

                                                {WORKER_PROFILE.documents.map((doc, i) => (
                                                    <motion.div
                                                        key={doc.name}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                                                                <FileCheck className="w-5 h-5 text-cyan-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{doc.name}</p>
                                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {locale === 'th' ? 'หมดอายุ' : 'ໝົດອາຍຸ'}: {doc.expiry}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-green-400">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Tracking Tab */}
                                        {activeTab === 'tracking' && (
                                            <motion.div
                                                key="tracking"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="space-y-4"
                                            >
                                                {/* Mini Map Placeholder */}
                                                <div className="bg-slate-800/50 rounded-xl h-40 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900">
                                                        {/* Stylized map grid */}
                                                        <div className="absolute inset-0 opacity-20" style={{
                                                            backgroundImage: 'linear-gradient(rgba(100,200,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(100,200,255,0.3) 1px, transparent 1px)',
                                                            backgroundSize: '20px 20px'
                                                        }} />
                                                        {/* Pin */}
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                            <div className="relative">
                                                                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                                                                    <MapPin className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-cyan-500/20 rounded-full blur-sm" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Location Info */}
                                                <div className="bg-slate-800/50 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-sm text-slate-400">{locale === 'th' ? 'ตำแหน่งล่าสุด' : 'ຕຳແໜ່ງລ່າສຸດ'}</span>
                                                        <span className="text-xs text-green-400 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {locale === 'th' ? 'อัปเดต 2 นาทีที่แล้ว' : 'ອັບເດດ 2 ນາທີກ່ອນ'}
                                                        </span>
                                                    </div>
                                                    <p className="font-semibold">{WORKER_PROFILE.factory}</p>
                                                    <p className="text-slate-400 text-sm">{WORKER_PROFILE.location}</p>
                                                    <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-500">
                                                        GPS: 13.2958° N, 101.1248° E
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>

                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    )
}
