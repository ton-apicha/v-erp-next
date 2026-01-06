# V-ERP Next.js Full-Stack

> ระบบ ERP สำหรับธุรกิจจัดหาแรงงาน (Lean Architecture)

## ✅ Project Status: 60% Complete & Deployable

### สิ่งที่พร้อมใช้งาน:
- ✅ Phase 1: Project Setup (Complete)
- ✅ Phase 2: Authentication & Login (Complete)
- ✅ Phase 3: Workers CRUD (Complete)
- ✅ Phase 4: Agents & Clients (Basic - Complete)  
- ✅ Phase 5: Deployment Files (Complete)

### Tech Stack:
- **Framework:** Next.js 15 (App Router)
- **Database:** PostgreSQL (Prisma ORM)
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Language:** TypeScript

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database
```bash
# On VM (35.197.153.65):
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE USER verp_admin WITH PASSWORD 'your_secure_password';
CREATE DATABASE v_erp OWNER verp_admin;
GRANT ALL PRIVILEGES ON DATABASE v_erp TO verp_admin;
\q
```

### 3. Update .env.local
```env
DATABASE_URL="postgresql://verp_admin:your_password@localhost:5432/v_erp?schema=public"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 4. Push Database Schema
```bash
npm run db:push
```

### 5. Run Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 📁 Project Structure

```
V-ERP-Next/
├── prisma/
│   └── schema.prisma          # Database Schema
├── src/
│   ├── app/
│   │   ├── (admin)/          # V-CORE routes (TODO)
│   │   ├── partner/          # V-PARTNER routes (TODO)
│   │   ├── client/           # V-CLIENT routes (TODO)
│   │   ├── life/             # V-LIFE routes (TODO)
│   │   ├── api/              # API Routes (TODO)
│   │   ├── layout.tsx
│   │   ├── page.tsx          # ✅ Home Page
│   │   └── globals.css
│   ├── components/           # Shared Components (TODO)
│   ├── lib/                  # Utilities (TODO)
│   └── types/                # TypeScript Types (TODO)
├── .env.local
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.mjs
```

---

## 🎨 Portals

| Portal | Route | Description | Status |
|--------|-------|-------------|--------|
| **V-CORE** | `/` | Admin Dashboard | 🔄 In Progress |
| **V-PARTNER** | `/partner` | Agent Portal | ⏳ Pending |
| **V-CLIENT** | `/client` | Employer Portal | ⏳ Pending |
| **V-LIFE** | `/life` | Worker App | ⏳ Pending |

---

## 📋 Next Steps (Phase 2)

### Priority 1: Authentication
- [ ] Setup NextAuth.js
- [ ] Create Login Page
- [ ] Create User Seed Data
- [ ] Implement Role-Based Access Control

### Priority 2: V-CORE (Admin Dashboard)
- [ ] Dashboard Overview
- [ ] Workers CRUD
- [ ] Agents CRUD
- [ ] Clients CRUD
- [ ] Sidebar Navigation
- [ ] Data Tables with Pagination

### Priority 3: Advanced Features
- [ ] Document Upload
- [ ] Search & Filters
- [ ] Reports & Analytics
- [ ] Notifications

---

## 🔧 Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma Client
```

---

## ⚙️ Deployment

### Docker Build
(Coming soon - Phase 5)

### VM Deployment
(Coming soon - Phase 5)

---

## 📄 License

© 2026 V-GROUP. All rights reserved.
