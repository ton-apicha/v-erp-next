import { BlogForm } from '@/components/cms/BlogForm'

export default async function NewBlogPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    return <BlogForm locale={locale} />
}
