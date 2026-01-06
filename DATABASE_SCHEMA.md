# 🗄️ Database Schema Documentation

## Overview

V-ERP uses **PostgreSQL** as the primary database with **Prisma ORM** for type-safe database access.

**Database:** PostgreSQL 15  
**ORM:** Prisma  
**Migration Strategy:** Push-based (for rapid development)

---

## 📊 Schema Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    users    │◄──────│   workers   │──────►│   agents    │
└─────────────┘       └─────────────┘       └─────────────┘
                             │
                             │
                             ▼
                      ┌─────────────┐
                      │   clients   │
                      └─────────────┘
                             │
                             │
                             ▼
                      ┌─────────────┐
                      │  documents  │
                      └─────────────┘
```

---

## 📋 Tables

### 1. `users` - User Accounts

**Purpose:** Store admin, staff, and manager accounts

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `email` | String | No | - | Unique email |
| `password` | String | No | - | Hashed password (bcrypt) |
| `name` | String | No | - | Full name |
| `role` | Enum | No | STAFF | ADMIN, MANAGER, STAFF, AGENT, CLIENT |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | Auto | Update timestamp |

**Indexes:**
- Unique: `email`
- Index: `role`

**Relations:**
- Has many: `workers` (as createdBy)
- Has many: `agents` (as createdBy)
- Has many: `clients` (as createdBy)
- Has many: `auditLogs`

---

### 2. `workers` - Worker Information

**Purpose:** Store all worker/employee data

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `workerId` | String | No | Auto | Unique worker ID (WK-YYYYMMDD-XXX) |
| `firstNameTH` | String | No | - | Thai first name |
| `lastNameTH` | String | No | - | Thai last name |
| `firstNameEN` | String | Yes | - | English first name |
| `lastNameEN` | String | Yes | - | English last name |
| `nickname` | String | Yes | - | Nickname |
| `gender` | Enum | No | - | MALE, FEMALE, OTHER |
| `dateOfBirth` | DateTime | No | - | Date of birth |
| `nationality` | String | No | LAO | Nationality |
| `religion` | String | Yes | - | Religion |
| `phoneNumber` | String | Yes | - | Phone number |
| `email` | String | Yes | - | Email address |
| `lineId` | String | Yes | - | LINE ID |
| `address` | String | Yes | - | Address |
| `status` | Enum | No | PENDING | Worker status |
| `agentId` | String | Yes | - | Foreign key to agents |
| `clientId` | String | Yes | - | Foreign key to clients |
| `position` | String | Yes | - | Job position |
| `salary` | Float | Yes | - | Monthly salary |
| `startDate` | DateTime | Yes | - | Employment start date |
| `endDate` | DateTime | Yes | - | Employment end date |
| `passportNo` | String | Yes | - | Passport number |
| `passportExpiry` | DateTime | Yes | - | Passport expiry date |
| `visaNo` | String | Yes | - | Visa number |
| `visaExpiry` | DateTime | Yes | - | Visa expiry date |
| `workPermitNo` | String | Yes | - | Work permit number |
| `workPermitExpiry` | DateTime | Yes | - | Work permit expiry |
| `photoUrl` | String | Yes | - | Profile photo URL |
| `notes` | String | Yes | - | Additional notes |
| `createdById` | String | No | - | Foreign key to users |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | Auto | Update timestamp |

**Enums:**
- **Gender:** MALE, FEMALE, OTHER
- **WorkerStatus:** PENDING, PROCESSING, READY, WORKING, COMPLETED, TERMINATED

**Indexes:**
- Unique: `workerId`
- Index: `status`, `agentId`, `clientId`, `createdById`
- Text Search: `firstNameTH`, `lastNameTH`, `phoneNumber`

**Relations:**
- Belongs to: `users` (createdBy)
- Belongs to: `agents` (agent)
- Belongs to: `clients` (client)
- Has many: `documents`

---

### 3. `agents` - Agent Companies

**Purpose:** Store recruitment agent information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `agentId` | String | No | Auto | Unique agent ID (AG-YYYYMMDD-XXX) |
| `companyName` | String | No | - | Company name |
| `contactPerson` | String | No | - | Contact person name |
| `phoneNumber` | String | No | - | Phone number |
| `email` | String | Yes | - | Email address |
| `address` | String | Yes | - | Address |
| `taxId` | String | Yes | - | Tax ID number |
| `commissionRate` | Float | No | 0 | Commission percentage |
| `status` | String | No | ACTIVE | ACTIVE, INACTIVE |
| `notes` | String | Yes | - | Additional notes |
| `createdById` | String | No | - | Foreign key to users |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | Auto | Update timestamp |

**Indexes:**
- Unique: `agentId`
- Index: `status`, `createdById`

**Relations:**
- Belongs to: `users` (createdBy)
- Has many: `workers`
- Has many: `documents`

---

### 4. `clients` - Client Companies  

**Purpose:** Store employer/client information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `clientId` | String | No | Auto | Unique client ID (CL-YYYYMMDD-XXX) |
| `companyName` | String | No | - | Company name |
| `contactPerson` | String | No | - | Contact person name |
| `phoneNumber` | String | No | - | Phone number |
| `email` | String | Yes | - | Email address |
| `address` | String | Yes | - | Address |
| `taxId` | String | Yes | - | Tax ID number |
| `industry` | String | Yes | - | Industry type |
| `employeeCount` | Int | Yes | - | Number of employees |
| `status` | String | No | ACTIVE | ACTIVE, INACTIVE |
| `notes` | String | Yes | - | Additional notes |
| `createdById` | String | No | - | Foreign key to users |
| `createdAt` | DateTime | No | now() | Creation timestamp |
| `updatedAt` | DateTime | No | Auto | Update timestamp |

**Indexes:**
- Unique: `clientId`
- Index: `status`, `industry`, `createdById`

**Relations:**
- Belongs to: `users` (createdBy)
- Has many: `workers`
- Has many: `documents`

---

### 5. `documents` - File Uploads

**Purpose:** Store uploaded document metadata

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `filename` | String | No | - | Stored filename |
| `originalName` | String | No | - | Original filename |
| `mimeType` | String | No | - | File MIME type |
| `size` | Int | No | - | File size (bytes) |
| `url` | String | No | - | File URL/path |
| `category` | String | No | - | passport, visa, contract, etc. |
| `workerId` | String | Yes | - | Foreign key to workers |
| `agentId` | String | Yes | - | Foreign key to agents |
| `clientId` | String | Yes | - | Foreign key to clients |
| `createdAt` | DateTime | No | now() | Upload timestamp |

**Indexes:**
- Index: `workerId`, `agentId`, `clientId`, `category`

**Relations:**
- Belongs to: `workers` (optional)
- Belongs to: `agents` (optional)
- Belongs to: `clients` (optional)

---

### 6. `audit_logs` - Activity Tracking

**Purpose:** Track all user actions for audit

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | String (CUID) | No | Auto | Primary key |
| `userId` | String | No | - | Foreign key to users |
| `action` | String | No | - | CREATE, UPDATE, DELETE, LOGIN, etc. |
| `entity` | String | No | - | Worker, Agent, Client, etc. |
| `entityId` | String | Yes | - | ID of affected entity |
| `details` | String | Yes | - | JSON string with details |
| `ipAddress` | String | Yes | - | User's IP address |
| `userAgent` | String | Yes | - | User's browser info |
| `createdAt` | DateTime | No | now() | Action timestamp |

**Indexes:**
- Index: `userId`, `action`, `entity`, `createdAt`

**Relations:**
- Belongs to: `users`

---

## 🔍 Common Queries

### Get Workers with Relations
```sql
SELECT w.*, 
       u.name as created_by_name,
       a.company_name as agent_name,
       c.company_name as client_name
