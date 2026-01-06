'use client'

import React, { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ScanFace, Smartphone, Map } from 'lucide-react'

export function TechSection() {
    const t = useTranslations('Landing.Tech')
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], [0, -50])

    // Image Carousel State
    const [activeImage, setActiveImage] = useState(0)
    const images = ['/images/dashboard/overview.png', '/images/dashboard/profile.png']

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveImage((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-amber-400 bg-clip-text text-transparent"
                        >
                            {t('topic')}
                        </motion.h2>

                        <div className="space-y-8">
                            {[
                                { key: 'tracking', icon: Map, color: 'text-blue-400' },
                                { key: 'wallet', icon: Smartphone, color: 'text-green-400' },
                                { key: 'biometric', icon: ScanFace, color: 'text-amber-400' }
                            ].map((item, index) => (
                                <motion.div
                                    key={item.key}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
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

                    <div className="relative">
                        {/* Abstract Laptop Mockup */}
                        <motion.div
                            style={{ y }}
                            className="relative z-10"
                        >
                            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[8px] rounded-t-xl h-[300px] md:h-[400px] w-full max-w-[600px] shadow-2xl">
                                <div className="rounded-lg overflow-hidden h-full bg-slate-700 relative">
                                    {/* Screen Content - Real Mockups */}
                                    <div className="absolute inset-0 bg-slate-900 overflow-hidden group cursor-pointer" onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}>
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={activeImage}
                                                src={images[activeImage]}
                                                alt="Dashboard Mockup"
                                                initial={{ opacity: 0, scale: 1.05 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.8 }}
                                                className="w-full h-full object-cover object-top"
                                            />
                                        </AnimatePresence>

                                        {/* Overlay Gradient for depth */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            <div className="relative mx-auto bg-gray-900 rounded-b-xl rounded-t-sm h-[30px] max-w-[700px] md:w-[700px] w-11/12 shadow-2xl"></div>
                        </motion.div>

                        {/* Decor elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>
    )
}
