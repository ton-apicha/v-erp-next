import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match all paths except static files and API routes
    matcher: [
        // Match root
        '/',
        // Match locale paths
        '/(th|la)/:path*',
        // Match paths without locale (will redirect to /th)
        '/((?!api|_next|_vercel|.*\\..*).*)'
    ]
};
