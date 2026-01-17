'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react'
import { DEFAULT_FAQS, getFAQSchema } from '@/lib/seo-schema'

export function FAQSection() {
    const locale = useLocale() as 'th' | 'la'
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = DEFAULT_FAQS[locale] || DEFAULT_FAQS.th

    // Generate JSON-LD schema
    const schemaData = getFAQSchema(faqs)

    return (
        <section className="py-24 bg-gradient-to-b from-slate-50 to-white" id="faq">
            {/* JSON-LD Schema for AEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
            />

            <div className="max-w-4xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <HelpCircle className="w-4 h-4" />
                        คำถามที่พบบ่อย
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        {locale === 'th' ? 'คำถามที่พบบ่อย' : 'ຄຳຖາມທີ່ພົບເລື້ອຍ'}
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        {locale === 'th'
                            ? 'รวมคำตอบสำหรับคำถามที่ลูกค้าถามบ่อยเกี่ยวกับการนำเข้าแรงงานลาว'
                            : 'ລວມຄຳຕອບສຳລັບຄຳຖາມທີ່ລູກຄ້າຖາມເລື້ອຍກ່ຽວກັບການນຳເຂົ້າແຮງງານລາວ'
                        }
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left gap-4"
                            >
                                <span className="font-semibold text-slate-900 text-lg">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-400 transition-transform shrink-0 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-slate-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 text-center"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                        <MessageCircle className="w-10 h-10 mx-auto mb-4 opacity-80" />
                        <h3 className="text-xl font-bold mb-2">
                            {locale === 'th' ? 'ยังมีคำถามอื่นอีกไหม?' : 'ຍັງມີຄຳຖາມອື່ນອີກບໍ່?'}
                        </h3>
                        <p className="text-blue-100 mb-6 max-w-md mx-auto">
                            {locale === 'th'
                                ? 'ทีมผู้เชี่ยวชาญของเราพร้อมให้คำปรึกษาฟรี 24 ชั่วโมง'
                                : 'ທີມຜູ້ຊ່ຽວຊານຂອງເຮົາພ້ອມໃຫ້ຄຳປຶກສາຟຣີ 24 ຊົ່ວໂມງ'
                            }
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="tel:+6621234567"
                                className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
                            >
                                📞 02-123-4567
                            </a>
                            <a
                                href="https://line.me/ti/p/@vgroup"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#00B900] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#009900] transition-colors"
                            >
                                💬 LINE: @vgroup
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
