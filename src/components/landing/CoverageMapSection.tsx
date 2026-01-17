'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MapPin, Factory, Users, Building2, CheckCircle } from 'lucide-react'

// Industrial Estates Data with coordinates (relative to SVG viewBox)
const INDUSTRIAL_ESTATES = [
    {
        id: 'amata-city',
        name: { th: 'อมตะซิตี้ ชลบุรี', la: 'ອະມະຕະຊິຕີ້ ຊົນບຸລີ' },
        region: 'EEC',
        workers: 850,
        clients: 12,
        position: { x: 78, y: 55 } // East
    },
    {
        id: 'rojana',
        name: { th: 'นิคมฯ โรจนะ อยุธยา', la: 'ນິຄົມ ໂຣຈະນະ ອະຍຸດທະຍາ' },
        region: 'Central',
        workers: 620,
        clients: 8,
        position: { x: 55, y: 38 } // Central-North
    },
    {
        id: 'wellgrow',
        name: { th: 'เวลโกรว์ ฉะเชิงเทรา', la: 'ເວລໂກຣວ ສະເຊີງເຊົາ' },
        region: 'EEC',
        workers: 480,
        clients: 6,
        position: { x: 72, y: 48 } // East
    },
    {
        id: 'bangpu',
        name: { th: 'นิคมฯ บางปู สมุทรปราการ', la: 'ນິຄົມ ບາງປູ ສະໝຸດປຣາການ' },
        region: 'Bangkok',
        workers: 720,
        clients: 15,
        position: { x: 58, y: 52 } // Bangkok area
    },
    {
        id: 'nava-nakorn',
        name: { th: 'นวนคร ปทุมธานี', la: 'ນະວະນະຄອນ ປະທຸມທານີ' },
        region: 'Central',
        workers: 550,
        clients: 10,
        position: { x: 52, y: 42 } // North of Bangkok
    },
    {
        id: 'amata-rayong',
        name: { th: 'อมตะซิตี้ ระยอง', la: 'ອະມະຕະຊິຕີ້ ຣະຍອງ' },
        region: 'EEC',
        workers: 680,
        clients: 9,
        position: { x: 82, y: 58 } // Rayong
    },
    {
        id: 'eastern-seaboard',
        name: { th: 'อีสเทิร์นซีบอร์ด ระยอง', la: 'ອີສເທີນຊີບອດ ຣະຍອງ' },
        region: 'EEC',
        workers: 420,
        clients: 7,
        position: { x: 85, y: 62 } // Rayong coast
    },
    {
        id: 'gateway-city',
        name: { th: 'เกตเวย์ซิตี้ ฉะเชิงเทรา', la: 'ເກດເວຊິຕີ້ ສະເຊີງເຊົາ' },
        region: 'EEC',
        workers: 380,
        clients: 5,
        position: { x: 75, y: 50 }
    },
    {
        id: 'saha-rattana',
        name: { th: 'สหรัตนนคร ชลบุรี', la: 'ສະຫະຣັດຕະນະນະຄອນ ຊົນບຸລີ' },
        region: 'EEC',
        workers: 290,
        clients: 4,
        position: { x: 80, y: 52 }
    },
    {
        id: 'pinthong',
        name: { th: 'ปิ่นทอง ชลบุรี', la: 'ປີ່ນທອງ ຊົນບຸລີ' },
        region: 'EEC',
        workers: 350,
        clients: 6,
        position: { x: 76, y: 56 }
    }
]

