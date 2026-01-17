# 📋 V-ERP Handoff Documentation

> **Last Updated:** 2026-01-17  
> **Version:** 2.0.0 (Multi-Company Rebuild)  
> **Author:** Antigravity AI

---

## 🎯 Project Overview

**V-ERP** คือระบบจัดการธุรกิจแรงงานข้ามชาติของ V-Group ซึ่งประกอบด้วย 4 บริษัท:

| Company | Focus | Target |
|---------|-------|--------|
| **V-Connect** 🇱🇦 | จัดหาแรงงานจากลาว | พาร์ทเนอร์, Academy |
| **V-Work** 🏭 | จัดส่งแรงงานให้โรงงาน | B2B Clients |
| **V-Care** 🏠 | แม่บ้าน/ดูแลผู้สูงอายุ | B2C Clients |
| **V-Holding** 📊 | ภาพรวม/รายงาน | Management |

---

## ⚠️ Critical Things to Know

### 1. Locale Configuration
```
✅ Supported: th (ไทย), la (ลาว)
❌ Removed: en (English)
```
- ใช้ `Link` จาก `@/i18n/routing` แทน `next/link`
- ใช้ `useRouter` จาก `@/i18n/routing` แทน `next/navigation`
- หาก link ไม่มี locale จะได้ 404

### 2. Dark Mode Disabled
- `tailwind.config.js` ไม่มี `darkMode: 'class'`
- ทุก UI ออกแบบสำหรับ Light Mode เท่านั้น

### 3. Deprecated Models (ห้ามใช้!)
```
❌ Agent (เปลี่ยนเป็น Partner)
❌ Commission (กำลัง redesign)
❌ PayrollFile (ยังไม่ใช้)
```

### 4. API Authorization Pattern
ทุก API ต้องใช้ pattern นี้:
```typescript
const session = await getServerSession(authOptions)
const userRole = (session?.user as any)?.role?.name
if (!['SUPER_ADMIN', 'MANAGER'].includes(userRole)) {
  return NextResponse.json({ error: 'Access denied' }, { status: 403 })
}
```

### 5. Audit Logging
เมื่อ CREATE/UPDATE/DELETE ต้อง call:
```typescript
import { auditCreate, auditUpdate, auditDelete } from '@/lib/audit'
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                      # API Routes
│   │   ├── audit-logs/          # Audit log viewer
│   │   ├── clients/             # CRUD + [id]
│   │   ├── contract-templates/  # CRUD + [id]
│   │   ├── partners/            # CRUD + [id]
│   │   ├── permissions/         # GET only
│   │   ├── roles/               # CRUD + [id]
│   │   └── workers/             # CRUD + [id]
│   │
│   └── [locale]/
│       └── dashboard/           # 16 page directories
│           ├── audit-logs/
│           ├── clients/
│           ├── contract-templates/ ← NEW
│           ├── deployment/        ← NEW
│           ├── partners/
│           ├── reports/
│           ├── roles/             ← NEW (with create/edit)
│           ├── users/
│           └── workers/
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Multi-company menu
│   │   ├── Header.tsx           # User info, logout
│   │   └── DashboardShell.tsx   # Shell wrapper
│   │
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx         ← NEW
│       ├── input.tsx
│       ├── select.tsx
│       ├── textarea.tsx
│       └── ...
│
└── lib/
    ├── auth.ts                  # NextAuth config (JWT + Role)
    ├── audit.ts                 # Audit logging service
    ├── permissions.ts           # Permission checker
    ├── prisma.ts                # Prisma client alias
    └── db.ts                    # Prisma client
```

---

## 🗄️ Database Models (Prisma)

### Core Models
| Model | Description | Status |
|-------|-------------|--------|
| `Role` | บทบาท + companyAccess[] | ✅ Complete |
| `Permission` | สิทธิ์ (module + action) | ✅ Complete |
| `RolePermission` | Many-to-Many junction | ✅ Complete |
| `User` | ผู้ใช้ + roleId | ✅ Complete |
| `Partner` | พาร์ทเนอร์ลาว (จัดหาแรงงาน) | ✅ Complete |
| `Worker` | แรงงาน + document tags | ✅ Complete |
| `Client` | ลูกค้า (FACTORY/INDIVIDUAL) | ✅ Complete |
| `AuditLog` | ประวัติการใช้งาน | ✅ Complete |
| `ContractTemplate` | แม่แบบสัญญา | ✅ Complete |

### Worker Document Tags
```prisma
hasIdCard         Boolean @default(false)
hasPassport       Boolean @default(false)
hasVisa           Boolean @default(false)
hasWorkPermit     Boolean @default(false)
hasMedicalCert    Boolean @default(false)
hasAcademyTraining Boolean @default(false)
```

### Worker Status Enum
```prisma
enum WorkerStatus {
  NEW           // ใหม่
  DOCUMENTING   // ทำเอกสาร
  TRAINING      // ฝึกอบรม
  READY         // พร้อมส่งตัว
  DEPLOYED      // ส่งตัวแล้ว
  WORKING       // กำลังทำงาน
  COMPLETED     // ครบสัญญา
  TERMINATED    // ยกเลิก
  RETURNED      // กลับประเทศ
}
```

