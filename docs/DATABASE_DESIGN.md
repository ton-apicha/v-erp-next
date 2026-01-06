# Database Design - V-CORE ERP

> **Version:** 1.0.0  
> **Last Updated:** 2026-01-06  
> **ORM:** Prisma 6.x  
> **Database:** PostgreSQL 16.x

---

## 1. Entity Relationship Diagram (Overview)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              V-CORE DATABASE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│   │  User   │────>│ Worker  │<────│  Agent  │<────│ Client  │              │
│   └────┬────┘     └────┬────┘     └────┬────┘     └────┬────┘              │
│        │               │               │               │                    │
│        │               │               │               │                    │
│        v               v               v               v                    │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│   │AuditLog │     │Document │     │Commission│    │  Order  │              │
│   └─────────┘     └─────────┘     └─────────┘     └─────────┘              │
│                        │                                                    │
│                        v                                                    │
│                   ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│                   │  Loan   │────>│Payment  │     │Remittance│             │
│                   └─────────┘     └─────────┘     └─────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Models

### 2.1 User (ผู้ใช้งานระบบ)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  role          UserRole  @default(STAFF)
  
  // Preferences
  language      String    @default("th")  // th, en, la
  theme         String    @default("system") // light, dark, system
  
  // Meta
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  createdWorkers Worker[]   @relation("CreatedBy")
  createdAgents  Agent[]    @relation("CreatedBy")
  createdClients Client[]   @relation("CreatedBy")
  auditLogs      AuditLog[]
}

