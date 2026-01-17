'use client'

import { useState, useEffect } from 'react'
import { Eye, Search, Globe, Tag, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react'

interface SEOPreviewProps {
    title: string
    excerpt: string
    slug: string
    coverImage?: string
    category?: string
    tags?: string
    locale: string
}

interface SEOScore {
    score: number
    label: string
    color: string
    suggestions: string[]
}

export function SEOPreview({ title, excerpt, slug, coverImage, category, tags, locale }: SEOPreviewProps) {
    const [seoScore, setSeoScore] = useState<SEOScore>({ score: 0, label: '', color: '', suggestions: [] })

    useEffect(() => {
        calculateSEO()
    }, [title, excerpt, slug, coverImage, category, tags])

    const calculateSEO = () => {
        let score = 0
        const suggestions: string[] = []

        // Title checks (30 points max)
        if (title.length > 0) score += 10
        if (title.length >= 30 && title.length <= 60) {
            score += 20
        } else if (title.length > 0) {
            score += 10
            suggestions.push(locale === 'la' ? 'ຫົວຂໍ້ຄວນມີ 30-60 ຕົວອັກສອນ' : 'หัวข้อควรมี 30-60 ตัวอักษร')
        } else {
            suggestions.push(locale === 'la' ? 'ເພີ່ມຫົວຂໍ້' : 'เพิ่มหัวข้อ')
        }

        // Excerpt checks (25 points max)
        if (excerpt.length > 0) score += 10
        if (excerpt.length >= 100 && excerpt.length <= 160) {
            score += 15
        } else if (excerpt.length > 0) {
            score += 5
            suggestions.push(locale === 'la' ? 'ບົດຫຍໍ້ຄວນມີ 100-160 ຕົວອັກສອນ' : 'บทคัดย่อควรมี 100-160 ตัวอักษร')
        } else {
            suggestions.push(locale === 'la' ? 'ເພີ່ມບົດຫຍໍ້' : 'เพิ่มบทคัดย่อ')
        }

        // URL Slug (15 points)
        if (slug.length > 0) {
            score += 15
        } else {
            suggestions.push(locale === 'la' ? 'Slug ຈະຖືກສ້າງອັດຕະໂນມັດ' : 'Slug จะถูกสร้างอัตโนมัติ')
        }

        // Cover Image (15 points)
        if (coverImage) {
            score += 15
        } else {
            suggestions.push(locale === 'la' ? 'ເພີ່ມຮູບປົກ' : 'เพิ่มรูปปก')
        }

        // Category (10 points)
        if (category) {
            score += 10
        } else {
            suggestions.push(locale === 'la' ? 'ເລືອກໝວດໝູ່' : 'เลือกหมวดหมู่')
        }

        // Tags (5 points)
        if (tags && tags.length > 0) {
            score += 5
        }

        // Determine label and color
        let label = ''
        let color = ''
        if (score >= 80) {
            label = locale === 'la' ? 'ດີເລີດ' : 'ดีเยี่ยม'
            color = 'text-green-600 bg-green-100'
        } else if (score >= 60) {
            label = locale === 'la' ? 'ດີ' : 'ดี'
            color = 'text-cyan-600 bg-cyan-100'
        } else if (score >= 40) {
            label = locale === 'la' ? 'ປານກາງ' : 'ปานกลาง'
            color = 'text-amber-600 bg-amber-100'
        } else {
            label = locale === 'la' ? 'ຕ້ອງປັບປຸງ' : 'ต้องปรับปรุง'
            color = 'text-red-600 bg-red-100'
        }

        setSeoScore({ score, label, color, suggestions })
    }

    // Generate preview URL
    const previewUrl = `v-erp.itd.in.th/${locale}/blog/${slug || 'untitled'}`

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    {locale === 'la' ? 'ຕົວຢ່າງ SEO' : 'SEO Preview'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${seoScore.color}`}>
                    {seoScore.score}% {seoScore.label}
                </span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${seoScore.score >= 80 ? 'bg-green-500' :
                            seoScore.score >= 60 ? 'bg-cyan-500' :
                                seoScore.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${seoScore.score}%` }}
                />
            </div>

            {/* Google Preview */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {locale === 'la' ? 'ຕົວຢ່າງ Google' : 'ตัวอย่าง Google'}
                </p>
                <div className="space-y-1">
                    <p className="text-sm text-green-700 truncate">{previewUrl}</p>
                    <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer truncate">
                        {title || (locale === 'la' ? 'ຫົວຂໍ້ບົດຄວາມ' : 'หัวข้อบทความ')}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2">
                        {excerpt || (locale === 'la' ? 'ບົດຫຍໍ້ຈະສະແດງທີ່ນີ້...' : 'บทคัดย่อจะแสดงที่นี่...')}
                    </p>
                </div>
            </div>

            {/* Suggestions */}
            {seoScore.suggestions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        {locale === 'la' ? 'ຄຳແນະນຳ' : 'คำแนะนำ'}
                    </p>
                    <ul className="space-y-1">
                        {seoScore.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Checklist */}
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`flex items-center gap-2 ${title ? 'text-green-600' : 'text-slate-400'}`}>
                    {title ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {locale === 'la' ? 'ຫົວຂໍ້' : 'หัวข้อ'}
                </div>
                <div className={`flex items-center gap-2 ${excerpt ? 'text-green-600' : 'text-slate-400'}`}>
                    {excerpt ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {locale === 'la' ? 'ບົດຫຍໍ້' : 'บทคัดย่อ'}
                </div>
                <div className={`flex items-center gap-2 ${coverImage ? 'text-green-600' : 'text-slate-400'}`}>
                    {coverImage ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {locale === 'la' ? 'ຮູບປົກ' : 'รูปปก'}
                </div>
                <div className={`flex items-center gap-2 ${category ? 'text-green-600' : 'text-slate-400'}`}>
                    {category ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {locale === 'la' ? 'ໝວດໝູ່' : 'หมวดหมู่'}
                </div>
            </div>
        </div>
    )
}
