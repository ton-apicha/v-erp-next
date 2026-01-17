'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { ArrowLeft, Loader2, Save, Eye, Globe } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'

interface BlogFormProps {
    locale: string
    slug?: string
    initialData?: {
        titleTH: string
        titleLA?: string
        excerptTH?: string
        excerptLA?: string
        contentTH: string
        contentLA?: string
        coverImage?: string
        category?: string
        tags?: string[]
        isPublished: boolean
        isFeatured: boolean
    }
}

const CATEGORIES = [
    { value: 'news', labelTH: 'ข่าวสาร', labelLA: 'ຂ່າວ' },
    { value: 'law', labelTH: 'กฎหมาย', labelLA: 'ກົດໝາຍ' },
    { value: 'tech', labelTH: 'เทคโนโลยี', labelLA: 'ເທັກໂນໂລຢີ' },
    { value: 'tips', labelTH: 'เคล็ดลับ', labelLA: 'ຄຳແນະນຳ' },
]

export function BlogForm({ locale, slug, initialData }: BlogFormProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'th' | 'la'>('th')
    const [formData, setFormData] = useState({
        titleTH: initialData?.titleTH || '',
        titleLA: initialData?.titleLA || '',
        excerptTH: initialData?.excerptTH || '',
        excerptLA: initialData?.excerptLA || '',
        contentTH: initialData?.contentTH || '',
        contentLA: initialData?.contentLA || '',
        coverImage: initialData?.coverImage || '',
        category: initialData?.category || '',
        tags: initialData?.tags?.join(', ') || '',
        isPublished: initialData?.isPublished || false,
        isFeatured: initialData?.isFeatured || false,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.titleTH || !formData.contentTH) {
            alert(locale === 'la' ? 'ກະລຸນາກອກຫົວຂໍ້ແລະເນື້ອຫາ' : 'กรุณากรอกหัวข้อและเนื้อหา')
            return
        }

        setSaving(true)
        try {
            const body = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            }

            if (slug) {
                await fetch(`/api/admin/cms/blog/${slug}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch('/api/admin/cms/blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            router.push(`/${locale}/admin/cms/blog`)
        } catch (error) {
            console.error('Error saving post:', error)
            alert('Error saving post')
        } finally {
            setSaving(false)
        }
    }

    const texts = {
        title: locale === 'la' ? 'ຫົວຂໍ້' : 'หัวข้อ',
        excerpt: locale === 'la' ? 'ບົດຫຍໍ້' : 'บทคัดย่อ',
        content: locale === 'la' ? 'ເນື້ອຫາ' : 'เนื้อหา',
        coverImage: locale === 'la' ? 'ຮູບປົກ' : 'รูปปก',
        category: locale === 'la' ? 'ໝວດໝູ່' : 'หมวดหมู่',
        tags: locale === 'la' ? 'ແທັກ' : 'แท็ก',
        publish: locale === 'la' ? 'ເຜີຍແຜ່' : 'เผยแพร่',
        featured: locale === 'la' ? 'ແນະນຳ' : 'บทความแนะนำ',
        save: locale === 'la' ? 'ບັນທຶກ' : 'บันทึก',
        saving: locale === 'la' ? 'ກຳລັງບັນທຶກ...' : 'กำลังบันทึก...',
        back: locale === 'la' ? 'ກັບຄືນ' : 'กลับ',
        newPost: locale === 'la' ? 'ບົດຄວາມໃໝ່' : 'บทความใหม่',
        editPost: locale === 'la' ? 'ແກ້ໄຂບົດຄວາມ' : 'แก้ไขบทความ',
        thaiContent: locale === 'la' ? 'ພາສາໄທ' : 'ภาษาไทย',
        laoContent: locale === 'la' ? 'ພາສາລາວ' : 'ภาษาลาว',
        required: locale === 'la' ? '(ຕ້ອງກຳນົດ)' : '(จำเป็น)',
        optional: locale === 'la' ? '(ບໍ່ບັງຄັບ)' : '(ไม่บังคับ)',
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/cms/blog"
                        className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {slug ? texts.editPost : texts.newPost}
                        </h1>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? texts.saving : texts.save}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Language Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="flex border-b border-slate-200">
                            <button
                                type="button"
                                onClick={() => setActiveTab('th')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'th'
                                    ? 'bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                🇹🇭 {texts.thaiContent} {texts.required}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('la')}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${activeTab === 'la'
                                    ? 'bg-cyan-50 text-cyan-700 border-b-2 border-cyan-500'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                🇱🇦 {texts.laoContent} {texts.optional}
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {activeTab === 'th' ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.title} (ไทย) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.titleTH}
                                            onChange={(e) => setFormData({ ...formData, titleTH: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-lg"
                                            placeholder="หัวข้อบทความภาษาไทย"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.excerpt} (ไทย)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.excerptTH}
                                            onChange={(e) => setFormData({ ...formData, excerptTH: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                            placeholder="บทคัดย่อสั้นๆ สำหรับแสดงในรายการ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.content} (ไทย) *
                                        </label>
                                        <RichTextEditor
                                            content={formData.contentTH}
                                            onChange={(html) => setFormData({ ...formData, contentTH: html })}
                                            placeholder="เขียนเนื้อหาบทความภาษาไทย..."
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.title} (ລາວ)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.titleLA}
                                            onChange={(e) => setFormData({ ...formData, titleLA: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 text-lg"
                                            placeholder="ຫົວຂໍ້ບົດຄວາມພາສາລາວ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.excerpt} (ລາວ)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.excerptLA}
                                            onChange={(e) => setFormData({ ...formData, excerptLA: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                            placeholder="ບົດຫຍໍ້ສັ້ນໆ"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            {texts.content} (ລາວ)
                                        </label>
                                        <RichTextEditor
                                            content={formData.contentLA}
                                            onChange={(html) => setFormData({ ...formData, contentLA: html })}
                                            placeholder="ຂຽນເນື້ອຫາບົດຄວາມພາສາລາວ..."
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Eye className="w-5 h-5" />
                            {locale === 'la' ? 'ການເຜີຍແຜ່' : 'การเผยแพร่'}
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500"
                                />
                                <span className="text-slate-700">{texts.publish}</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500"
                                />
                                <span className="text-slate-700">{texts.featured}</span>
                            </label>
                        </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            {texts.category}
                        </h3>
                        <div className="space-y-4">
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value="">{locale === 'la' ? 'ເລືອກໝວດໝູ່' : 'เลือกหมวดหมู่'}</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {locale === 'la' ? cat.labelLA : cat.labelTH}
                                    </option>
                                ))}
                            </select>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {texts.tags}
                                </label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder={locale === 'la' ? 'ແທັກ1, ແທັກ2' : 'แท็ก1, แท็ก2'}
                                />
                                <p className="text-xs text-slate-400 mt-1">
                                    {locale === 'la' ? 'ແຍກດ້ວຍ ,' : 'คั่นด้วย ,'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Cover Image */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h3 className="font-semibold text-slate-900 mb-4">
                            {texts.coverImage}
                        </h3>
                        <input
                            type="text"
                            value={formData.coverImage}
                            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                            placeholder="https://..."
                        />
                        {formData.coverImage && (
                            <div className="mt-3">
                                <img
                                    src={formData.coverImage}
                                    alt="Cover preview"
                                    className="w-full h-32 object-cover rounded-xl"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </form>
    )
}
