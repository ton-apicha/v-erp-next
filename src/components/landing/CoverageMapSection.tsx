'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import { MapPin, Factory, Users, Building2, CheckCircle, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map to avoid SSR issues
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
const Popup = dynamic(
    () => import('react-leaflet').then(mod => mod.Popup),
    { ssr: false }
)

// Industrial Estates Data with real GPS coordinates
const INDUSTRIAL_ESTATES = [
    // Samut Prakan
    {
        id: 'bangpu',
        name: { th: 'นิคมฯ บางปู สมุทรปราการ', la: 'ນິຄົມ ບາງປູ ສະໝຸດປຣາການ' },
        region: 'Samut Prakan',
        workers: 720,
        clients: 15,
        lat: 13.5165,
        lng: 100.6730
    },
    {
        id: 'bangplee',
        name: { th: 'นิคมฯ บางพลี สมุทรปราการ', la: 'ນິຄົມ ບາງພລີ ສະໝຸດປຣາການ' },
        region: 'Samut Prakan',
        workers: 580,
        clients: 11,
        lat: 13.5970,
        lng: 100.7520
    },
    // Samut Sakhon
    {
        id: 'samut-sakhon',
        name: { th: 'นิคมฯ สมุทรสาคร', la: 'ນິຄົມ ສະໝຸດສາຄອນ' },
        region: 'Samut Sakhon',
        workers: 650,
        clients: 13,
        lat: 13.5470,
        lng: 100.2740
    },
    {
        id: 'omnoi',
        name: { th: 'นิคมฯ อ้อมน้อย สมุทรสาคร', la: 'ນິຄົມ ອ້ອມນ້ອຍ ສະໝຸດສາຄອນ' },
        region: 'Samut Sakhon',
        workers: 420,
        clients: 8,
        lat: 13.7140,
        lng: 100.2350
    },
    // EEC Region
    {
        id: 'amata-city',
        name: { th: 'อมตะซิตี้ ชลบุรี', la: 'ອະມະຕະຊິຕີ້ ຊົນບຸລີ' },
        region: 'EEC',
        workers: 850,
        clients: 12,
        lat: 13.2958,
        lng: 101.1248
    },
    {
        id: 'amata-rayong',
        name: { th: 'อมตะซิตี้ ระยอง', la: 'ອະມະຕະຊິຕີ້ ຣະຍອງ' },
        region: 'EEC',
        workers: 680,
        clients: 9,
        lat: 12.9236,
        lng: 101.2925
    },
    {
        id: 'eastern-seaboard',
        name: { th: 'อีสเทิร์นซีบอร์ด ระยอง', la: 'ອີສເທີນຊີບອດ ຣະຍອງ' },
        region: 'EEC',
        workers: 520,
        clients: 7,
        lat: 12.7697,
        lng: 101.1449
    },
    // Central
    {
        id: 'rojana',
        name: { th: 'นิคมฯ โรจนะ อยุธยา', la: 'ນິຄົມ ໂຣຈະນະ ອະຍຸດທະຍາ' },
        region: 'Central',
        workers: 620,
        clients: 8,
        lat: 14.2078,
        lng: 100.6275
    },
    {
        id: 'nava-nakorn',
        name: { th: 'นวนคร ปทุมธานี', la: 'ນະວະນະຄອນ ປະທຸມທານີ' },
        region: 'Central',
        workers: 550,
        clients: 10,
        lat: 14.1055,
        lng: 100.6048
    },
    {
        id: 'wellgrow',
        name: { th: 'เวลโกรว์ ฉะเชิงเทรา', la: 'ເວລໂກຣວ ສະເຊີງເຊົາ' },
        region: 'EEC',
        workers: 480,
        clients: 6,
        lat: 13.5670,
        lng: 101.0170
    }
]