enum UserRole {
  SUPER_ADMIN   // เห็นทุกอย่าง ลบได้
  MANAGER       // เห็นทุกอย่าง แต่ลบไม่ได้
  OPERATION     // จัดการแรงงาน/Agent
  FINANCE       // จัดการการเงิน
  VIEWER        // ดูอย่างเดียว
}
```

### 2.2 Worker (แรงงาน)

```prisma
model Worker {
  id            String        @id @default(cuid())
  workerId      String        @unique // Auto: W-YYMMDD-XXXX
  
  // Personal Info (Multilingual)
  firstName     Json          // { "th": "...", "en": "...", "la": "..." }
  lastName      Json
  nickname      String?
  gender        Gender
  dateOfBirth   DateTime
  nationality   String        @default("LAO")
  religion      String?
  
  // Contact
  phoneNumber   String?
  email         String?
  lineId        String?
  address       Json?         // { "th": "...", "en": "...", "la": "..." }
  
  // Emergency Contact
  emergencyName     String?
  emergencyPhone    String?
  emergencyRelation String?
  
  // Employment
  status        WorkerStatus  @default(PENDING)
  agentId       String?
  clientId      String?
  position      String?
  salary        Decimal?      @db.Decimal(12, 2)
  startDate     DateTime?
  endDate       DateTime?
  
  // Scores
  behaviorScore Int?          @default(0) // 0-100
  skillLevel    String?       // BASIC, INTERMEDIATE, PREMIUM
  
  // Meta
  photoUrl      String?
  notes         String?
  isArchived    Boolean       @default(false)
  createdById   String
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  // Relations
  createdBy     User          @relation("CreatedBy", fields: [createdById], references: [id])
  agent         Agent?        @relation(fields: [agentId], references: [id])
  client        Client?       @relation(fields: [clientId], references: [id])
  documents     Document[]
  loans         Loan[]
  payments      Payment[]
  remittances   Remittance[]
  employmentHistory EmploymentHistory[]
  sosAlerts     SosAlert[]
  
  @@index([status])
  @@index([agentId])
  @@index([clientId])
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum WorkerStatus {
  NEW_LEAD      // รายชื่อดิบ
  SCREENING     // รอตรวจโรค/ประวัติ
  PROCESSING    // กำลังยื่นเอกสาร
  ACADEMY       // เข้าค่ายฝึก
  READY         // พร้อมส่งตัว
  DEPLOYED      // ส่งถึงโรงงานแล้ว
  WORKING       // กำลังทำงาน
  COMPLETED     // สิ้นสุดสัญญา
  TERMINATED    // เลิกจ้าง
  REJECTED      // ปฏิเสธ
}
```

### 2.3 Agent (ตัวแทน/นายหน้า)

```prisma
model Agent {
  id            String   @id @default(cuid())
  agentId       String   @unique // Auto: A-XXXX
  
  // Company Info
  companyName   String
  contactPerson String
  phoneNumber   String
  email         String?
  address       String?
  province      String?  // แขวง
  district      String?  // เมือง
  taxId         String?
  
  // Commission
  commissionRate Decimal  @default(0) @db.Decimal(5, 2)
  tier          Int       @default(1) // 1, 2, 3
  
  // Performance Metrics
  totalRecruits Int       @default(0)
  passRate      Decimal?  @db.Decimal(5, 2) // %
  dropoutRate   Decimal?  @db.Decimal(5, 2) // %
  
  // Meta
  status        AgentStatus @default(PENDING)
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  createdBy     User       @relation("CreatedBy", fields: [createdById], references: [id])
  workers       Worker[]
  documents     Document[]
  commissions   Commission[]
  materials     MaterialIssue[]
  
  @@index([status])
  @@index([province])
}

enum AgentStatus {
  PENDING   // รออนุมัติ
  ACTIVE    // ใช้งานได้
  SUSPENDED // ระงับชั่วคราว
  BANNED    // แบนถาวร
}
```

### 2.4 Client (นายจ้าง/โรงงาน)

```prisma
model Client {
  id            String   @id @default(cuid())
  clientId      String   @unique // Auto: C-XXXX
  
  // Company Info
  companyName   String
  companyNameEn String?
  contactPerson String
  phoneNumber   String
  email         String?
  address       String?
  taxId         String?
  
  // Business
  industry      String?
  employeeCount Int?
  
  // Credit & Quota
  creditLimit   Decimal? @db.Decimal(12, 2)
  mouQuotaTotal Int      @default(0)
  mouQuotaUsed  Int      @default(0)
  
  // Meta
  status        String   @default("ACTIVE")
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  createdBy     User       @relation("CreatedBy", fields: [createdById], references: [id])
  workers       Worker[]
  documents     Document[]
  orders        Order[]
  payrollFiles  PayrollFile[]
  
  @@index([status])
}
```

---

## 3. Document & Files

### 3.1 Document (เอกสาร)

```prisma
model Document {
  id            String   @id @default(cuid())
  
  // File Info
  filename      String
  originalName  String
  mimeType      String
  size          Int
  url           String   // MinIO URL
  
  // Classification
  category      DocCategory
  expiryDate    DateTime?
  
  // Ownership (ต้องมีอย่างน้อยหนึ่ง)
  workerId      String?
  agentId       String?
  clientId      String?
  
  // Version Control
  version       Int       @default(1)
  isActive      Boolean   @default(true) // false = archived
  replacedById  String?   // ID ของเอกสารใหม่ที่มาแทน
  
  // Meta
  uploadedById  String
  createdAt     DateTime @default(now())
  
  // Relations
  worker        Worker?  @relation(fields: [workerId], references: [id])
  agent         Agent?   @relation(fields: [agentId], references: [id])
  client        Client?  @relation(fields: [clientId], references: [id])
  
  @@index([category])
  @@index([workerId])
  @@index([expiryDate])
}

enum DocCategory {
  PASSPORT
  VISA
  WORK_PERMIT
  MEDICAL_CERT     // ใบรับรองแพทย์
  CRIMINAL_CHECK   // ใบตรวจประวัติอาชญากรรม
  CONTRACT
  ID_CARD
  PHOTO
  OTHER
}
```

---

## 4. Financial Models

### 4.1 Loan (สินเชื่อ)

```prisma
model Loan {
  id            String   @id @default(cuid())
  loanId        String   @unique // Auto: L-YYMMDD-XXXX
  
  workerId      String
  
  // Amount
  principal     Decimal  @db.Decimal(12, 2) // เงินต้น
  interestRate  Decimal  @db.Decimal(5, 2)  // ดอกเบี้ย %
  fees          Decimal  @default(0) @db.Decimal(12, 2) // ค่าธรรมเนียม
  totalAmount   Decimal  @db.Decimal(12, 2) // รวมทั้งหมด
  
  // Balance
  paidPrincipal Decimal  @default(0) @db.Decimal(12, 2)
  paidInterest  Decimal  @default(0) @db.Decimal(12, 2)
  paidFees      Decimal  @default(0) @db.Decimal(12, 2)
  balance       Decimal  @db.Decimal(12, 2) // ยอดคงเหลือ
  
  // Schedule
  installments  Int      // จำนวนงวด
  installmentAmount Decimal @db.Decimal(12, 2) // เงินต่องวด
  startDate     DateTime
  dueDate       DateTime
  
  // Status
  status        LoanStatus @default(ACTIVE)
  overdueMonths Int        @default(0)
  
  // Meta
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  worker        Worker   @relation(fields: [workerId], references: [id])
  payments      Payment[]
  
  @@index([status])
  @@index([workerId])
  @@index([overdueMonths])
}

enum LoanStatus {
  ACTIVE        // กำลังผ่อน
  PAID_OFF      // ชำระครบ
  OVERDUE       // ค้างชำระ
  WRITTEN_OFF   // ตัดหนี้สูญ
}
```

### 4.2 Payment (การชำระเงิน)

```prisma
model Payment {
  id            String   @id @default(cuid())
  paymentId     String   @unique // Auto: P-YYMMDD-XXXX
  
  workerId      String
  loanId        String
  payrollFileId String?  // ถ้ามาจากไฟล์ตัดเงินเดือน
  
  // Amount
  amount        Decimal  @db.Decimal(12, 2)
  principal     Decimal  @db.Decimal(12, 2) // ส่วนที่ตัดเงินต้น
  interest      Decimal  @db.Decimal(12, 2) // ส่วนที่ตัดดอกเบี้ย
  fees          Decimal  @default(0) @db.Decimal(12, 2)
  
  // Source
  source        PaymentSource
  reference     String?  // เลขอ้างอิงธนาคาร
  
  // Meta
  paymentDate   DateTime @default(now())
  period        String?  // เดือน/ปี (202601)
  notes         String?
  processedById String
  createdAt     DateTime @default(now())
  
  // Relations
  worker        Worker     @relation(fields: [workerId], references: [id])
  loan          Loan       @relation(fields: [loanId], references: [id])
  payrollFile   PayrollFile? @relation(fields: [payrollFileId], references: [id])
  
  @@index([workerId])
  @@index([loanId])
  @@index([paymentDate])
}

enum PaymentSource {
  PAYROLL       // ตัดจากเงินเดือน
  CASH          // ชำระเงินสด
  TRANSFER      // โอนเงิน
  ADJUSTMENT    // ปรับปรุงยอด
}
```

### 4.3 Remittance (โอนเงินกลับบ้าน)

```prisma
model Remittance {
  id            String   @id @default(cuid())
  remittanceId  String   @unique // Auto: R-YYMMDD-XXXX
  
  workerId      String
  
  // Sender (Worker)
  senderName    String
  senderPhone   String
  
  // Receiver (ญาติที่ลาว)
  receiverName  String
  receiverPhone String
  receiverBank  String?
  receiverAccount String?
  
  // Amount
  amountTHB     Decimal  @db.Decimal(12, 2) // จำนวนบาท
  exchangeRate  Decimal  @db.Decimal(10, 4) // อัตราแลกเปลี่ยน
  amountLAK     Decimal  @db.Decimal(12, 2) // จำนวนกีบ
  fee           Decimal  @default(0) @db.Decimal(12, 2) // ค่าธรรมเนียม
  
  // Status
  status        RemittanceStatus @default(PENDING)
  processedAt   DateTime?
  
  // Meta
  notes         String?
  processedById String?
  createdAt     DateTime @default(now())
  
  // Relations
  worker        Worker   @relation(fields: [workerId], references: [id])
  
  @@index([status])
  @@index([workerId])
}

enum RemittanceStatus {
  PENDING       // รอดำเนินการ
  PROCESSING    // กำลังโอน
  COMPLETED     // โอนสำเร็จ
  FAILED        // โอนไม่สำเร็จ
  CANCELLED     // ยกเลิก
}
```

---

## 5. Commission & Orders

### 5.1 Commission (ค่าคอมมิชชั่น)

```prisma
model Commission {
  id            String   @id @default(cuid())
  commissionId  String   @unique // Auto: CM-YYMMDD-XXXX
  
  agentId       String
  workerId      String   // คนงานที่ทำให้ได้คอมฯ
  
  // Amount
  amount        Decimal  @db.Decimal(12, 2)
  tier          Int      // Tier ที่คำนวณได้
  
  // Condition
  triggerEvent  String   // เช่น "WORKED_15_DAYS"
  triggerDate   DateTime
  
  // Status
  status        CommissionStatus @default(PENDING)
  approvedById  String?
  approvedAt    DateTime?
  paidAt        DateTime?
  paymentRef    String?  // เลขอ้างอิงการโอน
  
  // Meta
  notes         String?
  createdAt     DateTime @default(now())
  
  // Relations
  agent         Agent    @relation(fields: [agentId], references: [id])
  
  @@index([status])
  @@index([agentId])
}

enum CommissionStatus {
  PENDING       // รอคำนวณ
  CALCULATED    // คำนวณแล้ว รออนุมัติ
  APPROVED      // อนุมัติแล้ว รอจ่าย
  PAID          // จ่ายแล้ว
  REJECTED      // ปฏิเสธ
}
```

### 5.2 Order (คำสั่งจ้าง)

```prisma
model Order {
  id            String   @id @default(cuid())
  orderId       String   @unique // Auto: ORD-YYMMDD-XXXX
  
  clientId      String
  
  // Request
  requestedCount Int     // จำนวนคนที่ต้องการ
  gender        Gender?
  skills        String[] // ทักษะที่ต้องการ
  startDate     DateTime
  
  // Quotation
  pricePerHead  Decimal? @db.Decimal(12, 2)
  totalPrice    Decimal? @db.Decimal(12, 2)
  
  // Status
  status        OrderStatus @default(DRAFT)
  approvedAt    DateTime?
  
  // Deployment
  assignedWorkerIds String[] // รายชื่อคนงานที่ assign
  deployedAt    DateTime?
  
  // Meta
  notes         String?
  createdById   String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  client        Client   @relation(fields: [clientId], references: [id])
  
  @@index([status])
  @@index([clientId])
}

enum OrderStatus {
  DRAFT         // แบบร่าง
  QUOTED        // ส่งใบเสนอราคาแล้ว
  APPROVED      // นายจ้างอนุมัติ
  DEPLOYING     // กำลังจัดคน
  COMPLETED     // ส่งคนครบแล้ว
  CANCELLED     // ยกเลิก
}
```

---

## 6. Audit & Logs

### 6.1 AuditLog (ประวัติการใช้งาน)

```prisma
model AuditLog {
  id            String   @id @default(cuid())
  
  userId        String
  action        String   // CREATE, UPDATE, DELETE, LOGIN, EXPORT
  entity        String   // Worker, Loan, Document, etc.
  entityId      String?
  
  // Changes
  oldValue      Json?    // ค่าเดิม
  newValue      Json?    // ค่าใหม่
  
  // Context
  ipAddress     String?
  userAgent     String?
  
  createdAt     DateTime @default(now())
  
  // Relations
  user          User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([entity])
  @@index([createdAt])
}
```

### 6.2 SosAlert (แจ้งเตือนฉุกเฉิน)

```prisma
model SosAlert {
  id            String   @id @default(cuid())
  
  workerId      String
  
  // Location
  latitude      Decimal? @db.Decimal(10, 8)
  longitude     Decimal? @db.Decimal(11, 8)
  
  // Status
  status        SosStatus @default(ACTIVE)
  resolvedAt    DateTime?
  resolvedById  String?
  resolution    String?   // บันทึกการแก้ไข
  
  createdAt     DateTime @default(now())
  
  // Relations
  worker        Worker   @relation(fields: [workerId], references: [id])
  
  @@index([status])
  @@index([createdAt])
}

enum SosStatus {
  ACTIVE        // กำลังดำเนินการ
  RESOLVED      // แก้ไขแล้ว
  FALSE_ALARM   // เตือนผิดพลาด
}
```

---

## 7. Supporting Models

### 7.1 PayrollFile (ไฟล์ตัดเงินเดือน)

```prisma
model PayrollFile {
  id            String   @id @default(cuid())
  
  clientId      String
  
  // File
  filename      String
  originalName  String
  url           String
  
  // Period
  period        String   // YYYYMM (202601)
  
  // Processing
  totalRows     Int      @default(0)
  matchedRows   Int      @default(0)
  unmatchedRows Int      @default(0)
  processedAt   DateTime?
  
  // Status
  status        PayrollStatus @default(UPLOADED)
  
  uploadedById  String
  createdAt     DateTime @default(now())
  
  // Relations
  client        Client    @relation(fields: [clientId], references: [id])
  payments      Payment[]
  
  @@index([clientId])
  @@index([period])
}

enum PayrollStatus {
  UPLOADED      // อัปโหลดแล้ว
  PROCESSING    // กำลังประมวลผล
  REVIEW        // รอตรวจสอบ
  CONFIRMED     // ยืนยันแล้ว
  REJECTED      // ปฏิเสธ
}
```

### 7.2 Notification (การแจ้งเตือน)

```prisma
model Notification {
  id            String   @id @default(cuid())
  
  userId        String?  // ถ้า null = broadcast
  
  // Content
  title         Json     // { "th": "...", "en": "...", "la": "..." }
  body          Json
  link          String?  // URL ที่จะพาไป
  
  // Priority
  priority      NotificationPriority @default(NORMAL)
  
  // Status
  isRead        Boolean  @default(false)
  readAt        DateTime?
  
  // Channels sent
  sentInApp     Boolean  @default(false)
  sentEmail     Boolean  @default(false)
  sentPush      Boolean  @default(false)
  sentLine      Boolean  @default(false)
  
  createdAt     DateTime @default(now())
  
  @@index([userId])
  @@index([isRead])
  @@index([priority])
}

enum NotificationPriority {
  CRITICAL      // SOS - ส่งทุกช่องทาง
  HIGH          // Urgent - Email + In-App
  NORMAL        // In-App only
  LOW           // Batch/Digest
}
```

---

## 8. Indexes & Performance

### Critical Indexes
```prisma
// Worker searches
@@index([status])
@@index([agentId])
@@index([clientId])
@@index([createdAt])

// Document expiry checks
@@index([expiryDate])
@@index([category, isActive])

// Financial queries
@@index([loanId, paymentDate])
@@index([status, overdueMonths])

// Audit trail
@@index([entity, entityId])
@@index([createdAt])
```

---

## 9. Data Migration Notes

### ID Generation
- ใช้ `cuid()` สำหรับ internal ID
- ใช้ pattern `PREFIX-YYMMDD-XXXX` สำหรับ human-readable ID

### Multilingual Fields
- เก็บเป็น `Json` type: `{ "th": "...", "en": "...", "la": "..." }`
- Query ด้วย `->>'th'` หรือ `@>` operator

### Financial Precision
- ใช้ `Decimal` type สำหรับจำนวนเงินทั้งหมด
- `@db.Decimal(12, 2)` สำหรับเงินบาท/กีบ
- `@db.Decimal(10, 4)` สำหรับอัตราแลกเปลี่ยน
