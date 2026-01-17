'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Image as ImageIcon, Video, FileText, Loader2, Search, X } from 'lucide-react'

interface Media {
    id: string
    fileName: string
    originalName: string
    fileUrl: string
    fileSize: number
    mimeType: string
    folder?: string
    altTextTH?: string
    createdAt: string
}

export default function MediaPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [media, setMedia] = useState<Media[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [folderFilter, setFolderFilter] = useState('')
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        params.then(p => setLocale(p.locale))
        fetchMedia()
    }, [params, folderFilter])

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const url = new URL('/api/admin/cms/media', window.location.origin)
            if (folderFilter) url.searchParams.set('folder', folderFilter)

            const res = await fetch(url)
            const data = await res.json()
            setMedia(data.data || [])
        } catch (error) {
            console.error('Error fetching media:', error)
        } finally {
            setLoading(false)
        }
    }

    const uploadFile = async (file: File) => {
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folderFilter || 'general')

            await fetch('/api/admin/cms/media', {
                method: 'POST',
                body: formData
            })
            fetchMedia()
        } catch (error) {
            console.error('Error uploading file:', error)
        } finally {
            setUploading(false)
        }
    }

    const deleteMedia = async (id: string) => {
        if (!confirm('Delete this file?')) return

        try {
            await fetch(`/api/admin/cms/media/${id}`, { method: 'DELETE' })
            setSelectedMedia(null)
            fetchMedia()
        } catch (error) {
            console.error('Error deleting media:', error)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) uploadFile(file)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
    }

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const getIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return ImageIcon
        if (mimeType.startsWith('video/')) return Video
        return FileText
    }

    const filteredMedia = media.filter(m =>
        m.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const folders = ['general', 'blog', 'partners', 'hero']

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
                    <p className="text-slate-600 text-sm mt-1">
                        {locale === 'la' ? 'ຈັດການຮູບພາບແລະສື່' : 'Manage images and media files'}
                    </p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    Upload
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*"
                />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                    />
                </div>
                <select
                    value={folderFilter}
                    onChange={(e) => setFolderFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl"
                >
                    <option value="">All Folders</option>
                    {folders.map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {/* Upload Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-cyan-500 hover:bg-cyan-50/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">Drag & drop files here</p>
                <p className="text-slate-400 text-sm mt-1">or click to browse</p>
            </div>

            {/* Media Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
            ) : filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    No media files found
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredMedia.map((item) => {
                        const Icon = getIcon(item.mimeType)
                        return (
                            <div
                                key={item.id}
                                onClick={() => setSelectedMedia(item)}
                                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                            >
                                <div className="aspect-square bg-slate-100 flex items-center justify-center relative">
                                    {item.mimeType.startsWith('image/') ? (
                                        <img
                                            src={item.fileUrl}
                                            alt={item.originalName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Icon className="w-12 h-12 text-slate-400" />
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteMedia(item.id)
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="p-2">
                                    <p className="text-xs text-slate-600 truncate">{item.originalName}</p>
                                    <p className="text-xs text-slate-400">{formatSize(item.fileSize)}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Media Detail Modal */}
            {selectedMedia && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Media Details</h2>
                            <button onClick={() => setSelectedMedia(null)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {selectedMedia.mimeType.startsWith('image/') && (
                            <img
                                src={selectedMedia.fileUrl}
                                alt={selectedMedia.originalName}
                                className="w-full h-48 object-contain bg-slate-100 rounded-xl mb-4"
                            />
                        )}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">File name:</span>
                                <span className="font-medium">{selectedMedia.originalName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Size:</span>
                                <span>{formatSize(selectedMedia.fileSize)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Type:</span>
                                <span>{selectedMedia.mimeType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Folder:</span>
                                <span>{selectedMedia.folder || 'general'}</span>
                            </div>
                        </div>
                        <div className="mt-4 p-3 bg-slate-100 rounded-xl">
                            <p className="text-xs text-slate-500 mb-1">URL:</p>
                            <code className="text-xs break-all">{selectedMedia.fileUrl}</code>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => deleteMedia(selectedMedia.id)}
                                className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedMedia.fileUrl)
                                    alert('URL copied!')
                                }}
                                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl"
                            >
                                Copy URL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
