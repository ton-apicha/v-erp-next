/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: ['storage.googleapis.com'],
    },
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

export default nextConfig;
