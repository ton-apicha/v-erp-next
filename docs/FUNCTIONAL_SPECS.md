# Functional Specifications - V-CORE ERP

> **Version:** 1.0.0  
> **Last Updated:** 2026-01-06  
> **Purpose:** รายละเอียดเชิงลึกของแต่ละ Module สำหรับ Developer

---

## Module A: Payroll Reconciliation (ระบบกระทบยอดเงินเดือน)

### Context
โรงงานส่งไฟล์ Excel เงินเดือนมา ชื่ออาจสะกดผิดหรือไม่ตรง 100%

### Features

#### A.1 File Upload
```
Input: Excel/CSV file from HR
Columns: รหัสพนักงาน, ชื่อ-สกุล, เงินเดือน, ยอดหัก
Output: Parsed data ready for matching
```

#### A.2 Fuzzy Matching Algorithm
```typescript
interface MatchResult {
  workerId: string;
  confidence: number; // 0-1
  matched: boolean;
  suggestion?: Worker; // ถ้า confidence 0.6-0.8
}

// Algorithm: Levenshtein Distance
// Threshold: >= 0.8 = auto-match
//           0.6-0.8 = suggest for review
//           < 0.6 = manual only
```

#### A.3 Discrepancy Report
| Column | Description |
|--------|-------------|
| Row # | บรรทัดใน Excel |
| Excel Name | ชื่อใน Excel |
| Matched Worker | คนงานที่จับคู่ได้ |
| Confidence | ความมั่นใจ % |
| Status | ✅ Auto / ⚠️ Review / ❌ Manual |
| Action | Dropdown เลือกคนงาน |

#### A.4 Payment Distribution Logic
```typescript
function distributePayment(worker: Worker, amount: number) {
  const loan = worker.activeLoan;
  if (!loan) return { type: 'NO_LOAN', amount };
  
  let remaining = amount;
  const result = { interest: 0, fees: 0, principal: 0 };
  
  // Step 1: ตัดดอกเบี้ยก่อน
  const interestDue = loan.interestDue;
  result.interest = Math.min(remaining, interestDue);
  remaining -= result.interest;
  
  // Step 2: ตัดค่าธรรมเนียม
  const feesDue = loan.feesDue;
  result.fees = Math.min(remaining, feesDue);
  remaining -= result.fees;
  
  // Step 3: ตัดเงินต้น
  result.principal = remaining;
  
  // Step 4: ถ้ายอดไม่พอ → สร้าง Arrears
  const shortfall = loan.installmentAmount - amount;
  if (shortfall > 0) {
    createArrearsRecord(worker, shortfall);
  }
  
  return result;
}
```

#### A.5 Audit Trail
```typescript
interface PayrollAudit {
  fileId: string;
  originalFilename: string;
  uploadedBy: string;
  uploadedAt: Date;
  totalRows: number;
  autoMatched: number;
  manualMatched: number;
  confirmedBy: string;
  confirmedAt: Date;
}
```

---

## Module B: Notification Center (ศูนย์แจ้งเตือน)

### Channels

| Channel | Use Case | Library |
|---------|----------|---------|
| In-App | ทุกแจ้งเตือน | Database + WebSocket |
| Email | สำคัญขึ้นไป | Resend / SendGrid |
| Push | Mobile users | Firebase FCM |
| LINE | นายจ้างไทย | LINE Messaging API |
| SMS | ฉุกเฉินสุด | Twilio (optional) |

### Priority System

```typescript
enum NotificationPriority {
  CRITICAL = 'CRITICAL', // SOS - ทุกช่องทาง + เสียงเตือน
  HIGH = 'HIGH',         // Visa Expiry - Email + In-App
  NORMAL = 'NORMAL',     // Updates - In-App only
  LOW = 'LOW',           // News - Batched/Digest
}

const channelsByPriority: Record<NotificationPriority, Channel[]> = {
  CRITICAL: ['inApp', 'email', 'push', 'line', 'sms'],
  HIGH: ['inApp', 'email', 'push'],
  NORMAL: ['inApp'],
  LOW: ['inApp'], // batched
};
```