FROM workers w
LEFT JOIN users u ON w.created_by_id = u.id
LEFT JOIN agents a ON w.agent_id = a.id
LEFT JOIN clients c ON w.client_id = c.id
WHERE w.status = 'WORKING'
ORDER BY w.created_at DESC;
```

### Get Agent Statistics
```sql
SELECT a.*,
       COUNT(w.id) as worker_count,
       SUM(w.salary) as total_salary
FROM agents a
LEFT JOIN workers w ON w.agent_id = a.id AND w.status = 'WORKING'
GROUP BY a.id;
```

### Expiring Visas
```sql
SELECT w.worker_id, w.first_name_th, w.last_name_th, w.visa_expiry
FROM workers w
WHERE w.visa_expiry BETWEEN NOW() AND NOW() + INTERVAL '90 days'
  AND w.status IN ('READY', 'WORKING')
ORDER BY w.visa_expiry ASC;
```

---

## 🔧 Maintenance

### Backup
```bash
pg_dump -U verp_admin -h localhost v_erp > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -U verp_admin -h localhost v_erp < backup_20260105.sql
```

### Vacuum
```sql
VACUUM ANALYZE workers;
VACUUM ANALYZE agents;
VACUUM ANALYZE clients;
```

---

## 📈 Performance Optimization

### Recommended Indexes (Already in Schema)
- Workers: `worker_id`, `status`, `agent_id`, `client_id`
- Agents: `agent_id`, `status`
- Clients: `client_id`, `status`
- Audit Logs: `user_id`, `created_at`

### Query Optimization Tips
1. Use `SELECT` with specific columns instead of `SELECT *`
2. Add pagination for large result sets
3. Use database indexes for frequently searched fields
4. Consider materialized views for complex reports

---

## 🔮 Future Enhancements

### Planned Tables:
- `notifications` - Push notifications
- `reports` - Saved report configurations
- `settings` - System configuration
- `invoices` - Billing information
- `payments` - Payment tracking

### Planned Fields:
- Workers: `emergency_contact`, `medical_info`
- Agents: `bank_account`, `contract_start_date`
- Clients: `billing_address`, `credit_limit`
