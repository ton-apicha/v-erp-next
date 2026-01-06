# V-ERP Development Scripts

Helper scripts สำหรับ development workflow

## 🚀 Quick Start

```bash
# Start development environment
./scripts/dev.sh
```

## 📋 Available Scripts

### `dev.sh` - Start Development

เริ่มต้น development environment แบบครบวงจร:

- ✅ ตรวจสอบ Node.js และ Docker
- ✅ เริ่ม Docker services (postgres, redis, minio)
- ✅ ติดตั้ง dependencies (ถ้ายังไม่มี)
- ✅ Generate Prisma Client (ถ้ายังไม่มี)
- ✅ เริ่ม Next.js dev server

**Usage:**
```bash
./scripts/dev.sh
```

### `stop.sh` - Stop All Services

หยุด Docker services ทั้งหมด

**Usage:**
```bash
./scripts/stop.sh
```

## 📝 Manual Commands

ถ้าต้องการรันแบบ manual:

```bash
# Start Docker services only
sudo docker-compose up -d postgres redis minio

# Start dev server only
npm run dev

# Stop everything
sudo docker-compose down
```

## 🐛 Troubleshooting

### Permission Denied

```bash
chmod +x scripts/*.sh
```

### Port Already in Use

```bash
# Find and kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

---

*Last Updated: 2026-01-06*
