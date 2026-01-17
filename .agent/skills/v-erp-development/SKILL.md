---
description: V-ERP Next.js development best practices and common pitfalls
---

# V-ERP Development Skill

This skill documents lessons learned and best practices for developing the V-ERP application.

## 🚨 Critical Pitfalls (Must Avoid)

### 1. i18n Routing - ALWAYS Use @/i18n/routing

**Problem:** Using `next/link` or `next/navigation` directly causes 404 errors because locale prefix is missing.

**Wrong:**
```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
```

**Correct:**
```tsx
import { Link } from '@/i18n/routing'
import { useRouter, Link } from '@/i18n/routing'
```

**Files affected:** ALL page components with navigation links.

---

### 2. Deprecated Models - Don't Use Agent

**Problem:** The `Agent` model has been replaced by `Partner` model.

**Wrong:**
```typescript
const agents = await prisma.agent.findMany()
```

**Correct:**
```typescript
const partners = await prisma.partner.findMany()
```

**Check:** Before using any model, verify it exists in `prisma/schema.prisma`.

---

### 3. API Response Format Consistency

**Problem:** Frontend expects specific data structure but API returns different format.

**Wrong:**
```typescript
// API returns wrapped object
return NextResponse.json({ permissions, grouped })

// Frontend expects direct object
const data = await res.json()
Object.entries(data).map(...)  // ERROR!
```

**Correct:**
```typescript
// API returns direct object
return NextResponse.json(grouped)

// Frontend receives expected format
const data = await res.json()
Object.entries(data).map(...)  // Works!
```

**Rule:** Always check what format the frontend expects before creating/modifying APIs.

---

### 4. Missing UI Components

**Problem:** Using shadcn/ui components that don't exist in the project.

**Common missing components:**
- `Checkbox` - needs `@radix-ui/react-checkbox`
- `Tabs` - needs `@radix-ui/react-tabs`
- `Dialog` - needs `@radix-ui/react-dialog`

**Solution:** Before using a component, check if it exists in `src/components/ui/`. If not:
1. Create the component following shadcn/ui patterns
2. Install required radix-ui package

```bash
npm install @radix-ui/react-checkbox
```

---

### 5. Light Mode Only

**Problem:** This project has no dark mode support.

**Wrong:**
```tsx
className="dark:bg-gray-800"
```

**Correct:**
```tsx
className="bg-white"
```

**Note:** `tailwind.config.js` does not have `darkMode: 'class'`.

---

## ✅ Best Practices

### 1. Authorization Pattern

Every API route should use this pattern:
```typescript
const session = await getServerSession(authOptions)
if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const userRole = (session.user as any).role?.name
if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
```

### 2. Audit Logging

All CRUD operations should call audit functions:
```typescript
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'

// After create
await auditCreate(session.user.id, 'partners', partner.id, partner)

// After update
await auditUpdate(session.user.id, 'partners', partner.id, oldData, newData)

// After delete
await auditDelete(session.user.id, 'partners', partner.id, oldData)
```

### 3. Bilingual Support (TH/LA)

All user-facing text should support Thai and Lao:
```typescript
// Model fields
displayName   String   // Thai
displayNameLA String?  // Lao (optional)

// UI labels
labelTH: 'แรงงาน'
labelLA: 'ແຮງງານ'
```

### 4. Form with Select Component

Native `<select>` is used instead of shadcn Select in server components:
```tsx
<select
    name="module"
    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
>
    <option value="">All</option>
</select>
```

### 5. Date Formatting

Always use date-fns with Thai locale:
```typescript
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

format(new Date(), 'dd MMM yyyy', { locale: th })
```

---

## 📁 Key File Locations

| Purpose | Path |
|---------|------|
| i18n routing | `src/i18n/routing.ts` |
| Auth config | `src/lib/auth.ts` |
| Audit service | `src/lib/audit.ts` |
| Permission utils | `src/lib/permissions.ts` |
| Prisma client | `src/lib/prisma.ts` |
| UI components | `src/components/ui/` |
| Sidebar menu | `src/components/layout/Sidebar.tsx` |

---

## 🔄 Before Starting Work

// turbo
1. Read HANDOFF.md
```bash
cat /home/tataff_001/Desktop/CODE/v-erp-next/HANDOFF.md
```

// turbo
2. Check dev server is running
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next && npm run dev
```

// turbo
3. Validate before committing
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next && npm run validate
```

---

## 🧪 Testing Checklist

After making changes:
1. [ ] Page loads without 404
2. [ ] Links navigate correctly (with locale)
3. [ ] Forms submit without errors
4. [ ] API responses match expected format
5. [ ] No TypeScript errors (`npm run typecheck`)
6. [ ] Test on browser with Thai locale