### Grouping Logic
```typescript
// ถ้ามีแจ้งเตือนเรื่องเดียวกัน 50+ รายการ ให้รวบ
interface GroupedNotification {
  type: string;
  count: number;
  title: string; // "อนุมัติแล้ว 50 รายการ"
  items: Notification[];
}

function shouldGroup(notifications: Notification[]): boolean {
  return notifications.length > 10 && 
         notifications.every(n => n.type === notifications[0].type);
}
```

### Templates

```typescript
const templates = {
  VISA_EXPIRY: {
    th: 'วีซ่าของ {{name}} จะหมดอายุใน {{days}} วัน',
    en: 'Visa for {{name}} expires in {{days}} days',
    la: 'ວີຊາຂອງ {{name}} ຈະໝົດອາຍຸໃນ {{days}} ມື້',
  },
  PAYMENT_RECEIVED: {
    th: 'ได้รับชำระเงิน {{amount}} บาท ยอดคงเหลือ {{balance}} บาท',
    en: 'Payment received: {{amount}} THB. Remaining: {{balance}} THB',
    la: 'ຮັບເງິນແລ້ວ {{amount}} ບາດ ຍອດຄ້າງ {{balance}} ບາດ',
  },
  SOS_ALERT: {
    th: '🆘 แจ้งเตือนฉุกเฉิน! {{name}} ขอความช่วยเหลือ',
    en: '🆘 EMERGENCY! {{name}} is requesting help',
    la: '🆘 ສຸກເສີນ! {{name}} ຂໍຄວາມຊ່ວຍເຫຼືອ',
  },
};
```

---

## Module C: Document Management (จัดการเอกสาร)

### Version Control Logic

```typescript
interface Document {
  id: string;
  category: DocCategory;
  version: number;
  isActive: boolean; // true = current, false = archived
  replacedById: string | null;
  expiryDate: Date | null;
}

// เมื่อต่ออายุเอกสาร
async function renewDocument(oldDocId: string, newFile: File) {
  const oldDoc = await prisma.document.findUnique({ where: { id: oldDocId }});
  
  // 1. Upload ไฟล์ใหม่
  const newDoc = await prisma.document.create({
    data: {
      ...newFile,
      version: oldDoc.version + 1,
      isActive: true,
    }
  });
  
  // 2. Archive เอกสารเก่า (ห้ามลบ!)
  await prisma.document.update({
    where: { id: oldDocId },
    data: { 
      isActive: false,
      replacedById: newDoc.id,
    }
  });
  
  return newDoc;
}
```

### Expiry Monitoring

```typescript
// Cron Job: รันทุกเช้า 8:00
async function checkDocumentExpiry() {
  const thresholds = [7, 30, 60, 90]; // วัน
  
  for (const days of thresholds) {
    const expiringDocs = await prisma.document.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gte: new Date(),
          lte: addDays(new Date(), days),
        }
      },
      include: { worker: true }
    });
    
    for (const doc of expiringDocs) {
      await createNotification({
        type: 'DOCUMENT_EXPIRY',
        priority: days <= 7 ? 'HIGH' : 'NORMAL',
        data: { doc, worker: doc.worker, daysLeft: days }
      });
    }
  }
}
```

---

## Module D: Commission Calculation (คำนวณค่าคอมฯ)

### Trigger Conditions

```typescript
enum CommissionTrigger {
  WORKER_DEPLOYED = 'WORKER_DEPLOYED',     // ส่งคนถึงโรงงาน
  WORKED_15_DAYS = 'WORKED_15_DAYS',       // ทำงานครบ 15 วัน
  WORKED_30_DAYS = 'WORKED_30_DAYS',       // ทำงานครบ 30 วัน
  CONTRACT_COMPLETE = 'CONTRACT_COMPLETE', // ครบสัญญา
}

interface CommissionRule {
  trigger: CommissionTrigger;
  tier: number;
  amount: number;
}

const commissionRules: CommissionRule[] = [
  { trigger: 'WORKED_15_DAYS', tier: 1, amount: 2000 },
  { trigger: 'WORKED_15_DAYS', tier: 2, amount: 2500 },
  { trigger: 'WORKED_15_DAYS', tier: 3, amount: 3000 },
];
```

