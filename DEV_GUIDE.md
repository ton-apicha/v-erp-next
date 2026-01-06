# 🚀 V-ERP Development Guide

## วิธีรัน Development Server (แนะนำ)

### ⚡ Quick Start

```bash
# 1. Start Docker services (Database, Redis, MinIO)
sudo docker-compose up -d postgres redis minio

# 2. Run Next.js dev server on host
npm run dev
```

เข้าใช้งานที่: **http://localhost:3000**

---

## 📋 Prerequisites

- Node.js 20+ (ติดตั้งบน host machine)
- Docker & Docker Compose (สำหรับ services)
- PostgreSQL client tools (optional, for debugging)

---

## 🔧 Environment Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Database Migration (ครั้งแรก)

```bash
# Start postgres first
sudo docker-compose up -d postgres

# Push schema to database
npx prisma db push --accept-data-loss

# Seed data
node prisma/seed-full.js
```

---

## 🐳 Docker Services

### Start Services

```bash
# Start all services
sudo docker-compose up -d

# Or start specific services
sudo docker-compose up -d postgres redis minio
```

### Stop Services

```bash
sudo docker-compose down
```

### View Logs

```bash
# All services
sudo docker-compose logs -f

# Specific service
sudo docker logs v-erp-postgres -f
```

---

## 💻 Development Workflow

### Daily Workflow

```bash
# 1. Start Docker services
sudo docker-compose up -d postgres redis minio

# 2. Run dev server
npm run dev

# 3. Access app
# http://localhost:3000
```

### Database Management

```bash
# Prisma Studio (GUI)
npx prisma studio

# Reset database
# Use Settings page in app: /dashboard/settings

# Re-seed data
node prisma/seed-full.js
```

---

## 🆚 Running Options Comparison

| วิธี | ความเร็ว | Hot Reload | แนะนำ |
|------|----------|------------|-------|
| **npm run dev** (host) | ⚡⚡⚡ | ✅ ดีมาก | ✅ |
| Docker dev mode | ⚡⚡ | ✳️ พอใช้ | ❌ |
| Docker exec | ⚡ | ❌ มีปัญหา | ❌ |

---

## 🔐 Login Credentials (Dev)

```
📧 Email: admin@v-group.la
🔑 Password: admin123
👤 Role: SUPER_ADMIN
```

```
📧 Email: manager@v-group.la
🔑 Password: manager123
👤 Role: MANAGER
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if postgres is running
sudo docker ps | grep postgres

# Restart postgres
sudo docker-compose restart postgres
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma Client
npx prisma generate

# Restart dev server
```

### Permission Denied in Docker

```bash
# Don't run dev server in Docker!
# Use: npm run dev on host instead
```

---

## 📁 Project Structure

```
v-erp-next/
├── prisma/              # Database schema & migrations
├── src/
│   ├── actions/         # Server actions
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   └── lib/            # Utilities
├── public/             # Static files
└── docker-compose.yml  # Docker services
```

---

## 🚀 Production Deployment

```bash
# Build Docker image
sudo docker-compose up -d --build

# App runs on port 3000
# Use nginx as reverse proxy
```

---

## 📚 Useful Commands

```bash
# Database
npx prisma studio              # Open Prisma Studio
npx prisma db push            # Push schema changes
npx prisma db seed            # Seed database

# Development
npm run dev                   # Start dev server
npm run build                 # Build for production
npm run start                 # Start production server
npm run lint                  # Run ESLint

# Docker
docker-compose ps             # List services
docker-compose logs -f        # Follow logs
docker exec -it v-erp-postgres psql -U verp_admin -d v_erp
```

---

## ⚠️ Important Notes

1. **ห้ามรัน `npm run dev` ใน Docker container** - มีปัญหา permissions และช้า
2. **ใช้ host machine ในการ dev** - เชื่อมต่อไปหา Docker services
3. **Database อยู่ใน Docker** - ไม่ต้องติดตั้ง PostgreSQL บน host
4. **Hot reload ทำงานได้ดี** เมื่อรันบน host

---

*Last Updated: 2026-01-06*
