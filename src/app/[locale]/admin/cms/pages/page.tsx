'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/routing'
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    Loader2,
    LayoutTemplate,
    ExternalLink
} from 'lucide-react'

interface CmsPage {
    id: string
    slug: string
    titleTH: string
    titleLA?: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
    _count?: {
        sections: number
    }
}

export default function PagesListPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [pages, setPages] = useState<CmsPage[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editingPage, setEditingPage] = useState<CmsPage | null>(null)
    const [formData, setFormData] = useState({
        slug: '',
        titleTH: '',
        titleLA: '',
        isPublished: false
    })

    useEffect(() => {
        params.then(p => setLocale(p.locale))
    }, [params])

    useEffect(() => {
        fetchPages()
    }, [])

    const fetchPages = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cms/pages')
            const data = await res.json()
            setPages(data.data || [])
        } catch (error) {
            console.error('Error fetching pages:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingPage) {
                await fetch(`/api/admin/cms/pages/${editingPage.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            } else {
                await fetch('/api/admin/cms/pages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }
            setShowModal(false)
            setEditingPage(null)
            setFormData({ slug: '', titleTH: '', titleLA: '', isPublished: false })
            fetchPages()
        } catch (error) {
            console.error('Error saving page:', error)
        }
    }

    const deletePage = async (id: string) => {
        if (!confirm(locale === 'la' ? 'ລຶບໜ້ານີ້?' : 'ลบหน้านี้?')) return
        try {
            await fetch(`/api/admin/cms/pages/${id}`, { method: 'DELETE' })
            fetchPages()
        } catch (error) {
            console.error('Error deleting page:', error)
        }
    }

    const openEditModal = (page: CmsPage) => {
        setEditingPage(page)
        setFormData({
            slug: page.slug,
            titleTH: page.titleTH,
            titleLA: page.titleLA || '',
            isPublished: page.isPublished
        })
        setShowModal(true)
    }

    const openNewModal = () => {
        setEditingPage(null)
        setFormData({ slug: '', titleTH: '', titleLA: '', isPublished: false })
        setShowModal(true)
    }

    const texts = {
        title: locale === 'la' ? 'ໜ້າເວັບ' : 'หน้าเว็บ',
        subtitle: locale === 'la' ? 'ຈັດການໜ້າເວັບແລະ Sections' : 'จัดการหน้าเว็บและ Sections',
        newPage: locale === 'la' ? 'ສ້າງໜ້າໃໝ່' : 'สร้างหน้าใหม่',
        editPage: locale === 'la' ? 'ແກ້ໄຂໜ້າ' : 'แก้ไขหน้า',
        slug: 'Slug',
        titleTH: locale === 'la' ? 'ຊື່ (ໄທ)' : 'ชื่อ (ไทย)',
        titleLA: locale === 'la' ? 'ຊື່ (ລາວ)' : 'ชื่อ (ลาว)',
        publish: locale === 'la' ? 'ເຜີຍແຜ່' : 'เผยแพร่',
        save: locale === 'la' ? 'ບັນທຶກ' : 'บันทึก',
        cancel: locale === 'la' ? 'ຍົກເລີກ' : 'ยกเลิก',
        noPages: locale === 'la' ? 'ບໍ່ມີໜ້າເວັບ' : 'ไม่มีหน้าเว็บ',
        sections: locale === 'la' ? 'Sections' : 'Sections',
        published: locale === 'la' ? 'ເຜີຍແຜ່ແລ້ວ' : 'เผยแพร่แล้ว',
        draft: locale === 'la' ? 'ແບບຮ່າງ' : 'แบบร่าง',
        manageSections: locale === 'la' ? 'ຈັດການ Sections' : 'จัดการ Sections'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{texts.title}</h1>
                    <p className="text-slate-600 text-sm mt-1">{texts.subtitle}</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {texts.newPage}
                </button>
            </div>

            {/* Pages List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    </div>
                ) : pages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{texts.noPages}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {texts.title}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {texts.slug}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {texts.sections}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {locale === 'la' ? 'ສະຖານະ' : 'สถานะ'}
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                                    {locale === 'la' ? 'ການດຳເນີນການ' : 'ดำเนินการ'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pages.map((page) => (
                                <tr key={page.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <LayoutTemplate className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{page.titleTH}</p>
                                                {page.titleLA && (
                                                    <p className="text-xs text-slate-400">{page.titleLA}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        /{page.slug}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            {page._count?.sections || 0} sections
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {page.isPublished ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <Eye className="w-4 h-4" />
                                                {texts.published}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400 text-sm">
                                                <EyeOff className="w-4 h-4" />
                                                {texts.draft}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/cms/pages/${page.id}/sections`}
                                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                                                title={texts.manageSections}
                                            >
                                                <LayoutTemplate className="w-4 h-4" />
                                            </Link>
                                            <a
                                                href={`/${locale}/${page.slug}`}
                                                target="_blank"
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => openEditModal(page)}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deletePage(page.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {editingPage ? texts.editPage : texts.newPage}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {texts.slug} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="about-us"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {texts.titleTH} *
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleTH}
                                    onChange={(e) => setFormData({ ...formData, titleTH: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="เกี่ยวกับเรา"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    {texts.titleLA}
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleLA}
                                    onChange={(e) => setFormData({ ...formData, titleLA: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="ກ່ຽວກັບເຮົາ"
                                />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-500"
                                />
                                <span className="text-slate-700">{texts.publish}</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
                                >
                                    {texts.cancel}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600"
                                >
                                    {texts.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