### Calculation Flow

```typescript
// Event: Worker ทำงานครบ 15 วัน
async function onWorkerMilestone(workerId: string, milestone: string) {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: { agent: true }
  });
  
  if (!worker.agent) return;
  
  const rule = commissionRules.find(
    r => r.trigger === milestone && r.tier === worker.agent.tier
  );
  
  if (rule) {
    await prisma.commission.create({
      data: {
        agentId: worker.agentId,
        workerId: worker.id,
        amount: rule.amount,
        tier: rule.tier,
        triggerEvent: milestone,
        triggerDate: new Date(),
        status: 'CALCULATED', // รออนุมัติ
      }
    });
    
    // Notify admin
    await createNotification({
      type: 'COMMISSION_PENDING',
      userId: null, // broadcast to finance
      data: { agent: worker.agent, amount: rule.amount }
    });
  }
}
```

### Approval Flow

```
CALCULATED → [Finance Review] → APPROVED → [Payment Process] → PAID
                    ↓
                REJECTED (with reason)
```

---

## Module E: SOS Alert System (ระบบแจ้งเตือนฉุกเฉิน)

### Alert Creation

```typescript
interface SosAlert {
  id: string;
  workerId: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM';
  createdAt: Date;
  resolvedAt: Date | null;
  resolvedById: string | null;
  resolution: string | null;
}

// V-LIFE App กดปุ่ม SOS
async function createSosAlert(workerId: string, location: GeoLocation) {
  const alert = await prisma.sosAlert.create({
    data: {
      workerId,
      latitude: location.lat,
      longitude: location.lng,
      status: 'ACTIVE',
    }
  });
  
  // 1. Broadcast ผ่าน WebSocket ไปทุก Admin ที่ online
  io.to('admins').emit('sos:new', alert);
  
  // 2. ส่ง Push Notification ให้ทุก Admin
  await sendPushToAdmins({
    title: '🆘 SOS ALERT',
    body: `${worker.nickname} ขอความช่วยเหลือ!`,
    sound: 'emergency.wav',
  });
  
  // 3. Log to AuditLog
  await logAction('SOS_CREATED', alert);
  
  return alert;
}
```

### Dashboard Display

```typescript
// Real-time subscription
const sosAlerts$ = socket.fromEvent<SosAlert>('sos:new');
const sosUpdates$ = socket.fromEvent<SosAlert>('sos:updated');

// UI: แสดงไฟกระพริบแดง + แผนที่ GPS + ข้อมูลติดต่อ
interface SosDisplayData {
  alert: SosAlert;
  worker: Worker;
  emergencyContacts: {
    supervisor: { name: string; phone: string };
    relative: { name: string; phone: string };
  };
  nearbyFacilities: {
    hospital: string;
    policeStation: string;
  };
}
```

### Resolution Flow

```typescript
async function resolveSosAlert(
  alertId: string, 
  userId: string, 
  resolution: string
) {
  const alert = await prisma.sosAlert.update({
    where: { id: alertId },
    data: {
      status: 'RESOLVED',
      resolvedById: userId,
      resolvedAt: new Date(),
      resolution,
    }
  });
  
  // Broadcast to all admins
  io.to('admins').emit('sos:resolved', alert);
  
  // Log
  await logAction('SOS_RESOLVED', alert);
  
  return alert;
}
```

---

## Module F: Offline Mode (สำหรับ V-LIFE & V-PARTNER)

### Progressive Web App Setup

```javascript
// next.config.mjs
import withPWA from 'next-pwa';

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
```

### Offline Data Sync

