# V-ERP Next.js Full-Stack

> ระบบ ERP สำหรับธุรกิจจัดหาแรงงาน (Labor Management Platform)

## ✅ Project Status: 75% Complete & Deployable

### 🎯 สิ่งที่พร้อมใช้งาน:
- ✅ Authentication & Authorization (NextAuth.js)
- ✅ Workers Management (CRUD + Pipeline)
- ✅ Agents Management (CRUD)
- ✅ Clients Management (CRUD)
- ✅ Finance Module (Basic)
- ✅ Documents Management
- ✅ Settings Page (Reset Database)
- ✅ SOS Alerts
- ✅ Academy (Placeholder)
- ✅ User Management
- ✅ Orders Module
- ✅ Address Selector Component

### 🛠️ Tech Stack:
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **i18n:** next-intl (TH/LA/EN)

---

## 🚀 Quick Start

### ⚡ Recommended: Run Dev Server on Host

```bash
# Quick start (recommended)
./scripts/dev.sh

# Or manual:
sudo docker-compose up -d postgres redis minio
npm run dev
```

เข้าใช้งาน: **http://localhost:3000**

### 🔐 Login Credentials

```
📧 admin@v-group.la
🔑 admin123
```

---

## 📖 Documentation

- [📘 Development Guide](./DEV_GUIDE.md) - คู่มือการพัฒนาแบบละเอียด
- [📝 TODO & Roadmap](./TODO.md) - แผนงานและฟีเจอร์ที่เหลือ
- [🔧 Scripts README](./scripts/README.md) - คำอธิบาย helper scripts

---

## 📁 Project Structure

```
v-erp-next/
├── prisma/
│   ├── schema.prisma          # Database Schema
│   └── seed-full.js           # Seed Data
├── src/
│   ├── actions/               # Server Actions
│   ├── app/[locale]/
│   │   ├── dashboard/        # Main Dashboard (V-CORE)
│   │   │   ├── workers/      # ✅ Workers Module
│   │   │   ├── agents/       # ✅ Agents Module
│   │   │   ├── clients/      # ✅ Clients Module
│   │   │   ├── finance/      # ✅ Finance Module
│   │   │   ├── documents/    # ✅ Documents Module
│   │   │   ├── sos/          # ✅ SOS Alerts
│   │   │   ├── academy/      # ✅ Academy (Placeholder)
│   │   │   ├── users/        # ✅ User Management
│   │   │   ├── orders/       # ✅ Orders Module
│   │   │   └── settings/     # ✅ Settings
│   │   └── api/              # API Routes
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── address/          # ✅ AddressSelector
│   │   ├── layout/           # Layout components
│   │   └── ...               # Other components
│   ├── lib/                  # Utilities
│   └── messages/             # i18n translations
├── scripts/
│   ├── dev.sh               # ✅ Start dev environment
│   └── stop.sh              # ✅ Stop services
├── DEV_GUIDE.md             # ✅ Development guide
├── docker-compose.yml       # Docker services
└── Dockerfile               # Production dockerfile
```

---

## 🎨 Features

### ✅ Core Modules

| Module | Features | Status |
|--------|----------|--------|
| **Workers** | CRUD, Pipeline, Status Management | ✅ Complete |
| **Agents** | CRUD, Worker Assignment | ✅ Complete |
| **Clients** | CRUD, Worker Assignment | ✅ Complete |
| **Finance** | Loans, Payments, Commissions | ✅ Basic |
| **Documents** | Upload, Expiry Alerts | ✅ Complete |
| **Orders** | Status Workflow, Assignment | ✅ Basic |
| **Users** | Role-based Permissions | ✅ Complete |
| **Settings** | Reset Database, Profile | ✅ Basic |

### 🔄 In Progress

- [ ] Dashboard Charts & Analytics
- [ ] Global Search
- [ ] Real-time Notifications
- [ ] Commission Calculator
- [ ] Create Order Form
- [ ] Training Schedule Management

---

## 🐳 Docker Services

### Services Included

```yaml
- PostgreSQL (Database)
- Redis (Cache & Sessions)
- MinIO (File Storage)
- Nginx (Reverse Proxy - Production)
```

### Commands

```bash
# Start all services
sudo docker-compose up -d

# View logs
sudo docker-compose logs -f

# Stop services
sudo docker-compose down

# Restart specific service
sudo docker-compose restart postgres
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start dev server (on host)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio (GUI)
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
node prisma/seed-full.js  # Seed data

# Testing
npm test            # Run Jest tests

# Helper Scripts
./scripts/dev.sh    # Start dev environment
./scripts/stop.sh   # Stop all services
```

---

## 🌍 Internationalization

รองรับ 3 ภาษา:
- 🇹🇭 ภาษาไทย (th)
- 🇱🇦 ພາສາລາວ (la)
- 🇬🇧 English (en)

เปลี่ยนภาษาได้ที่ Header dropdown

---

## 🚀 Deployment

### Production (Docker)

```bash
# Build and start
sudo docker-compose up -d --build

# App runs on port 3000
# Use nginx as reverse proxy
```

### Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
REDIS_URL=redis://redis:6379
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

### Database Connection Error

```bash
sudo docker-compose restart postgres
```

### Prisma Client Out of Sync

```bash
npx prisma generate
```

ดูเพิ่มเติมที่ [DEV_GUIDE.md](./DEV_GUIDE.md)

---

## 📊 Version History

- **v1.2.0** (2026-01-06) - Settings, Documents, SOS, Academy, Users, Orders, AddressSelector
- **v1.1.0** - Workers, Agents, Clients modules complete
- **v1.0.0** - Initial release with authentication

---

## 📄 License

© 2026 V-GROUP. All rights reserved.

---

## 👥 Team

Developed by V-GROUP Development Team

For questions or support, contact: admin@v-group.la
