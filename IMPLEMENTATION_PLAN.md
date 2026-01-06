# Implementation Plan - Trilingual Support (TH/EN/LA)

We will implement a complete internationalization system allowing users to switch between Thai (default), English, and Lao. We will use `next-intl` as it provides the most robust support for Next.js App Router (Server Components).

## User Review Required

> [!WARNING]
> **Breaking Change**: This refactor involves moving all pages from `src/app/*` to `src/app/[locale]/*` to support internationalized routing (e.g., `/th/dashboard`, `/en/dashboard`).
> Links in the application will need to be updated to use the `Link` component from `next-intl` (or a wrapped version) to automatically handle the locale prefix.

## Proposed Changes

### 1. Dependencies & Configuration
- **Install**: `npm install next-intl`
- **Config**:
    - Create `src/i18n/request.ts` for locale request handling.
    - Update `next.config.mjs` with `createNextIntlPlugin`.
    - Create `src/middleware.ts` to handle locale extraction and redirection.

### 2. Project Structure Refactor
- Move `src/app/dashboard` and other route groups inside `src/app/[locale]`.
- Keep `src/app/api` at the root (APIs usually don't need locale prefixes, or we can handle it differently).
- Create `src/messages/` directory for translation files:
    - `th.json`: Thai (Master)
    - `en.json`: English
    - `la.json`: Lao

### 3. Translation Content
- **Sidebar**: Complete translation of menu items.
- **Header**: Language switcher logic and UI text.
- **Dashboard**: "Welcome", "Statistics", "Quick Actions".
- **Common**: Buttons ("Save", "Cancel", "Delete"), Statuses.

### 4. Component Updates
#### [MODIFY] [Header.tsx](file:///home/tataff_001/Desktop/CODE/v-erp-next/src/components/layout/Header.tsx)
- Use `useLocale` and `useRouter`/`usePathname` from `next-intl/client` to switch languages.
- Create a `LocaleSwitcher` logic.

#### [MODIFY] [Sidebar.tsx](file:///home/tataff_001/Desktop/CODE/v-erp-next/src/components/layout/Sidebar.tsx)
- Replace hardcoded text with `t('sidebar.dashboard')`, etc.

#### [MODIFY] [Page Components]
- Update `DashboardPage`, `WorkersPage`, etc., to use `getTranslations` (Server Components) or `useTranslations` (Client Components).

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the file move didn't break import paths.

### Manual Verification
1. **Locale Switching**:
    - Go to `/dashboard` -> Should redirect to `/th/dashboard` (default).
    - Use Header dropdown to switch to "English". Link should change to `/en/dashboard`.
    - Verify text updates to English.
    - Switch to "Lao". Verify text updates to Lao.
2. **Data Persistence**:
    - Ensure page content (Workers list) still loads correctly in all locales.
3. **Sidebar Navigation**:
    - Click links in Sidebar. Ensure they preserve the current locale (e.g., clicking "Workers" while in English stays in `/en/dashboard/workers`).