```typescript
// Service Worker: Background Sync
interface PendingRecord {
  id: string;
  type: 'worker' | 'document' | 'report';
  data: any;
  createdAt: Date;
  synced: boolean;
}

// บันทึกข้อมูลลง IndexedDB เมื่อ offline
async function saveOffline(data: PendingRecord) {
  const db = await openDB('v-erp-offline', 1);
  await db.put('pending', data);
}

// Sync เมื่อต่อเน็ต
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending') {
    event.waitUntil(syncPendingRecords());
  }
});

async function syncPendingRecords() {
  const db = await openDB('v-erp-offline', 1);
  const pending = await db.getAll('pending');
  
  for (const record of pending) {
    try {
      await fetch('/api/sync', {
        method: 'POST',
        body: JSON.stringify(record.data),
      });
      await db.delete('pending', record.id);
    } catch (e) {
      // จะ retry ครั้งถัดไป
    }
  }
}
```

### Conflict Resolution

```typescript
// เมื่อ Sync กลับมา อาจเจอ conflict
interface ConflictResolution {
  strategy: 'CLIENT_WINS' | 'SERVER_WINS' | 'MANUAL';
  mergeFunction?: (client: any, server: any) => any;
}

const conflictRules: Record<string, ConflictResolution> = {
  'worker:status': { strategy: 'SERVER_WINS' }, // status ใช้ค่าจาก server
  'worker:notes': { 
    strategy: 'MANUAL',
    mergeFunction: (c, s) => `${s}\n---\n${c}` // รวมกัน
  },
};
```

---

## Module G: Report Generation (สร้างรายงาน)

### Report Types

| Report | Description | Format |
|--------|-------------|--------|
| Worker List | รายชื่อแรงงานตามสถานะ | Excel, PDF |
| Loan Aging | อายุหนี้ค้างชำระ | Excel, PDF |
| Commission | ค่าคอมฯ รอจ่าย | Excel |
| P&L | กำไรขาดทุน | PDF |
| Audit Log | ประวัติการใช้งาน | CSV |

### Background Job for Large Reports

```typescript
// ใช้ BullMQ สำหรับรายงานขนาดใหญ่
import { Queue, Worker } from 'bullmq';

const reportQueue = new Queue('reports', { connection: redis });

// Request report
async function requestReport(type: string, filters: any, userId: string) {
  const job = await reportQueue.add('generate', {
    type,
    filters,
    userId,
    requestedAt: new Date(),
  });
  
  return job.id;
}

// Worker process
const reportWorker = new Worker('reports', async (job) => {
  const { type, filters, userId } = job.data;
  
  // Generate report (อาจใช้เวลานาน)
  const file = await generateReport(type, filters);
  
  // Upload to MinIO
  const url = await uploadToMinio(file);
  
  // Notify user
  await createNotification({
    userId,
    type: 'REPORT_READY',
    data: { reportType: type, downloadUrl: url },
  });
  
  return { url };
}, { connection: redis });
```

---

## Module H: i18n Implementation (ระบบหลายภาษา)

### next-intl Setup

```typescript
// src/i18n.ts
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default
}));

// src/messages/th.json
{
  "common": {
    "save": "บันทึก",
    "cancel": "ยกเลิก",
    "delete": "ลบ"
  },
  "worker": {
    "status": {
      "PENDING": "รอดำเนินการ",
      "DEPLOYED": "ส่งตัวแล้ว"
    }
  }
}

// src/messages/la.json
{
  "common": {
    "save": "ບັນທຶກ",
    "cancel": "ຍົກເລີກ",
    "delete": "ລຶບ"
  }
}
```

### Database Multilingual Fields

```typescript
// Prisma: เก็บเป็น Json
model Worker {
  firstName Json // { "th": "สมชาย", "en": "Somchai", "la": "ສົມໃຈ" }
}

// Helper function
function getLocalizedValue(field: Json, locale: string): string {
  const values = field as Record<string, string>;
  return values[locale] || values['th'] || Object.values(values)[0];
}

// Usage
const name = getLocalizedValue(worker.firstName, 'la'); // "ສົມໃຈ"
```
