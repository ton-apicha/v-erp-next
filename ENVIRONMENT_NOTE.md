# ⚠️ Development Environment Note

## สถานะปัจจุบัน

### Node.js บน Host Machine
- ❌ **ยังไม่ได้ติดตั้ง Node.js บน host**
- ต้องติดตั้ง Node.js 20+ ก่อนใช้ `./scripts/dev.sh`

### ทางเลือกในการรัน Development

#### Option 1: ติดตั้ง Node.js บน Host (แนะนำ ⭐)

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v  # Should show v20.x.x
npm -v

# Then run dev server
cd /home/tataff_001/Desktop/CODE/v-erp-next
npm install
./scripts/dev.sh
```

**ข้อดี:**
- ⚡ เร็วที่สุด
- 🔥 Hot reload ดีที่สุด  
- 🐛 Debug ง่าย

---

#### Option 2: รันใน Docker (ปัจจุบัน)

```bash
# Start all services including app
sudo docker-compose up -d

# Or start just infrastructure
sudo docker-compose up -d postgres redis minio
```

**ข้อเสีย:**
- 🐢 ช้ากว่า host
- ⚠️ มีปัญหา permissions บางครั้ง

---

## คำแนะนำ

**สำหรับ Development ระยะยาว:**
→ ติดตั้ง Node.js บน host แล้วใช้ `./scripts/dev.sh`

**สำหรับ Quick Test:**
→ ใช้ `sudo docker-compose up -d` (app รันใน Docker)

---

*Created: 2026-01-06*
