import { defineRouting } from 'next-intl/routing';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // รองรับ 2 ภาษา: ไทย และ ลาว
    locales: ['th', 'la'],

    // Used when no locale matches
    defaultLocale: 'th',

    // Optional: Prefix default locale (e.g. /th/dashboard instead of /dashboard)
    // standard for SEO is to prefix even default or handle it specifically.
    // next-intl default is 'always' prefix usually or 'as-needed'.
    // Let's stick to default behavior (always) or implicit for now.
    localePrefix: 'always'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation(routing);
