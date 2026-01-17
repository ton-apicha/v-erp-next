'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Plane, Zap, Map, Globe2, MapPin, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Leaflet for real map
const MapContainer = dynamic(
    () => import('react-leaflet').then(mod => mod.MapContainer),
    { ssr: false }
)
const TileLayer = dynamic(
    () => import('react-leaflet').then(mod => mod.TileLayer),
    { ssr: false }
)
const Marker = dynamic(
    () => import('react-leaflet').then(mod => mod.Marker),
    { ssr: false }
)
const Polyline = dynamic(
    () => import('react-leaflet').then(mod => mod.Polyline),
    { ssr: false }
)
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
)

// Route coordinates
const VIENTIANE: [number, number] = [17.9757, 102.6331]
const RAYONG: [number, number] = [12.6833, 101.2378]
const ROUTE_PATH: [number, number][] = [
    VIENTIANE,
    [16.5, 102.8],  // Udon Thani area
    [14.5, 101.5],  // Korat area
    [13.5, 101.0],  // Chonburi area
    RAYONG
]

export function VisionSection() {
    const t = useTranslations('Landing.Vision')
    const locale = useLocale() as 'th' | 'la'
    const [isMapLoaded, setIsMapLoaded] = useState(false)
    const [animationStep, setAnimationStep] = useState(0)

    // Load Leaflet CSS
    useEffect(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
        setIsMapLoaded(true)
        return () => {
            document.head.removeChild(link)
        }
    }, [])

    // Animate steps
    useEffect(() => {
        const timer = setInterval(() => {
            setAnimationStep(prev => (prev + 1) % 4)
        }, 2000)
        return () => clearInterval(timer)
    }, [])

    // Thailand-Laos center
    const mapCenter: [number, number] = [15.3, 102.0]

    const JOURNEY_STEPS = [
        { icon: '🇱🇦', label: { th: 'พงสาลี - รวบรวม', la: 'ຜົ້ງສາລີ - ລວບລວມ' } },
        { icon: '📋', label: { th: 'ศูนย์ฝึกอบรม V-Academy', la: 'ສູນຝຶກອົບຮົມ V-Academy' } },
        { icon: '✈️', label: { th: 'ข้ามแดนถูกกฎหมาย', la: 'ຂ້າມແດນຖືກກົດໝາຍ' } },
        { icon: '🏭', label: { th: 'เข้าทำงาน EEC', la: 'ເຂົ້າເຮັດວຽກ EEC' } }
    ]

    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
                        <Globe2 className="w-4 h-4" />
                        V-Ecosystem
                    </div>
                    <h2 className="text-4xl font-bold mb-6">{t('topic')}</h2>
                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                        {t('content1')}
                    </p>
                    <p className="text-lg text-slate-300 leading-relaxed border-l-4 border-amber-500 pl-4 py-1 mb-8">
                        {t('content2')}
                    </p>

                    {/* Journey Steps */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {JOURNEY_STEPS.map((step, i) => (
                            <React.Fragment key={i}>
                                <motion.div
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${animationStep === i
                                            ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                                            : 'bg-slate-800/50 border border-slate-700 text-slate-400'
                                        }`}
                                    animate={{ scale: animationStep === i ? 1.05 : 1 }}
                                >
                                    <span>{step.icon}</span>
                                    <span className="hidden sm:inline">{step.label[locale]}</span>
                                </motion.div>
                                {i < JOURNEY_STEPS.length - 1 && (
                                    <ArrowRight className={`w-4 h-4 ${animationStep > i ? 'text-cyan-400' : 'text-slate-600'}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>

                {/* Right: Real Map */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <div className="aspect-square bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
                        {/* Real Leaflet Map */}
                        {isMapLoaded && typeof window !== 'undefined' && (
                            <MapContainer
                                center={mapCenter}
                                zoom={5}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                                zoomControl={false}
                                attributionControl={false}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                />

                                {/* Route Line */}
                                <Polyline
                                    positions={ROUTE_PATH}
                                    pathOptions={{
                                        color: '#22d3ee',
                                        weight: 3,
                                        opacity: 0.8,
                                        dashArray: '10, 10'
                                    }}
                                />

                                {/* Vientiane Marker */}
                                <Marker position={VIENTIANE}>
                                    <Popup>
                                        <div className="text-slate-900 p-1">
                                            <h4 className="font-bold">🇱🇦 Vientiane</h4>
                                            <p className="text-xs">{locale === 'th' ? 'จุดเริ่มต้น' : 'ຈຸດເລີ່ມຕົ້ນ'}</p>
                                        </div>
                                    </Popup>
                                </Marker>

                                {/* Rayong Marker */}
                                <Marker position={RAYONG}>
                                    <Popup>
                                        <div className="text-slate-900 p-1">
                                            <h4 className="font-bold">🇹🇭 Rayong EEC</h4>
                                            <p className="text-xs">{locale === 'th' ? 'ปลายทาง' : 'ປາຍທາງ'}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        )}

                        {/* Loading State */}
                        {!isMapLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                <div className="text-slate-400">Loading map...</div>
                            </div>
                        )}

                        {/* Overlay Labels */}
                        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur border border-amber-500/30 px-3 py-2 rounded-lg z-[1000]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                <span className="text-xs font-mono text-amber-400">🇱🇦 Laos Origin</span>
                            </div>
                        </div>

                        <div className="absolute bottom-20 right-4 bg-slate-900/90 backdrop-blur border border-blue-500/30 px-3 py-2 rounded-lg z-[1000]">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                <span className="text-xs font-mono text-blue-400">🇹🇭 Thailand EEC</span>
                            </div>
                        </div>

                        {/* Speed Badge */}
                        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl flex items-center gap-3 shadow-xl z-[1000]">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Zap className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Green Lane</div>
                                <div className="font-bold text-white text-sm">{locale === 'th' ? '45 วัน' : '45 ວັນ'}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
