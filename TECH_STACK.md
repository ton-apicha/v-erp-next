# Technology Stack - V-CORE ERP

> **Version:** 2.0.0  
> **Last Updated:** 2026-01-06  
> **ดูรายละเอียดเพิ่มเติมได้ที่:** [docs/TECH_STACK_ENHANCED.md](docs/TECH_STACK_ENHANCED.md)

---

## สรุปเทคโนโลยีหลัก

### Frontend (หน้าบ้าน)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | App Router, Server Actions |
| **React** | 19.x | UI Components |
| **TypeScript** | 5.x | Type Safety |
| **Tailwind CSS** | 3.x | Styling |
| **Lucide React** | Latest | Icons |
| **next-themes** | Latest | Dark/Light Mode |
| **next-intl** | Latest | i18n (TH/LA/EN) |

### Backend (หลังบ้าน)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API** | 15.x | REST Endpoints |
| **Server Actions** | Built-in | Mutations |
| **Prisma ORM** | 6.x | Database Access |
| **NextAuth.js** | 4.x | Authentication |
| **Zod** | 3.x | Validation |
| **BullMQ** | Latest | Job Queue |
| **Socket.io** | Latest | Real-time |

### Database & Storage
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16.x | Main Database |
| **Redis** | 7.x | Cache, Queue |
| **MinIO** | Latest | File Storage (S3) |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24.x | Containerization |
| **Docker Compose** | 2.x | Orchestration |
| **Nginx Proxy** | Latest | Reverse Proxy |
| **Let's Encrypt** | - | SSL/TLS |

---

## Docker Services

```yaml
v-erp-app       # Next.js (port 3000)
v-erp-postgres  # PostgreSQL (port 5432)
v-erp-redis     # Redis (port 6379)
v-erp-minio     # MinIO (port 9000, 9001)
nginx-proxy     # Nginx (port 80, 443)
acme-companion  # SSL Auto-renewal
```

---

## ภาษาที่รองรับ

| Language | Code | Font |
|----------|------|------|
| ไทย (Thai) | `th` | Sarabun |
| ລາວ (Lao) | `la` | Noto Sans Lao |
| English | `en` | Inter |
