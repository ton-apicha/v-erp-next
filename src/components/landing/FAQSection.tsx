import React from 'react'
import { prisma } from '@/lib/prisma'
import { FAQClient } from './FAQClient'
import { getFAQSchema } from '@/lib/seo-schema'

interface FAQSectionProps {
    locale: 'th' | 'la'
}

export async function FAQSection({ locale }: FAQSectionProps) {
    // Fetch FAQs from CMS database
    const dbFaqs = await prisma.cmsFaq.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            questionTH: true,
            questionLA: true,
            answerTH: true,
            answerLA: true,
            category: true
        }
    })

    // Transform to locale-specific format
    const faqs = dbFaqs.map(faq => ({
        question: locale === 'la' ? (faq.questionLA || faq.questionTH) : faq.questionTH,
        answer: locale === 'la' ? (faq.answerLA || faq.answerTH) : faq.answerTH
    }))

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
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {locale === 'th' ? 'คำถามที่พบบ่อย' : 'ຄຳຖາມທີ່ພົບເລື້ອຍ'}
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
                </div>

                {/* Interactive FAQ Accordion - Client Component */}
                <FAQClient faqs={faqs} locale={locale} />

                {/* CTA */}
                <div className="mt-12 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                        <svg className="w-10 h-10 mx-auto mb-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
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
                </div>
            </div>
        </section>
    )
}
