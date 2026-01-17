'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Loader2, Save, Search } from 'lucide-react'

interface FAQ {
    id: string
    questionTH: string
    questionLA?: string
    answerTH: string
    answerLA?: string
    category?: string
    order: number
    isActive: boolean
}

export default function FAQPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        questionTH: '',
        questionLA: '',
        answerTH: '',
        answerLA: '',
        category: ''
    })

    useEffect(() => {
        params.then(p => setLocale(p.locale))
        fetchFAQs()
    }, [params])

    const fetchFAQs = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cms/faq')
            const data = await res.json()
            setFaqs(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching FAQs:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveFAQ = async () => {
        if (!formData.questionTH || !formData.answerTH) return

        setSaving(true)
        try {
            if (editingId) {
                await fetch(`/api/admin/cms/faq/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            } else {
                await fetch('/api/admin/cms/faq', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }
            setShowForm(false)
            setEditingId(null)
            setFormData({ questionTH: '', questionLA: '', answerTH: '', answerLA: '', category: '' })
            fetchFAQs()
        } catch (error) {
            console.error('Error saving FAQ:', error)
        } finally {
            setSaving(false)
        }
    }

    const deleteFAQ = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return

        try {
            await fetch(`/api/admin/cms/faq/${id}`, { method: 'DELETE' })
            fetchFAQs()
        } catch (error) {
            console.error('Error deleting FAQ:', error)
        }
    }

    const editFAQ = (faq: FAQ) => {
        setFormData({
            questionTH: faq.questionTH,
            questionLA: faq.questionLA || '',
            answerTH: faq.answerTH,
            answerLA: faq.answerLA || '',
            category: faq.category || ''
        })
        setEditingId(faq.id)
        setShowForm(true)
    }

    const toggleActive = async (faq: FAQ) => {
        try {
            await fetch(`/api/admin/cms/faq/${faq.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...faq, isActive: !faq.isActive })
            })
            fetchFAQs()
        } catch (error) {
            console.error('Error toggling FAQ:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">FAQ Management</h1>
                    <p className="text-slate-600 text-sm mt-1">
                        {locale === 'la' ? 'ຈັດການຄຳຖາມທີ່ພົບເລື້ອຍ' : 'Manage frequently asked questions'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true)
                        setEditingId(null)
                        setFormData({ questionTH: '', questionLA: '', answerTH: '', answerLA: '', category: '' })
                    }}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {locale === 'la' ? 'ເພີ່ມ FAQ' : 'Add FAQ'}
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? 'Edit FAQ' : 'New FAQ'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Question (Thai) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.questionTH}
                                    onChange={(e) => setFormData({ ...formData, questionTH: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Question (Lao)
                                </label>
                                <input
                                    type="text"
                                    value={formData.questionLA}
                                    onChange={(e) => setFormData({ ...formData, questionLA: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Answer (Thai) *
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.answerTH}
                                    onChange={(e) => setFormData({ ...formData, answerTH: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Answer (Lao)
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.answerLA}
                                    onChange={(e) => setFormData({ ...formData, answerLA: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value="">None</option>
                                    <option value="general">General</option>
                                    <option value="legal">Legal</option>
                                    <option value="service">Service</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveFAQ}
                                disabled={saving || !formData.questionTH || !formData.answerTH}
                                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FAQ List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    </div>
                ) : faqs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No FAQs found
                    </div>
                ) : (
                    faqs.map((faq, index) => (
                        <div key={faq.id} className="p-4 hover:bg-slate-50 flex items-start gap-4">
                            <div className="text-slate-400 cursor-move">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-slate-900">{faq.questionTH}</p>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{faq.answerTH}</p>
                                {faq.category && (
                                    <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                                        {faq.category}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(faq)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${faq.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    {faq.isActive ? 'Active' : 'Hidden'}
                                </button>
                                <button
                                    onClick={() => editFAQ(faq)}
                                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteFAQ(faq.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
