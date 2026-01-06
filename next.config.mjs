import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['storage.googleapis.com'],
    },
    // Remapping rewrites to likely be handled by middleware or need adjustment if keeping them.
    // However, existing rewrites should conflict less if they are for separate apps.
    // For now keeping them as is, but be aware middleware matching might affect them.
    async rewrites() {
        return [
            // V-PARTNER routes
            {
                source: '/partner/:path*',
                destination: '/partner/:path*',
            },
            // V-CLIENT routes
            {
                source: '/client/:path*',
                destination: '/client/:path*',
            },
            // V-LIFE routes
            {
                source: '/life/:path*',
                destination: '/life/:path*',
            },
        ];
    },
};

export default withNextIntl(nextConfig);
