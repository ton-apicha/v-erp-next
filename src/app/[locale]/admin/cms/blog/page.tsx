'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Link } from '@/i18n/routing'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Filter, Loader2 } from 'lucide-react'

interface BlogPost {
    id: string
    slug: string
    titleTH: string
    titleLA?: string
    category?: string
    isPublished: boolean
    isFeatured: boolean
    publishedAt?: string
    createdAt: string
    viewCount: number
}

export default function BlogListPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const [locale, setLocale] = useState('th')
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const router = useRouter()

    useEffect(() => {
        params.then(p => setLocale(p.locale))
    }, [params])

    useEffect(() => {
        fetchPosts()
    }, [categoryFilter])

    const fetchPosts = async () => {
        setLoading(true)
        try {
            const url = new URL('/api/admin/cms/blog', window.location.origin)
            if (categoryFilter) url.searchParams.set('category', categoryFilter)

            const res = await fetch(url)
            const data = await res.json()
            setPosts(data.data || [])
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const deletePost = async (slug: string) => {
        if (!confirm('Delete this post?')) return

        try {
            await fetch(`/api/admin/cms/blog/${slug}`, { method: 'DELETE' })
            fetchPosts()
        } catch (error) {
            console.error('Error deleting post:', error)
        }
    }

    const filteredPosts = posts.filter(post =>
        post.titleTH.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const categories = [
        { value: '', label: 'All' },
        { value: 'news', label: 'News' },
        { value: 'law', label: 'Law' },
        { value: 'tech', label: 'Tech' },
        { value: 'tips', label: 'Tips' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {locale === 'la' ? 'ບົດຄວາມ' : 'Blog Posts'}
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                        {locale === 'la' ? 'ຈັດການບົດຄວາມແລະຂ່າວ' : 'Manage blog posts and news articles'}
                    </p>
                </div>
                <Link
                    href="/admin/cms/blog/new"
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    {locale === 'la' ? 'ສ້າງໃໝ່' : 'New Post'}
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={locale === 'la' ? 'ຄົ້ນຫາ...' : 'Search posts...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
                >
                    {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                </select>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>{locale === 'la' ? 'ບໍ່ມີບົດຄວາມ' : 'No posts found'}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {locale === 'la' ? 'ຫົວຂໍ້' : 'Title'}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {locale === 'la' ? 'ໝວດໝູ່' : 'Category'}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    {locale === 'la' ? 'ສະຖານະ' : 'Status'}
                                </th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">
                                    Views
                                </th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{post.titleTH}</p>
                                        <p className="text-xs text-slate-400 mt-1">/{post.slug}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.category && (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                                {post.category}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {post.isPublished ? (
                                            <span className="flex items-center gap-1 text-green-600 text-sm">
                                                <Eye className="w-4 h-4" />
                                                Published
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-slate-400 text-sm">
                                                <EyeOff className="w-4 h-4" />
                                                Draft
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {post.viewCount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/cms/blog/${post.slug}/edit`}
                                                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => deletePost(post.slug)}
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
        </div>
    )
}
