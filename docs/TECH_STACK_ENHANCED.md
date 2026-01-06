# Technology Stack (Enhanced) - V-CORE ERP

> **Version:** 2.0.0  
> **Last Updated:** 2026-01-06

---

## 1. Frontend (หน้าบ้าน)

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.x | App Router, Server Actions, SSR/SSG |
| **React** | 19.x | UI Components |
| **TypeScript** | 5.x | Type Safety |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.x | Utility-first CSS |
| **Lucide React** | Latest | Icons |
| **next-themes** | Latest | Dark/Light Mode |

### Fonts (รองรับ TH/LA/EN)
```css
/* Primary: Inter (EN) + Sarabun (TH) + Noto Sans Lao (LA) */
font-family: 'Inter', 'Sarabun', 'Noto Sans Lao', sans-serif;
```

---

## 2. Backend (หลังบ้าน)

### Core
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.x | REST API Endpoints |
| **Server Actions** | Built-in | Form Handling, Mutations |
| **Prisma ORM** | 6.x | Database Access |

### Authentication & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| **NextAuth.js** | 4.x | Authentication |
| **bcryptjs** | 2.x | Password Hashing |
| **Zod** | 3.x | Input Validation |

### Background Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **BullMQ** | Latest | Job Queue |
| **Redis** | 7.x | Queue Backend, Caching |

### Real-time Communication
| Technology | Version | Purpose |
|------------|---------|---------|
| **Socket.io** | Latest | WebSocket (SOS, Tracking) |

---

## 3. Database (ฐานข้อมูล)

### Primary Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16.x | Main Database |
| **Prisma** | 6.x | ORM & Migrations |

### Caching Layer
| Technology | Version | Purpose |
|------------|---------|---------|
| **Redis** | 7.x | Session, Cache, Queue |

---

## 4. File Storage (เก็บไฟล์)

### Object Storage
| Technology | Version | Purpose |
|------------|---------|---------|
| **MinIO** | Latest | S3-compatible (Self-hosted) |

### File Types
- Passport scans (PDF/Image)
- Visa documents
- Work permits
- Contracts
- Profile photos

---

## 5. Infrastructure (โครงสร้างพื้นฐาน)

### Containerization
| Technology | Version | Purpose |
|------------|---------|---------|
| **Docker** | 24.x | Containerization |
| **Docker Compose** | 2.x | Multi-container Orchestration |

### Reverse Proxy & SSL
| Technology | Version | Purpose |
|------------|---------|---------|
| **Nginx Proxy** | Latest | Reverse Proxy |
| **ACME Companion** | Latest | Let's Encrypt SSL |

### Server
| Spec | Value |
|------|-------|
| **OS** | Ubuntu 22.04 LTS |
| **Location** | GCP (asia-southeast1) |
| **IP** | 34.142.158.126 |
| **Domain** | v-erp.itd.in.th |

---

## 6. DevOps & Tools

### Development
| Tool | Purpose |
|------|---------|
| **ESLint** | Code Linting |
| **Prettier** | Code Formatting |
| **npm** | Package Manager |

### Monitoring (Recommended)
| Tool | Purpose |
|------|---------|
| **Sentry** | Error Tracking |
| **Prometheus + Grafana** | Metrics & Dashboards |

---

## 7. Internationalization (i18n)

### Language Support
| Language | Code | Font |
|----------|------|------|
| Thai | `th` | Sarabun |
| Lao | `la` | Noto Sans Lao |
| English | `en` | Inter |

### Implementation
| Technology | Purpose |
|------------|---------|
| **next-intl** | UI Translation |
| **JSONB (Postgres)** | Data Translation |

---

## 8. Docker Services

```yaml
services:
  # Main Application
  v-erp-app:
    image: v-erp-next:latest
    port: 3000 (internal)
    
  # Database
  v-erp-postgres:
    image: postgres:16
    port: 5432 (internal)
    volume: postgres_data
    
  # Cache & Queue
  v-erp-redis:
    image: redis:7-alpine
    port: 6379 (internal)
    
  # File Storage
  v-erp-minio:
    image: minio/minio
    port: 9000, 9001 (internal)
    volume: minio_data
    
  # Reverse Proxy
  nginx-proxy:
    image: nginxproxy/nginx-proxy
    port: 80, 443
    
  acme-companion:
    image: nginxproxy/acme-companion
```

---

## 9. Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@v-erp-postgres:5432/verp

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://v-erp.itd.in.th

# Redis
REDIS_URL=redis://v-erp-redis:6379

# MinIO
MINIO_ENDPOINT=v-erp-minio:9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# External APIs (Future)
BCEL_API_KEY=xxx
KASIKORN_API_KEY=xxx
FIREBASE_FCM_KEY=xxx
LINE_CHANNEL_TOKEN=xxx
```

---

## 10. Color Palette

### Light Mode
| Element | Color | Hex |
|---------|-------|-----|
| Background | Slate-50 | `#f8fafc` |
| Text | Navy-900 | `#0f172a` |
| Primary | Brand Blue | `#2563eb` |
| Accent | Emerald | `#10b981` |

### Dark Mode
| Element | Color | Hex |
|---------|-------|-----|
| Background | Slate-900 | `#0f172a` |
| Text | Slate-100 | `#f1f5f9` |
| Primary | Brand Gold | `#f59e0b` |
| Accent | Cyan | `#06b6d4` |
