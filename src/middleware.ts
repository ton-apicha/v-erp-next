import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
    // Match only Thai and Lao pathnames
    matcher: ['/', '/(th|la)/:path*']
};