export function CoverageMapSection() {
    const locale = useLocale() as 'th' | 'la'
    const [selectedEstate, setSelectedEstate] = useState<string | null>(null)
    const [isMapLoaded, setIsMapLoaded] = useState(false)

    const totalWorkers = INDUSTRIAL_ESTATES.reduce((sum, e) => sum + e.workers, 0)
    const totalClients = INDUSTRIAL_ESTATES.reduce((sum, e) => sum + e.clients, 0)

    const selectedData = INDUSTRIAL_ESTATES.find(e => e.id === selectedEstate)
    const regions = ['Samut Prakan', 'Samut Sakhon', 'EEC', 'Central']

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

    // Thailand center coordinates
    const thailandCenter: [number, number] = [13.5, 100.7]

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
                        <Navigation className="w-4 h-4" />
                        Strategic Coverage
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {locale === 'th' ? 'เครือข่ายครอบคลุมทั่วประเทศ' : 'ເຄືອຂ່າຍຄວບຄຸມທົ່ວປະເທດ'}
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        {locale === 'th'
                            ? 'V-GROUP ให้บริการครอบคลุมนิคมอุตสาหกรรมหลักทั่วประเทศไทย รวมถึงสมุทรปราการ สมุทรสาคร และเขต EEC'
                            : 'V-GROUP ໃຫ້ບໍລິການຄວບຄຸມນິຄົມອຸດສາຫະກຳຫຼັກທົ່ວປະເທດໄທ'
                        }
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Interactive Map */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="relative bg-slate-800/50 rounded-3xl border border-slate-700 overflow-hidden h-[500px]">
                            {isMapLoaded && typeof window !== 'undefined' && (
                                <MapContainer
                                    center={thailandCenter}
                                    zoom={8}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    {INDUSTRIAL_ESTATES.map((estate) => (
                                        <Marker
                                            key={estate.id}
                                            position={[estate.lat, estate.lng]}
                                            eventHandlers={{
                                                click: () => setSelectedEstate(estate.id)
                                            }}
                                        >
                                            <Popup>
                                                <div className="text-slate-900 p-1">
                                                    <h4 className="font-bold text-sm">{estate.name[locale]}</h4>
                                                    <p className="text-xs text-slate-600">{estate.region}</p>
                                                    <div className="flex gap-4 mt-2 text-xs">
                                                        <span><strong>{estate.workers}</strong> {locale === 'th' ? 'คน' : 'ຄົນ'}</span>
                                                        <span><strong>{estate.clients}</strong> {locale === 'th' ? 'บริษัท' : 'ບໍລິສັດ'}</span>
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            )}
                            {!isMapLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                    <div className="text-slate-400">Loading map...</div>
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-sm text-slate-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-400" />
                                <span>{locale === 'th' ? 'คลิกที่หมุดเพื่อดูรายละเอียด' : 'ຄລິກທີ່ໝຸດເພື່ອເບິ່ງລາຍລະອຽດ'}</span>
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
                                    className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-cyan-500/30 mb-6"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedData.name[locale]}</h3>
                                            <span className="text-xs text-cyan-400">{selectedData.region}</span>
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
                                    className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700 text-center mb-6"
                                >
                                    <MapPin className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                                    <p className="text-slate-500 text-sm">
                                        {locale === 'th'
                                            ? 'เลือกนิคมจากแผนที่หรือรายการด้านล่าง'
                                            : 'ເລືອກນິຄົມຈາກແຜນທີ່ຫຼືລາຍການດ້ານລຸ່ມ'
                                        }
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Grouped Estate List */}
                        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
                            {regions.map(region => {
                                const regionEstates = INDUSTRIAL_ESTATES.filter(e => e.region === region)
                                if (regionEstates.length === 0) return null

                                return (
                                    <div key={region}>
                                        <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${region === 'Samut Prakan' || region === 'Samut Sakhon'
                                                ? 'text-amber-400'
                                                : 'text-blue-400'
                                            }`}>
                                            {region === 'Samut Prakan' ? (locale === 'th' ? '📍 สมุทรปราการ' : '📍 ສະໝຸດປຣາການ') :
                                                region === 'Samut Sakhon' ? (locale === 'th' ? '📍 สมุทรสาคร' : '📍 ສະໝຸດສາຄອນ') :
                                                    region === 'EEC' ? '📍 EEC (Eastern Economic Corridor)' :
                                                        (locale === 'th' ? '📍 ภาคกลาง' : '📍 ພາກກາງ')}
                                        </h4>
                                        <div className="space-y-1">
                                            {regionEstates.map(estate => (
                                                <button
                                                    key={estate.id}
                                                    onClick={() => setSelectedEstate(estate.id === selectedEstate ? null : estate.id)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all text-sm ${selectedEstate === estate.id
                                                            ? 'bg-cyan-500/20 border border-cyan-500/30'
                                                            : 'bg-slate-800/30 border border-slate-700 hover:bg-slate-700/50'
                                                        }`}
                                                >
                                                    <span>{estate.name[locale]}</span>
                                                    <span className="text-xs text-slate-400">{estate.workers} {locale === 'th' ? 'คน' : 'ຄົນ'}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
