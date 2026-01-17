'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface FAQ {
    question: string
    answer: string
}

interface FAQClientProps {
    faqs: FAQ[]
    locale: 'th' | 'la'
}

export function FAQClient({ faqs, locale }: FAQClientProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    if (faqs.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                {locale === 'th' ? 'ยังไม่มีคำถามที่พบบ่อย' : 'ຍັງບໍ່ມີຄຳຖາມທີ່ພົບເລື້ອຍ'}
            </div>
        )
    }

    return (
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
    )
}
