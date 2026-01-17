'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import { BookOpen, ArrowRight, Calendar, Clock, Tag } from 'lucide-react'
import { Link } from '@/i18n/routing'

// Mock blog posts - in production, fetch from CMS/API
const BLOG_POSTS = [
    {
        id: 1,
        slug: 'mou-lao-labor-import-guide-2026',
        title: {
            th: 'คู่มือฉบับสมบูรณ์: การนำเข้าแรงงานลาว MOU ปี 2026',
            la: 'ຄູ່ມືສະບັບສົມບູນ: ການນຳເຂົ້າແຮງງານລາວ MOU ປີ 2026'
        },
        excerpt: {
            th: 'ทุกสิ่งที่คุณต้องรู้เกี่ยวกับขั้นตอน เอกสาร และระยะเวลาในการนำเข้าแรงงานลาวอย่างถูกกฎหมายตาม MOU',
            la: 'ທຸກຢ່າງທີ່ທ່ານຕ້ອງຮູ້ກ່ຽວກັບຂັ້ນຕອນ, ເອກະສານ ແລະ ໄລຍະເວລາໃນການນຳເຂົ້າແຮງງານລາວຢ່າງຖືກກົດໝາຍ'
        },
        category: { th: 'กฎหมาย', la: 'ກົດໝາຍ' },
        categoryColor: 'bg-blue-100 text-blue-700',
        image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
        date: '2026-01-15',
        readTime: 8
    },
    {
        id: 2,
        slug: 'ai-workforce-management-trends',
        title: {
            th: 'เทรนด์ AI ในการบริหารแรงงานโรงงาน 2026',
            la: 'ແນວໂນ້ມ AI ໃນການບໍລິຫານແຮງງານໂຮງງານ 2026'
        },
        excerpt: {
            th: 'ค้นพบว่า AI กำลังปฏิวัติการจัดการแรงงานในนิคมอุตสาหกรรมไทยอย่างไร และบริษัทของคุณจะได้ประโยชน์อย่างไร',
            la: 'ຄົ້ນພົບວ່າ AI ກຳລັງປະຕິວັດການຈັດການແຮງງານໃນນິຄົມອຸດສາຫະກຳໄທແນວໃດ'
        },
        category: { th: 'เทคโนโลยี', la: 'ເທັກໂນໂລຢີ' },
        categoryColor: 'bg-purple-100 text-purple-700',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
        date: '2026-01-10',
        readTime: 6
    },
    {
        id: 3,
        slug: 'lao-worker-culture-management',
        title: {
            th: 'การบริหารแรงงานลาว: เข้าใจวัฒนธรรมเพื่อความสำเร็จ',
            la: 'ການບໍລິຫານແຮງງານລາວ: ເຂົ້າໃຈວັດທະນະທຳເພື່ອຄວາມສຳເລັດ'
        },
        excerpt: {
            th: 'เรียนรู้วัฒนธรรมการทำงานของแรงงานลาว และวิธีสร้างสภาพแวดล้อมที่ดีเพื่อเพิ่มประสิทธิภาพและลดอัตราลาออก',
            la: 'ຮຽນຮູ້ວັດທະນະທຳການເຮັດວຽກຂອງແຮງງານລາວ ແລະ ວິທີສ້າງສະພາບແວດລ້ອມທີ່ດີ'
        },
        category: { th: 'บริหารจัดการ', la: 'ບໍລິຫານຈັດການ' },
        categoryColor: 'bg-green-100 text-green-700',
        image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
        date: '2026-01-05',
        readTime: 5
    }
]

export function KnowledgeHubSection() {
    const locale = useLocale() as 'th' | 'la'

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString(locale === 'th' ? 'th-TH' : 'lo-LA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <section className="py-24 bg-white" id="knowledge-hub">
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
                >
                    <div>
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
                            <BookOpen className="w-4 h-4" />
                            Knowledge Hub
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            {locale === 'th' ? 'บทความและความรู้' : 'ບົດຄວາມ ແລະ ຄວາມຮູ້'}
                        </h2>
                        <p className="text-gray-600 max-w-lg">
                            {locale === 'th'
                                ? 'อัปเดตกฎหมาย ความรู้ และแนวทางปฏิบัติในการบริหารแรงงานลาว'
                                : 'ອັບເດດກົດໝາຍ, ຄວາມຮູ້ ແລະ ແນວທາງປະຕິບັດໃນການບໍລິຫານແຮງງານລາວ'
                            }
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mt-4 md:mt-0"
                    >
                        {locale === 'th' ? 'ดูทั้งหมด' : 'ເບິ່ງທັງໝົດ'}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                        >
                            {/* Image */}
                            <div className="aspect-video overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title[locale]}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Category */}
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${post.categoryColor}`}>
                                    <Tag className="w-3 h-3" />
                                    {post.category[locale]}
                                </span>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                    <Link href={`/blog/${post.slug}`}>
                                        {post.title[locale]}
                                    </Link>
                                </h3>

                                {/* Excerpt */}
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                    {post.excerpt[locale]}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(post.date)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.readTime} {locale === 'th' ? 'นาที' : 'ນາທີ'}
                                    </span>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* Mobile CTA */}
                <div className="md:hidden text-center mt-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {locale === 'th' ? 'ดูบทความทั้งหมด' : 'ເບິ່ງບົດຄວາມທັງໝົດ'}
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
