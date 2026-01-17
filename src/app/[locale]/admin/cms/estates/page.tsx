'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, MapPin, Loader2, Save, Factory, Users } from 'lucide-react'

interface Estate {
    id: string
    nameTH: string
    nameLA?: string
    region: string
    latitude: number
    longitude: number
    workers: number
    clients: number
    isActive: boolean
}

const REGIONS = ['EEC', 'Central', 'Samut Prakan', 'Samut Sakhon', 'Rayong', 'Chonburi']

export default function EstatesPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [estates, setEstates] = useState<Estate[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        nameTH: '',
        nameLA: '',
        region: 'EEC',
        latitude: 13.0,
        longitude: 101.0,
        workers: 0,
        clients: 0
    })

    useEffect(() => {
        params.then(p => setLocale(p.locale))
        fetchEstates()
    }, [params])

    const fetchEstates = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/cms/estates')
            const data = await res.json()
            setEstates(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error fetching estates:', error)
        } finally {
            setLoading(false)
        }
    }

    const saveEstate = async () => {
        if (!formData.nameTH || !formData.region) return

        setSaving(true)
        try {
            if (editingId) {
                await fetch(`/api/admin/cms/estates/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            } else {
                await fetch('/api/admin/cms/estates', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                })
            }
            setShowForm(false)
            setEditingId(null)
            setFormData({ nameTH: '', nameLA: '', region: 'EEC', latitude: 13.0, longitude: 101.0, workers: 0, clients: 0 })
            fetchEstates()
        } catch (error) {
            console.error('Error saving estate:', error)
        } finally {
            setSaving(false)
        }
    }

    const deleteEstate = async (id: string) => {
        if (!confirm('Delete this estate?')) return

        try {
            await fetch(`/api/admin/cms/estates/${id}`, { method: 'DELETE' })
            fetchEstates()
        } catch (error) {
            console.error('Error deleting estate:', error)
        }
    }

    const editEstate = (estate: Estate) => {
        setFormData({
            nameTH: estate.nameTH,
            nameLA: estate.nameLA || '',
            region: estate.region,
            latitude: estate.latitude,
            longitude: estate.longitude,
            workers: estate.workers,
            clients: estate.clients
        })
        setEditingId(estate.id)
        setShowForm(true)
    }

    const toggleActive = async (estate: Estate) => {
        try {
            await fetch(`/api/admin/cms/estates/${estate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...estate, isActive: !estate.isActive })
            })
            fetchEstates()
        } catch (error) {
            console.error('Error toggling estate:', error)
        }
    }

    // Group estates by region
    const estatesByRegion = estates.reduce((acc, estate) => {
        if (!acc[estate.region]) acc[estate.region] = []
        acc[estate.region].push(estate)
        return acc
    }, {} as Record<string, Estate[]>)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Industrial Estates</h1>
                    <p className="text-slate-600 text-sm mt-1">
                        {locale === 'la' ? 'ຈັດການນິຄົມອຸດສາຫະກຳໃນແຜນທີ່' : 'Manage industrial estates shown on coverage map'}
                    </p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(true)
                        setEditingId(null)
                        setFormData({ nameTH: '', nameLA: '', region: 'EEC', latitude: 13.0, longitude: 101.0, workers: 0, clients: 0 })
                    }}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Estate
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {editingId ? 'Edit Estate' : 'New Estate'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name (Thai) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameTH}
                                    onChange={(e) => setFormData({ ...formData, nameTH: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    placeholder="e.g. นิคมฯ อมตะซิตี้"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Name (Lao)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nameLA}
                                    onChange={(e) => setFormData({ ...formData, nameLA: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Region *
                                </label>
                                <select
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                >
                                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Latitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Longitude *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Workers Count
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.workers}
                                        onChange={(e) => setFormData({ ...formData, workers: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Clients Count
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.clients}
                                        onChange={(e) => setFormData({ ...formData, clients: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
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
                                onClick={saveEstate}
                                disabled={saving || !formData.nameTH || !formData.region}
                                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Estates by Region */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            ) : estates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
                    No industrial estates found
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(estatesByRegion).map(([region, regionEstates]) => (
                        <div key={region} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">{region}</h3>
                                <p className="text-xs text-slate-500">{regionEstates.length} estates</p>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {regionEstates.map((estate) => (
                                    <div key={estate.id} className={`p-4 flex items-center gap-4 ${!estate.isActive ? 'opacity-50' : ''}`}>
                                        <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                                            <Factory className="w-5 h-5 text-rose-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{estate.nameTH}</p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                {estate.latitude.toFixed(4)}, {estate.longitude.toFixed(4)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-600">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                {estate.workers}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Factory className="w-4 h-4" />
                                                {estate.clients}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleActive(estate)}
                                                className={`px-2 py-0.5 rounded text-xs ${estate.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                {estate.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                            <button
                                                onClick={() => editEstate(estate)}
                                                className="p-1.5 hover:bg-slate-100 rounded text-slate-600 text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteEstate(estate.id)}
                                                className="p-1.5 hover:bg-red-50 rounded text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
