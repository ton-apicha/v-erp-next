---
description: How to continue V-ERP development - read before starting
---

# V-ERP Development Continuation

Before starting any development on this project, follow these steps:

## 1. Read Handoff Document

First, read the complete handoff documentation:
```
view_file /home/tataff_001/Desktop/CODE/v-erp-next/HANDOFF.md
```

This contains:
- Project structure
- Database models
- API endpoints
- Critical warnings (deprecated models, locale issues)
- Current progress

## 2. Critical Warnings

⚠️ **IMPORTANT - Read Before Coding:**

- **Locale:** ใช้ `Link` จาก `@/i18n/routing` ไม่ใช่ `next/link`
- **Locale:** ใช้ `useRouter` จาก `@/i18n/routing` ไม่ใช่ `next/navigation`
- **Deprecated:** ห้ามใช้ `Agent` model (ใช้ `Partner` แทน)
- **Dark Mode:** ไม่มี dark mode - ออกแบบ Light Mode เท่านั้น
- **Audit:** ทุก CRUD ต้อง call audit functions จาก `@/lib/audit`

## 3. Check Task List

View current task status:
```
view_file /home/tataff_001/.gemini/antigravity/brain/c53a5753-12e1-4fcb-b9a4-592a912d3b4a/task.md
```

## 4. Pending Work

The following features still need development:

### High Priority
1. **Export to Excel** - `/dashboard/audit-logs`, `/dashboard/workers`
2. **Contract Generate** - Create contract from template + real data
3. **Deployment Form** - Assign workers to client workflow

### Medium Priority
4. V-Academy Module - Training schedule
5. V-Care Module - Domestic workers
6. Finance Dashboard - Charts

## 5. Start Development Server

// turbo
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next && npm run dev
```

## 6. Validate Before Commit

// turbo
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next && npm run validate
```
