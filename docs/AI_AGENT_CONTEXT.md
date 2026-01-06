# AI Agent Context - V-CORE ERP

> **Purpose:** เอกสารนี้ใช้สำหรับ Copy ไปให้ AI Agent (Gemini, Claude, GPT, Cursor, etc.) เพื่อ Set Context ในการทำงาน  
> **Last Updated:** 2026-01-06

---

## Quick Context (Copy นี้ไปใช้ได้เลย)

```
Project Context for V-ERP (V-CORE):

You are developing an Enterprise Resource Planning (ERP) system for "V-Group," 
a manpower agency managing labor migration from Laos to Thailand.

## Multi-Portal Architecture
- V-CORE: Admin/BackOffice Web (this project)
- V-PARTNER: Agent/Partner Mobile App
- V-CLIENT: Employer/Factory Portal
- V-LIFE: Worker Mobile App

## Tech Stack
- Frontend: Next.js 15 (App Router), TypeScript, Tailwind CSS
- Backend: Next.js Server Actions, Prisma ORM 6.x, PostgreSQL 16
- Auth: NextAuth.js 4.x
- Queue: BullMQ + Redis (for background jobs)
- Storage: MinIO (S3-compatible)
- Real-time: Socket.io (for SOS, tracking)
- i18n: next-intl (TH, LA, EN)
- Theme: next-themes (Dark/Light mode)
- Infrastructure: Docker Compose on Ubuntu Server with Nginx Proxy

## Key Requirements
1. Multi-Language: Full support for Thai, Lao, English (UI & Data)
2. RBAC: Role-Based Access Control (Super Admin, Manager, Operation, Finance, Viewer)
3. Audit Logs: Every financial/data transaction must be logged
4. Security: bcryptjs for passwords, Zod for validation
5. Mobile-first: Worker & Agent portals are mobile apps

## Business Logic
- Workers have loans that are deducted from their salary
- Agents earn commission when workers complete conditions (e.g., work 15 days)
- Payroll files from factories need fuzzy matching with worker database
- Document versioning: old passports/visas are archived, not deleted
- SOS alerts from workers need real-time notification to admin

## Code Conventions
- Use Server Actions for mutations (not API routes)
- Use Zod schemas for all input validation
- Use TypeScript strict mode
- Component naming: PascalCase
- File naming: kebab-case
- Prisma models: PascalCase singular (Worker, Agent, Client)

## Current Codebase Location
/home/tataff_001/Desktop/CODE/v-erp-next

## Docker Services
- v-erp-app (Next.js on port 3000)
- v-erp-postgres (PostgreSQL)
- v-erp-redis (Redis for queue/cache)
- v-erp-minio (MinIO for file storage)
- nginx-proxy + acme-companion (SSL/Reverse Proxy)

Please generate code ensuring strict type safety and scalability.
```

---

## Extended Context (สำหรับงานที่ซับซ้อน)

### User Roles & Permissions

```typescript
type Role = 'SUPER_ADMIN' | 'MANAGER' | 'OPERATION' | 'FINANCE' | 'VIEWER';

const permissions = {
  SUPER_ADMIN: ['*'], // ทำได้ทุกอย่าง
  MANAGER: ['read:*', 'write:*', 'approve:*'], // ลบไม่ได้
  OPERATION: ['read:worker', 'write:worker', 'read:agent', 'write:agent'],
  FINANCE: ['read:finance', 'write:finance', 'read:worker'],
  VIEWER: ['read:dashboard'], // Read-only
};
```

### Worker Status Flow

```
NEW_LEAD → SCREENING → PROCESSING → ACADEMY → READY → DEPLOYED → WORKING
                ↓                                            ↓
            REJECTED                                    TERMINATED
                                                            ↓
                                                        COMPLETED
```

### Loan Payment Logic

