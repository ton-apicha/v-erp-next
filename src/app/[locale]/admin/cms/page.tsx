import { prisma } from '@/lib/prisma'
import {
    FileText,
    Newspaper,
    Image,
    HelpCircle,
    Users,
    Factory,
    TrendingUp,
    Eye
} from 'lucide-react'
import { Link } from '@/i18n/routing'

export default async function CmsDashboard({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    // Fetch counts
    const [
        pagesCount,
        postsCount,
        publishedPosts,
        mediaCount,
        faqCount,
        partnersCount,
        estatesCount
    ] = await Promise.all([
        prisma.cmsPage.count(),
        prisma.cmsBlogPost.count(),
        prisma.cmsBlogPost.count({ where: { isPublished: true } }),
        prisma.cmsMedia.count(),
        prisma.cmsFaq.count({ where: { isActive: true } }),
        prisma.cmsPartner.count({ where: { isActive: true } }),
        prisma.cmsIndustrialEstate.count({ where: { isActive: true } })
    ])

    const stats = [
        {
            label: locale === 'la' ? 'ໜ້າເວັບ' : 'Pages',
            value: pagesCount,
            icon: FileText,
            color: 'bg-blue-500',
            href: '/admin/cms/pages'
        },
        {
            label: locale === 'la' ? 'ບົດຄວາມ' : 'Blog Posts',
            value: postsCount,
            subValue: `${publishedPosts} published`,
            icon: Newspaper,
            color: 'bg-green-500',
            href: '/admin/cms/blog'
        },
        {
            label: locale === 'la' ? 'ສື່ມີເດຍ' : 'Media Files',
            value: mediaCount,
            icon: Image,
            color: 'bg-purple-500',
            href: '/admin/cms/media'
        },
        {
            label: 'FAQs',
            value: faqCount,
            icon: HelpCircle,
            color: 'bg-amber-500',
            href: '/admin/cms/faq'
        },
        {
            label: locale === 'la' ? 'ພາດເນີ' : 'Partners',
            value: partnersCount,
            icon: Users,
            color: 'bg-cyan-500',
            href: '/admin/cms/partners'
        },
        {
            label: locale === 'la' ? 'ນິຄົມ' : 'Industrial Estates',
            value: estatesCount,
            icon: Factory,
            color: 'bg-rose-500',
            href: '/admin/cms/estates'
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    {locale === 'la' ? 'CMS ແດດບອດ' : 'CMS Dashboard'}
                </h1>
                <p className="text-slate-600 mt-1">
                    {locale === 'la'
                        ? 'ຈັດການເນື້ອຫາ Landing Page ຂອງ V-GROUP'
                        : 'Manage V-GROUP Landing Page Content'
                    }
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                {stat.subValue && (
                                    <p className="text-xs text-slate-400 mt-1">{stat.subValue}</p>
                                )}
                            </div>
                            <div className={`${stat.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    {locale === 'la' ? 'ການດຳເນີນການດ່ວນ' : 'Quick Actions'}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link
                        href="/admin/cms/blog/new"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-cyan-500 hover:bg-cyan-50 transition-all text-slate-600 hover:text-cyan-700"
                    >
                        <Newspaper className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {locale === 'la' ? 'ບົດຄວາມໃໝ່' : 'New Post'}
                        </span>
                    </Link>
                    <Link
                        href="/admin/cms/media"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-all text-slate-600 hover:text-purple-700"
                    >
                        <Image className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {locale === 'la' ? 'ອັບໂຫຼດ' : 'Upload Media'}
                        </span>
                    </Link>
                    <Link
                        href="/admin/cms/faq"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 hover:bg-amber-50 transition-all text-slate-600 hover:text-amber-700"
                    >
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {locale === 'la' ? 'ເພີ່ມ FAQ' : 'Add FAQ'}
                        </span>
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-green-500 hover:bg-green-50 transition-all text-slate-600 hover:text-green-700"
                    >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            {locale === 'la' ? 'ເບິ່ງເວັບ' : 'View Site'}
                        </span>
                    </a>
                </div>
            </div>
        </div>
    )
}
