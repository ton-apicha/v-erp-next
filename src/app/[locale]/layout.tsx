import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Metadata } from 'next'
import { Inter, Sarabun, Noto_Sans_Lao } from 'next/font/google'
import '../globals.css'

// Fonts Configuration
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
})

const sarabun = Sarabun({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['thai', 'latin'],
    variable: '--font-sarabun',
    display: 'swap',
})

const notoSansLao = Noto_Sans_Lao({
    weight: ['300', '400', '500', '600', '700'],
    subsets: ['lao'],
    variable: '--font-noto-lao',
    display: 'swap',
})

export async function generateMetadata({
    params
}: {
    params: Promise<{ locale: string }>
}): Promise<Metadata> {
    const { locale } = await params;
    const messages = await getMessages({ locale });
    const t = (key: string) => {
        // Simple helper to access nested messages safely
        const keys = key.split('.');
        let current: any = messages;
        for (const k of keys) {
            current = current?.[k];
        }
        return current as string;
    };

    const title = t('SEO.title');
    const description = t('SEO.description');

    return {
        title: {
            default: title,
            template: '%s | V-GROUP'
        },
        description: description,
        keywords: t('SEO.keywords'),
        openGraph: {
            title: title,
            description: description,
            url: 'https://v-erp.itd.in.th',
            siteName: 'V-GROUP',
            locale: locale,
            type: 'website',
            images: [
                {
                    url: '/images/og-image.jpg', // We will need to create this
                    width: 1200,
                    height: 630,
                    alt: 'V-GROUP Landing',
                }
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: ['/images/og-image.jpg'],
        },
        icons: {
            icon: '/favicon.ico',
        },
    }
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages();

    return (
        <html lang={locale} suppressHydrationWarning>
            <body
                className={`${inter.variable} ${sarabun.variable} ${notoSansLao.variable} font-sans antialiased`}
            >
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