```typescript
// เมื่อได้รับเงินจากโรงงาน ให้ตัดยอดตามลำดับนี้:
function applyPayment(loan: Loan, amount: number) {
  let remaining = amount;
  
  // 1. ตัดดอกเบี้ยก่อน
  const interestDue = loan.interest - loan.paidInterest;
  const interestPaid = Math.min(remaining, interestDue);
  remaining -= interestPaid;
  
  // 2. ตัดค่าธรรมเนียม
  const feesDue = loan.fees - loan.paidFees;
  const feesPaid = Math.min(remaining, feesDue);
  remaining -= feesPaid;
  
  // 3. ตัดเงินต้น
  const principalPaid = remaining;
  
  return { interestPaid, feesPaid, principalPaid };
}
```

### Fuzzy Matching for Payroll

```typescript
// ใช้ Levenshtein distance สำหรับจับคู่ชื่อ
function matchWorker(excelName: string, workers: Worker[]) {
  const threshold = 0.8; // 80% similarity
  
  for (const worker of workers) {
    const similarity = levenshtein(excelName, worker.fullName);
    if (similarity >= threshold) {
      return { worker, confidence: similarity };
    }
  }
  return null; // ไม่พบ - ต้อง manual review
}
```

### Notification Priority

```typescript
type NotificationPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

const notificationChannels = {
  CRITICAL: ['inApp', 'email', 'push', 'line', 'sms'],
  HIGH: ['inApp', 'email', 'push'],
  NORMAL: ['inApp'],
  LOW: ['inApp'], // batched/digest
};
```

---

## File Structure Reference

```
v-erp-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, etc.)
│   │   ├── (dashboard)/       # Protected dashboard pages
│   │   │   ├── dashboard/     # Main dashboard
│   │   │   ├── workers/       # Worker management
│   │   │   ├── agents/        # Agent management
│   │   │   ├── clients/       # Client management
│   │   │   ├── finance/       # Financial center
│   │   │   └── settings/      # System settings
│   │   ├── api/               # API routes (minimal)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # Base UI components
│   │   ├── forms/             # Form components
│   │   ├── tables/            # Data tables
│   │   └── charts/            # Dashboard charts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client
│   │   ├── auth.ts            # Auth config
│   │   ├── utils.ts           # Utilities
│   │   └── validators/        # Zod schemas
│   ├── actions/               # Server Actions
│   │   ├── worker.ts
│   │   ├── agent.ts
│   │   ├── client.ts
│   │   └── finance.ts
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── docs/                      # Documentation
├── public/
└── docker-compose.yml
```

---

## Common Patterns

### Server Action Pattern

```typescript
// src/actions/worker.ts
'use server';

import { prisma } from '@/lib/prisma';
import { workerSchema } from '@/lib/validators/worker';
import { revalidatePath } from 'next/cache';

export async function createWorker(formData: FormData) {
  const validated = workerSchema.safeParse(Object.fromEntries(formData));
  
  if (!validated.success) {
    return { error: validated.error.flatten() };
  }
  
  const worker = await prisma.worker.create({
    data: validated.data,
  });
  
  revalidatePath('/workers');
  return { success: true, worker };
}
```

### Protected Route Pattern

```typescript
// src/app/(dashboard)/layout.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return <DashboardShell>{children}</DashboardShell>;
}
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://v-erp.itd.in.th

# Optional (for enhanced features)
REDIS_URL=redis://...
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...

# External APIs (future)
BCEL_API_KEY=...
FIREBASE_FCM_KEY=...
LINE_CHANNEL_TOKEN=...
```

---

## Handoff Notes

เมื่อส่งต่องานให้ AI Agent อื่นหรือ Developer ใหม่:

1. **อ่านเอกสารเหล่านี้ก่อน:**
   - `docs/PROJECT_BLUEPRINT.md` - ภาพรวมทั้งหมด
   - `docs/DATABASE_DESIGN.md` - โครงสร้าง DB
   - `docs/TECH_STACK_ENHANCED.md` - เทคโนโลยีที่ใช้
   - `ANTIGRAVITY_HANDOFF.md` - วิธี Deploy

2. **ตรวจสอบ Current State:**
   ```bash
   cd /home/tataff_001/Desktop/CODE/v-erp-next
   sudo docker-compose logs -f app
   ```

3. **Database Access:**
   ```bash
   sudo docker exec -it v-erp-postgres psql -U verp -d verp
   ```

4. **Admin Login:**
   - Email: `admin@v-group.la`
   - Password: (check `prisma/seed.js`)