export function CoverageMapSection() {
    const locale = useLocale() as 'th' | 'la'
    const [selectedEstate, setSelectedEstate] = useState<string | null>(null)
    const [hoveredEstate, setHoveredEstate] = useState<string | null>(null)

    const totalWorkers = INDUSTRIAL_ESTATES.reduce((sum, e) => sum + e.workers, 0)
    const totalClients = INDUSTRIAL_ESTATES.reduce((sum, e) => sum + e.clients, 0)

    const selectedData = INDUSTRIAL_ESTATES.find(e => e.id === selectedEstate)

    return (
        <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden" id="coverage">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <MapPin className="w-4 h-4" />
                        Strategic Coverage
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {locale === 'th' ? 'เครือข่ายครอบคลุมทั่วประเทศ' : 'ເຄືອຂ່າຍຄວບຄຸມທົ່ວປະເທດ'}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {locale === 'th'
                            ? 'V-GROUP ให้บริการครอบคลุมนิคมอุตสาหกรรมหลักทั่วประเทศไทย พร้อมส่งมอบแรงงานถึงที่ รวดเร็ว ทันใจ'
                            : 'V-GROUP ໃຫ້ບໍລິການຄວບຄຸມນິຄົມອຸດສາຫະກຳຫຼັກທົ່ວປະເທດໄທ'
                        }
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Map */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        {/* SVG Map Container */}
                        <div className="relative aspect-[4/5] bg-slate-800/50 rounded-3xl border border-slate-700 p-8">
                            {/* Thailand outline (simplified) */}
                            <svg
                                viewBox="0 0 100 120"
                                className="w-full h-full"
                                style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))' }}
                            >
                                {/* Simplified Thailand shape */}
                                <path
                                    d="M45,5 L55,5 L60,15 L65,25 L70,30 L75,35 L80,45 L85,55 L90,65 L85,75 L80,85 L75,95 L70,105 L60,110 L55,115 L50,110 L45,105 L40,100 L35,90 L30,80 L25,70 L20,60 L25,50 L30,40 L35,30 L40,20 Z"
                                    fill="rgba(59, 130, 246, 0.1)"
                                    stroke="rgba(59, 130, 246, 0.3)"
                                    strokeWidth="0.5"
                                />

                                {/* Bangkok/EEC highlight area */}
                                <ellipse
                                    cx="70"
                                    cy="55"
                                    rx="20"
                                    ry="15"
                                    fill="rgba(34, 211, 238, 0.1)"
                                    stroke="rgba(34, 211, 238, 0.3)"
                                    strokeWidth="0.5"
                                    strokeDasharray="2,2"
                                />
                                <text x="70" y="70" fontSize="3" fill="rgba(34, 211, 238, 0.6)" textAnchor="middle">EEC Zone</text>
                            </svg>

                            {/* Estate Markers */}
                            {INDUSTRIAL_ESTATES.map((estate) => (
                                <motion.button
                                    key={estate.id}
                                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all ${selectedEstate === estate.id || hoveredEstate === estate.id
                                            ? 'scale-150'
                                            : 'scale-100'
                                        }`}
                                    style={{
                                        left: `${estate.position.x}%`,
                                        top: `${estate.position.y}%`
                                    }}
                                    onClick={() => setSelectedEstate(estate.id === selectedEstate ? null : estate.id)}
                                    onMouseEnter={() => setHoveredEstate(estate.id)}
                                    onMouseLeave={() => setHoveredEstate(null)}
                                    whileHover={{ scale: 1.5 }}
                                    whileTap={{ scale: 1.2 }}
                                >
                                    <div className={`w-4 h-4 rounded-full ${selectedEstate === estate.id
                                            ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                                            : 'bg-blue-500 shadow-md shadow-blue-500/30'
                                        }`}>
                                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" />
                                    </div>
                                </motion.button>
                            ))}

                            {/* Hover Tooltip */}
                            <AnimatePresence>
                                {hoveredEstate && !selectedEstate && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute bg-slate-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-20"
                                        style={{
                                            left: `${INDUSTRIAL_ESTATES.find(e => e.id === hoveredEstate)?.position.x}%`,
                                            top: `${(INDUSTRIAL_ESTATES.find(e => e.id === hoveredEstate)?.position.y || 0) - 8}%`,
                                            transform: 'translateX(-50%)'
                                        }}
                                    >
                                        {INDUSTRIAL_ESTATES.find(e => e.id === hoveredEstate)?.name[locale]}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>{locale === 'th' ? 'นิคมอุตสาหกรรม' : 'ນິຄົມອຸດສາຫະກຳ'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-400" />
                                <span>{locale === 'th' ? 'เลือกอยู่' : 'ເລືອກຢູ່'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Stats Summary */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
                                <Factory className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                <p className="text-2xl font-bold text-white">{INDUSTRIAL_ESTATES.length}+</p>
                                <p className="text-xs text-slate-400">{locale === 'th' ? 'นิคมฯ' : 'ນິຄົມ'}</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
                                <Users className="w-6 h-6 mx-auto mb-2 text-green-400" />
                                <p className="text-2xl font-bold text-white">{totalWorkers.toLocaleString()}</p>
                                <p className="text-xs text-slate-400">{locale === 'th' ? 'แรงงาน' : 'ແຮງງານ'}</p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
                                <Building2 className="w-6 h-6 mx-auto mb-2 text-amber-400" />
                                <p className="text-2xl font-bold text-white">{totalClients}</p>
                                <p className="text-xs text-slate-400">{locale === 'th' ? 'บริษัท' : 'ບໍລິສັດ'}</p>
                            </div>
                        </div>

                        {/* Selected Estate Detail */}
                        <AnimatePresence mode="wait">
                            {selectedData ? (
                                <motion.div
                                    key={selectedData.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-cyan-500/30"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedData.name[locale]}</h3>
                                            <span className="text-xs text-cyan-400">{selectedData.region} Region</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-800/50 rounded-xl p-4">
                                            <p className="text-2xl font-bold text-cyan-400">{selectedData.workers}</p>
                                            <p className="text-sm text-slate-400">{locale === 'th' ? 'แรงงานในพื้นที่' : 'ແຮງງານໃນພື້ນທີ່'}</p>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-xl p-4">
                                            <p className="text-2xl font-bold text-cyan-400">{selectedData.clients}</p>
                                            <p className="text-sm text-slate-400">{locale === 'th' ? 'บริษัทลูกค้า' : 'ບໍລິສັດລູກຄ້າ'}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 text-green-400 text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{locale === 'th' ? 'พร้อมรับแรงงานเพิ่มเติม' : 'ພ້ອມຮັບແຮງງານເພີ່ມເຕີມ'}</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700 text-center"
                                >
                                    <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                    <p className="text-slate-500">
                                        {locale === 'th'
                                            ? 'คลิกที่จุดบนแผนที่เพื่อดูรายละเอียด'
                                            : 'ຄລິກທີ່ຈຸດເທິງແຜນທີ່ເພື່ອເບິ່ງລາຍລະອຽດ'
                                        }
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Estate List */}
                        <div className="mt-6 max-h-[200px] overflow-y-auto pr-2 space-y-2">
                            {INDUSTRIAL_ESTATES.map((estate) => (
                                <button
                                    key={estate.id}
                                    onClick={() => setSelectedEstate(estate.id === selectedEstate ? null : estate.id)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${selectedEstate === estate.id
                                            ? 'bg-cyan-500/20 border border-cyan-500/30'
                                            : 'bg-slate-800/30 border border-slate-700 hover:bg-slate-700/50'
                                        }`}
                                >
                                    <span className="text-sm">{estate.name[locale]}</span>
                                    <span className="text-xs text-slate-400">{estate.workers} {locale === 'th' ? 'คน' : 'ຄົນ'}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
