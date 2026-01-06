# 🚀 Quick Start Guide

## สำหรับนักพัฒนาใหม่

เอกสารนี้จะช่วยให้คุณเริ่มต้นพัฒนา V-ERP ได้ภายใน 10 นาที

---

## ✅ Prerequisites

ต้องมีสิ่งเหล่านี้ติดตั้งแล้ว:
- **Node.js 20+** ([Download](https://nodejs.org/))
- **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (แนะนำ) ([Download](https://code.visualstudio.com/))

---

## 📦 Step 1: Setup Project

```bash
# 1. Extract or clone project
cd V-ERP-Next

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env.local

# 4. Edit .env.local
# Set DATABASE_URL and NEXTAUTH_SECRET
nano .env.local
```

**ตัวอย่าง `.env.local`:**
```env
DATABASE_URL="postgresql://verp_admin:mypassword@localhost:5432/v_erp?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-key
NODE_ENV=development
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🗄️ Step 2: Setup Database

### A. Install PostgreSQL (if not installed)

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download installer from PostgreSQL website

---

### B. Create Database

```bash
# Login as postgres user
sudo -u postgres psql

# Run these commands:
CREATE USER verp_admin WITH PASSWORD 'your_password';
CREATE DATABASE v_erp OWNER verp_admin;
GRANT ALL PRIVILEGES ON DATABASE v_erp TO verp_admin;
\q
```

**หรือใช้คำสั่งเดียว:**
```bash
sudo -u postgres createuser -P verp_admin
sudo -u postgres createdb -O verp_admin v_erp
```

---

### C. Push Schema & Seed Data

```bash
# Push database schema
npm run db:push

# Seed demo data
npm run db:seed
```

**Demo Users หลังจาก seed:**
- **Admin:** admin@v-group.la / admin123
- **Manager:** manager@v-group.la / manager123
- **Staff:** staff@v-group.la / staff123

---

## 🎯 Step 3: Run Development Server

```bash
npm run dev
```

เปิด browser: **http://localhost:3000**

---

## 🔑 Step 4: Login & Explore

1. Click "เข้าสู่ระบบ"
2. Login: `admin@v-group.la` / `admin123`
3. Explore:
   - Dashboard
   - Workers (List, Add New)
   - Agents
   - Clients

---

## 📂 Project Structure Overview

```
V-ERP-Next/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── dashboard/    # Protected Routes (Main App)
│   │   ├── login/        # Login Page
│   │   ├── api/          # API Routes
│   │   └── page.tsx      # Home Page
│   ├── components/       # Reusable Components
│   ├── lib/              # Utilities
│   │   ├── db.ts         # Prisma Client
│   │   └── auth.ts       # Auth Helpers
│   └── types/            # TypeScript Types
├── prisma/
│   ├── schema.prisma     # Database Schema
│   └── seed.js           # Seed Data
├── .env.local            # Environment Variables (YOU CREATE THIS)
├── package.json          # Dependencies
└── README.md             # Main Documentation
```

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed demo data
npm run db:studio        # Open Prisma Studio (GUI)
npm run db:generate      # Generate Prisma Client

# Build
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

---

## 🧪 Test Your Setup

### 1. Check Database Connection
```bash
npm run db:studio
```
Should open Prisma Studio at http://localhost:5555

### 2. Check Authentication
- Login at http://localhost:3000/login
- Should redirect to /dashboard after login

### 3. Check CRUD Operations
- Add a new worker
- View workers table
- Delete a worker

---

## 🐛 Troubleshooting

### Issue: Database Connection Error
**Error:** `Can't reach database server`

**Fix:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check DATABASE_URL in .env.local
```

---

### Issue: Port 3000 Already in Use
**Error:** `Port 3000 is already in use`

**Fix:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

---

### Issue: Module Not Found
**Error:** `Cannot find module '@prisma/client'`

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Generate Prisma Client
npm run db:generate
```

---

### Issue: Prisma Schema Not Found
**Error:** `Prisma schema not found`

**Fix:**
```bash
# Push schema again
npm run db:push
```

---

## 📚 Next Steps

1. **Read Documentation:**
   - `README.md` - Project overview
   - `API_DOCUMENTATION.md` - API endpoints
   - `DATABASE_SCHEMA.md` - Database structure
   - `CONTRIBUTING.md` - How to contribute
   - `TODO.md` - Task list

2. **Pick a Task:**
   - Open `TODO.md`
   - Choose a high-priority task
   - Create a branch
   - Start coding!

3. **Join the Team:**
   - Read `CONTRIBUTING.md`
   - Follow code standards
   - Create Pull Requests

---

## 🎓 Learning Resources

### Next.js
- [Next.js 15 Docs](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

### Prisma
- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

### NextAuth.js
- [NextAuth.js Docs](https://next-auth.js.org/)
- [Credentials Provider](https://next-auth.js.org/providers/credentials)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Utility Classes](https://tailwindcss.com/docs/utility-first)

---

## ❓ Need Help?

- **Documentation Issues:** Check `docs/` folder
- **Code Issues:** See `CONTRIBUTING.md`
- **Bugs:** Create GitHub Issue
- **Questions:** GitHub Discussions

---

## ✨ You're Ready!

ตอนนี้คุณพร้อมพัฒนา V-ERP แล้ว! 🎉

**Happy Coding!** 💻