---

## 🔗 API Endpoints

### Partners
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/partners` | List (+ `?minimal=true` for dropdown) |
| POST | `/api/partners` | Create |
| GET | `/api/partners/[id]` | Get single |
| PUT | `/api/partners/[id]` | Update |
| DELETE | `/api/partners/[id]` | Delete |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roles` | List all roles + permissions |
| POST | `/api/roles` | Create (+ permissionIds[]) |
| GET | `/api/roles/[id]` | Get single with permissions |
| PUT | `/api/roles/[id]` | Update (+ permissionIds[]) |
| DELETE | `/api/roles/[id]` | Delete (if !isSystem && 0 users) |

### Contract Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contract-templates` | List (+ ?category, ?activeOnly) |
| POST | `/api/contract-templates` | Create |
| GET | `/api/contract-templates/[id]` | Get single |
| PUT | `/api/contract-templates/[id]` | Update |
| DELETE | `/api/contract-templates/[id]` | Delete |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions` | Returns grouped by module |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audit-logs` | List with filters |
| GET | `/api/audit-logs/export` | Export to Excel |

### Loans (Finance)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/loans` | List (?status, ?workerId, ?search) |
| POST | `/api/loans` | Create new loan |
| GET | `/api/loans/[id]` | Get single + payments |
| PUT | `/api/loans/[id]` | Update loan |
| DELETE | `/api/loans/[id]` | Cancel loan |
| POST | `/api/loans/[id]/payment` | Record payment |

---

## 🧩 Component Dependencies

### UI Components Used
```
@radix-ui/react-checkbox     ← ใช้กับ Role form
@radix-ui/react-popover
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slot
@radix-ui/react-tooltip
lucide-react                 ← Icons
date-fns                     ← Date formatting
class-variance-authority     ← UI variants
```

### Key Libraries
```
next-auth                    ← Auth (Credentials + JWT)
prisma                       ← ORM
next-intl                    ← i18n
tailwindcss                  ← Styling
```

---

## 📝 Remaining Tasks (Optional)

### Enhancement
1. **E2E Tests** - เขียน automated tests สำหรับ critical flows
2. **Notification System** - In-app alerts
3. **Document Upload** - MinIO integration
4. **SOS Alerts** - Emergency system

### Optimization
5. **Performance Tuning** - Lazy loading, caching
6. **Error Boundaries** - Better error handling UI
7. **PWA Support** - Offline capabilities

---

## 🧪 Testing Commands

```bash
# Development
npm run dev

# Type Check
npm run typecheck

# Lint
npm run lint
npm run lint:fix

# Validate (lint + typecheck)
npm run validate

# Database
npx prisma db push
npx prisma generate
npx prisma studio
```

---

## 🔐 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@vgroup.co.th | admin123 | SUPER_ADMIN |
| manager@vconnect.la | manager123 | LAO_MANAGER |
| staff@vwork.co.th | staff123 | TH_OPERATOR |

---

## ⚡ Quick Start for Future Development

1. **Clone & Install**
```bash
git clone <repo>
cd v-erp-next
npm install
```

2. **Environment**
```bash
cp .env.example .env
# Set DATABASE_URL, NEXTAUTH_SECRET
```

3. **Database**
```bash
npx prisma generate
npx prisma db push
node prisma/seed-permissions.js
```

4. **Run**
```bash
npm run dev
```

5. **Access**
- http://localhost:3000/th/dashboard
- Login: admin@vgroup.co.th / admin123

---

## 📊 Current Progress

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Database Schema | ✅ 100% |
| 1 | Configuration | ✅ 100% |
| 2 | Multi-Company Sidebar | ✅ 100% |
| 2 | Permission System | ✅ 100% |
| 2 | Partner Management | ✅ 100% |
| 2 | Worker Tags | ✅ 100% |
| 3 | Role Management | ✅ 100% |
| 3 | Audit Log Viewer + Export | ✅ 100% |
| 3 | Contract Templates + Generate | ✅ 100% |
| 3 | Deployment Module | ✅ 100% |
| 3 | Reports Dashboard | ✅ 100% |
| 4 | Finance Module + Charts | ✅ 100% |
| 4 | V-Academy | ✅ 100% |
| 4 | V-Care | ✅ 100% |
| 5 | TypeScript Cleanup | ✅ 0 errors |
| 5 | Production Build | ✅ Verified |

**Overall Progress: 100% - Production Ready! 🚀**

---

## 📞 Contact

สำหรับคำถามเพิ่มเติม:
- Handoff Doc: `/home/tataff_001/Desktop/CODE/v-erp-next/HANDOFF.md`
- Task List: `.gemini/antigravity/brain/<conversation-id>/task.md`
- Walkthrough: `.gemini/antigravity/brain/<conversation-id>/walkthrough.md`

---

*This document is designed for AI agent handoff and human developer onboarding.*
