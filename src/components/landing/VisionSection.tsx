'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Plane, Zap, Map, Globe2 } from 'lucide-react'

export function VisionSection() {
    const t = useTranslations('Landing.Vision')

    return (
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
            {/* Abstract Tech Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                {/* Glowing Orb */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6">
                        <Map className="w-4 h-4" />
                        V-Ecosystem
                    </div>
                    <h2 className="text-4xl font-bold mb-6">{t('topic')}</h2>
                    <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                        {t('content1')}
                    </p>
                    <p className="text-lg text-slate-300 leading-relaxed border-l-4 border-amber-500 pl-4 py-1">
                        {t('content2')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    {/* Visual Representation of Network - World Class Abstract Map */}
                    <div className="aspect-square bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden">

                        {/* Map Grid Lines */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                        {/* Abstract Border Outline (Simulated) */}
                        <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 400">
                            <motion.path
                                d="M 100 100 Q 200 50 300 300"
                                stroke="white"
                                strokeWidth="1"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                whileInView={{ pathLength: 1 }}
                                transition={{ duration: 2 }}
                            />
                        </svg>

                        {/* Nodes */}
                        {/* Vientiane Node */}
                        <div className="absolute top-[30%] left-[40%] text-center">
                            <div className="relative flex items-center justify-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping absolute" />
                                <div className="w-3 h-3 bg-amber-500 rounded-full relative z-10 ring-4 ring-amber-500/20" />
                            </div>
                            <div className="mt-2 px-3 py-1 bg-slate-900/80 backdrop-blur rounded text-xs font-mono text-amber-500 border border-amber-500/30">
                                Vientiane
                            </div>
                        </div>

                        {/* Bangkok/Rayong Node */}
                        <div className="absolute top-[65%] left-[60%] text-center">
                            <div className="relative flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping absolute delay-700" />
                                <div className="w-3 h-3 bg-blue-500 rounded-full relative z-10 ring-4 ring-blue-500/20" />
                            </div>
                            <div className="mt-2 px-3 py-1 bg-slate-900/80 backdrop-blur rounded text-xs font-mono text-blue-500 border border-blue-500/30">
                                Rayong Base
                            </div>
                        </div>

                        {/* Connection Curve */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <defs>
                                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                            </defs>
                            <motion.path
                                d="M 165 130 Q 220 200 245 265"
                                stroke="url(#lineGrad)"
                                strokeWidth="2"
                                fill="none"
                                strokeDasharray="5 5"
                                initial={{ strokeDashoffset: 100 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                        </svg>

                        {/* Speed badge */}
                        <div className="absolute bottom-6 right-6 bg-slate-800/80 backdrop-blur border border-slate-700 p-4 rounded-xl flex items-center gap-3 shadow-xl">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Zap className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">Processing</div>
                                <div className="font-bold text-white text-sm">Fastest in Industry</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
