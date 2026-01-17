import { BlogForm } from '@/components/cms/BlogForm'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function EditBlogPage({
    params
}: {
    params: Promise<{ locale: string; slug: string }>
}) {
    const { locale, slug } = await params

    const post = await prisma.cmsBlogPost.findUnique({
        where: { slug }
    })

    if (!post) {
        notFound()
    }

    return (
        <BlogForm
            locale={locale}
            slug={slug}
            initialData={{
                titleTH: post.titleTH,
                titleLA: post.titleLA || undefined,
                excerptTH: post.excerptTH || undefined,
                excerptLA: post.excerptLA || undefined,
                contentTH: post.contentTH,
                contentLA: post.contentLA || undefined,
                coverImage: post.coverImage || undefined,
                category: post.category || undefined,
                tags: post.tags,
                isPublished: post.isPublished,
                isFeatured: post.isFeatured,
            }}
        />
    )
}
