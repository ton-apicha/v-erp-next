'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale } from 'next-intl'
import {
    Calculator, Factory, UtensilsCrossed, Cpu, Truck, Building2,
    Users, Calendar, ArrowRight, ArrowLeft, Sparkles, Phone, Mail,
    CheckCircle, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Industry types with base pricing
const INDUSTRIES = [
    { id: 'manufacturing', icon: Factory, name: { th: 'อุตสาหกรรมการผลิต', la: 'ອຸດສາຫະກຳການຜະລິດ' }, priceMultiplier: 1.0 },
    { id: 'food', icon: UtensilsCrossed, name: { th: 'อุตสาหกรรมอาหาร', la: 'ອຸດສາຫະກຳອາຫານ' }, priceMultiplier: 1.1 },
    { id: 'electronics', icon: Cpu, name: { th: 'อิเล็กทรอนิกส์', la: 'ອີເລັກໂຕຣນິກ' }, priceMultiplier: 1.2 },
    { id: 'logistics', icon: Truck, name: { th: 'โลจิสติกส์', la: 'ໂລຈິສຕິກ' }, priceMultiplier: 0.9 },
    { id: 'construction', icon: Building2, name: { th: 'ก่อสร้าง', la: 'ກໍ່ສ້າງ' }, priceMultiplier: 0.85 },
]

// Contract durations
const DURATIONS = [
    { months: 12, discount: 0, label: { th: '1 ปี', la: '1 ປີ' } },
    { months: 24, discount: 0.05, label: { th: '2 ปี (ลด 5%)', la: '2 ປີ (ຫຼຸດ 5%)' } },
    { months: 36, discount: 0.10, label: { th: '3 ปี (ลด 10%)', la: '3 ປີ (ຫຼຸດ 10%)' } },
    { months: 48, discount: 0.15, label: { th: '4 ปี (ลด 15%)', la: '4 ປີ (ຫຼຸດ 15%)' } },
]

// Base cost per worker
const BASE_COST_PER_WORKER = 18000 // THB

export function WorkforceCalculator() {
    const locale = useLocale() as 'th' | 'la'
    const [step, setStep] = useState(1)
    const [industry, setIndustry] = useState<string | null>(null)
    const [workerCount, setWorkerCount] = useState(50)
    const [duration, setDuration] = useState(24)
    const [contactInfo, setContactInfo] = useState({ name: '', phone: '', email: '', company: '' })
    const [showResult, setShowResult] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Calculate estimated cost
    const calculateCost = () => {
        const selectedIndustry = INDUSTRIES.find(i => i.id === industry)
        const selectedDuration = DURATIONS.find(d => d.months === duration)

        if (!selectedIndustry || !selectedDuration) return 0

        const baseCost = BASE_COST_PER_WORKER * workerCount * selectedIndustry.priceMultiplier
        const discount = baseCost * selectedDuration.discount
        return Math.round(baseCost - discount)
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        // Simulate API call - in production, send to backend/LINE Notify
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSubmitting(false)
        setSubmitted(true)
    }

    const totalCost = calculateCost()
    const selectedIndustry = INDUSTRIES.find(i => i.id === industry)
    const selectedDuration = DURATIONS.find(d => d.months === duration)

    const texts = {
        th: {
            title: 'คำนวณต้นทุนแรงงาน',
            subtitle: 'ประเมินงบประมาณเบื้องต้นสำหรับการนำเข้าแรงงานลาว',
            step1: 'เลือกประเภทอุตสาหกรรม',
            step2: 'จำนวนแรงงานและระยะเวลา',
            step3: 'ข้อมูลติดต่อ',
            workerLabel: 'จำนวนแรงงานที่ต้องการ',
            durationLabel: 'ระยะเวลาสัญญา',
            resultTitle: 'ประมาณการต้นทุน',
            resultNote: 'ราคานี้เป็นการประเมินเบื้องต้น ราคาจริงอาจแตกต่างตามรายละเอียดความต้องการ',
            submitBtn: 'ขอใบเสนอราคา',
            submitting: 'กำลังส่ง...',
            submitted: 'ขอบคุณครับ! เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง',
            next: 'ถัดไป',
            back: 'ย้อนกลับ',
            workers: 'คน',
            perWorker: 'ต่อคน',
            total: 'รวมทั้งหมด'
        },
        la: {
            title: 'ຄິດໄລ່ຄ່າໃຊ້ຈ່າຍແຮງງານ',
            subtitle: 'ປະເມີນງົບປະມານເບື້ອງຕົ້ນສຳລັບການນຳເຂົ້າແຮງງານລາວ',
            step1: 'ເລືອກປະເພດອຸດສາຫະກຳ',
            step2: 'ຈຳນວນແຮງງານ ແລະ ໄລຍະເວລາ',
            step3: 'ຂໍ້ມູນຕິດຕໍ່',
            workerLabel: 'ຈຳນວນແຮງງານທີ່ຕ້ອງການ',
            durationLabel: 'ໄລຍະເວລາສັນຍາ',
            resultTitle: 'ປະມານການຄ່າໃຊ້ຈ່າຍ',
            resultNote: 'ລາຄານີ້ເປັນການປະເມີນເບື້ອງຕົ້ນ',
            submitBtn: 'ຂໍໃບສະເໜີລາຄາ',
            submitting: 'ກຳລັງສົ່ງ...',
            submitted: 'ຂອບໃຈ! ເຈົ້າໜ້າທີ່ຈະຕິດຕໍ່ກັບພາຍໃນ 24 ຊົ່ວໂມງ',
            next: 'ຕໍ່ໄປ',
            back: 'ກັບຄືນ',
            workers: 'ຄົນ',
            perWorker: 'ຕໍ່ຄົນ',
            total: 'ລວມທັງໝົດ'
        }
    }
    const t = texts[locale]

    return (
        <section className="py-24 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white" id="calculator">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <Calculator className="w-4 h-4" />
                        AI Cost Estimator
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t.title}
                    </h2>
                    <p className="text-blue-200 max-w-2xl mx-auto">
                        {t.subtitle}
                    </p>
                </motion.div>

                {/* Calculator Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-2xl"
                >
                    {/* Progress Steps */}
                    <div className="flex justify-between items-center mb-8">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-cyan-500 text-white' : 'bg-white/20 text-white/50'
                                    }`}>
                                    {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                </div>
                                {s < 3 && (
                                    <div className={`w-20 md:w-32 h-1 mx-2 rounded ${step > s ? 'bg-cyan-500' : 'bg-white/20'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Step 1: Industry Selection */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h3 className="text-xl font-bold mb-6">{t.step1}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {INDUSTRIES.map(ind => (
                                        <button
                                            key={ind.id}
                                            onClick={() => setIndustry(ind.id)}
                                            className={`p-4 rounded-xl border-2 transition-all ${industry === ind.id
                                                    ? 'border-cyan-500 bg-cyan-500/20'
                                                    : 'border-white/20 hover:border-white/40'
                                                }`}
                                        >
                                            <ind.icon className={`w-8 h-8 mx-auto mb-3 ${industry === ind.id ? 'text-cyan-400' : 'text-white/60'
                                                }`} />
                                            <p className="text-sm font-medium">{ind.name[locale]}</p>
                                        </button>
                                    ))}
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <Button
                                        onClick={() => setStep(2)}
                                        disabled={!industry}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                    >
                                        {t.next} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Worker Count & Duration */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h3 className="text-xl font-bold mb-6">{t.step2}</h3>

                                {/* Worker Count Slider */}
                                <div className="mb-8">
                                    <label className="block text-sm text-blue-200 mb-2">
                                        {t.workerLabel}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="10"
                                            max="500"
                                            step="10"
                                            value={workerCount}
                                            onChange={(e) => setWorkerCount(Number(e.target.value))}
                                            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                        <div className="bg-cyan-500 px-4 py-2 rounded-lg font-bold min-w-[100px] text-center">
                                            <Users className="w-4 h-4 inline mr-2" />
                                            {workerCount} {t.workers}
                                        </div>
                                    </div>
                                </div>

                                {/* Duration Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm text-blue-200 mb-2">
                                        {t.durationLabel}
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {DURATIONS.map(d => (
                                            <button
                                                key={d.months}
                                                onClick={() => setDuration(d.months)}
                                                className={`p-3 rounded-xl border-2 transition-all ${duration === d.months
                                                        ? 'border-cyan-500 bg-cyan-500/20'
                                                        : 'border-white/20 hover:border-white/40'
                                                    }`}
                                            >
                                                <Calendar className="w-5 h-5 mx-auto mb-2 text-white/60" />
                                                <p className="text-sm font-medium">{d.label[locale]}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cost Preview */}
                                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-6 mb-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-200 text-sm">{t.resultTitle}</p>
                                            <p className="text-3xl font-bold text-white mt-1">
                                                ฿{totalCost.toLocaleString()}
                                            </p>
                                            <p className="text-cyan-400 text-sm">
                                                ≈ ฿{Math.round(totalCost / workerCount).toLocaleString()} {t.perWorker}
                                            </p>
                                        </div>
                                        <Sparkles className="w-12 h-12 text-cyan-400 opacity-50" />
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        onClick={() => setStep(1)}
                                        variant="outline"
                                        className="border-white/40 text-white hover:bg-white/10"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
                                    </Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                                    >
                                        {t.next} <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Contact Info */}
                        {step === 3 && !submitted && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h3 className="text-xl font-bold mb-6">{t.step3}</h3>

                                <div className="grid md:grid-cols-2 gap-4 mb-6">
                                    <input
                                        type="text"
                                        placeholder={locale === 'th' ? 'ชื่อ-นามสกุล' : 'ຊື່-ນາມສະກຸນ'}
                                        value={contactInfo.name}
                                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder={locale === 'th' ? 'บริษัท/โรงงาน' : 'ບໍລິສັດ/ໂຮງງານ'}
                                        value={contactInfo.company}
                                        onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
                                    />
                                    <input
                                        type="tel"
                                        placeholder={locale === 'th' ? 'เบอร์โทรศัพท์' : 'ເບີໂທລະສັບ'}
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={contactInfo.email}
                                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                        className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500"
                                    />
                                </div>

                                {/* Summary */}
                                <div className="bg-white/5 rounded-xl p-4 mb-6 text-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-blue-200">{locale === 'th' ? 'อุตสาหกรรม' : 'ອຸດສາຫະກຳ'}</span>
                                        <span className="font-medium">{selectedIndustry?.name[locale]}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-blue-200">{locale === 'th' ? 'จำนวน' : 'ຈຳນວນ'}</span>
                                        <span className="font-medium">{workerCount} {t.workers}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-blue-200">{locale === 'th' ? 'สัญญา' : 'ສັນຍາ'}</span>
                                        <span className="font-medium">{selectedDuration?.label[locale]}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-white/10 text-lg">
                                        <span className="text-blue-200">{t.total}</span>
                                        <span className="font-bold text-cyan-400">฿{totalCost.toLocaleString()}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-blue-300 mb-6">{t.resultNote}</p>

                                <div className="flex justify-between">
                                    <Button
                                        onClick={() => setStep(2)}
                                        variant="outline"
                                        className="border-white/40 text-white hover:bg-white/10"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> {t.back}
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!contactInfo.name || !contactInfo.phone || isSubmitting}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                                    >
                                        {isSubmitting ? t.submitting : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                {t.submitBtn}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* Success State */}
                        {submitted && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{t.submitted}</h3>
                                <p className="text-blue-200 max-w-md mx-auto mb-6">
                                    {locale === 'th'
                                        ? 'ทีมงาน V-GROUP จะติดต่อท่านพร้อมใบเสนอราคาภายใน 24 ชั่วโมง'
                                        : 'ທີມງານ V-GROUP ຈະຕິດຕໍ່ທ່ານພ້ອມໃບສະເໜີລາຄາພາຍໃນ 24 ຊົ່ວໂມງ'
                                    }
                                </p>
                                <div className="flex justify-center gap-4">
                                    <a href="tel:+6621234567" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                                        <Phone className="w-4 h-4" /> 02-123-4567
                                    </a>
                                    <a href="mailto:contact@v-group.la" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300">
                                        <Mail className="w-4 h-4" /> contact@v-group.la
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    )
}
