'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink, Loader2, Save, GripVertical } from 'lucide-react'

interface Partner {
    id: string
    name: string
    logoUrl: string
    websiteUrl?: string
    order: number
    isActive: boolean
}

export default function PartnersPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [partners, setPartners] = useState<Partner[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        logoUrl: '',
        websiteUrl: ''
    })

    useEffect(() => {
        params.then(p => setLocale(p.locale))
        fetchPartners()
    }, [params])

    const fetchPartners = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cms/partners')
            const data = await res.json()
            setPartners(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching partners:', error)
        } finally {
            setLoading(false)
        }
    }

    const savePartner = async () => {
        if (!formData.name || !formData.logoUrl) return

        setSaving(true)
        try {
            if (editingId) {
                await fetch(`/api/admin/cms/partners/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            } else {
                await fetch('/api/admin/cms/partners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }
            setShowForm(false)
            setEditingId(null)
            setFormData({ name: '', logoUrl: '', websiteUrl: '' })
            fetchPartners()
        } catch (error) {
            console.error('Error saving partner:', error)
        } finally {
            setSaving(false)
        }
    }

    const deletePartner = async (id: string) => {
        if (!confirm('Delete this partner?')) return

        try {
            await fetch(`/api/admin/cms/partners/${id}`, { method: 'DELETE' })
            fetchPartners()
        } catch (error) {
            console.error('Error deleting partner:', error)
        }
    }

    const editPartner = (partner: Partner) => {
        setFormData({
            name: partner.name,
            logoUrl: partner.logoUrl,
            websiteUrl: partner.websiteUrl || ''
        })
        setEditingId(partner.id)
        setShowForm(true)
    }

    const toggleActive = async (partner: Partner) => {
        try {
            await fetch(`/api/admin/cms/partners/${partner.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...partner, isActive: !partner.isActive })
            })
            fetchPartners()
        } catch (error) {
            console.error('Error toggling partner:', error)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Partners</h1>
                    <p className="text-slate-600 text-sm mt-1">
                        {locale === 'la' ? 'ຈັດການໂລໂກ້ພາດເນີ' : 'Manage partner logos on landing page'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true)
                        setEditingId(null)
                        setFormData({ name: '', logoUrl: '', websiteUrl: '' })
                    }}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Partner
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? 'Edit Partner' : 'New Partner'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Partner Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g. Toyota Thailand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Logo URL *
                                </label>
                                <input
                                    type="text"
                                    value={formData.logoUrl}
                                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="https://..."
                                />
                                {formData.logoUrl && (
                                    <div className="mt-2 p-2 bg-slate-100 rounded-lg">
                                        <img
                                            src={formData.logoUrl}
                                            alt="Preview"
                                            className="h-12 object-contain mx-auto"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Website URL
                                </label>
                                <input
                                    type="text"
                                    value={formData.websiteUrl}
                                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="https://www.toyota.co.th"
                                />
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
                                onClick={savePartner}
                                disabled={saving || !formData.name || !formData.logoUrl}
                                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Partners Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            ) : partners.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
                    No partners found
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {partners.map((partner) => (
                        <div
                            key={partner.id}
                            className={`bg-white rounded-2xl p-4 border ${partner.isActive ? 'border-slate-200' : 'border-slate-200 opacity-50'} hover:shadow-md transition-shadow`}
                        >
                            <div className="aspect-video bg-slate-100 rounded-xl flex items-center justify-center p-4 mb-3">
                                <img
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                                    }}
                                />
                            </div>
                            <p className="font-medium text-slate-900 text-sm truncate">{partner.name}</p>
                            <div className="flex items-center justify-between mt-3">
                                <button
                                    onClick={() => toggleActive(partner)}
                                    className={`px-2 py-0.5 rounded text-xs ${partner.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-500'
                                        }`}
                                >
                                    {partner.isActive ? 'Active' : 'Hidden'}
                                </button>
                                <div className="flex items-center gap-1">
                                    {partner.websiteUrl && (
                                        <a
                                            href={partner.websiteUrl}
                                            target="_blank"
                                            className="p-1.5 hover:bg-slate-100 rounded text-slate-400"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => editPartner(partner)}
                                        className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deletePartner(partner.id)}
                                        className="p-1.5 hover:bg-red-50 rounded text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
