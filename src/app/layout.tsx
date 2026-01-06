import type { Metadata } from 'next'
import { Inter, Sarabun, Noto_Sans_Lao } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
    title: 'V-ERP | Enterprise Resource Planning',
    description: 'ระบบบริหารจัดการทรัพยากรองค์กร สำหรับธุรกิจจัดหาแรงงาน',
    icons: {
        icon: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="th" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${sarabun.variable} ${notoSansLao.variable} font-sans antialiased`}
            >
                {children}
            </body>
        </html>
    )
}
