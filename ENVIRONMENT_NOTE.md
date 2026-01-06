# ⚠️ Development Environment Note

## 🌟 สถานะปัจจุบัน (Dual Environment)

ระบบรองรับการทำงานทั้ง Dev และ Production พร้อมกัน:

| Environment | URL | Source | หมายเหตุ |
|-------------|-----|--------|----------|
| **Development** | http://localhost:3000 | Host Machine (`npm run dev`) | Hot Reload, Debugging |
| **Production** | http://localhost:3001 | Docker Container (`v-erp-app`) | Stable, Test Build |
| **Public Site** | https://v-erp.itd.in.th | Nginx Proxy -> Container:3000 | Production Live |

---

## 🔧 วิธีการรัน

### 1. เริ่ม Development Server (บน Host)

```bash
# บน Host Machine
cd /home/tataff_001/Desktop/CODE/v-erp-next
npm run dev
```

### 2. เริ่ม Production Server (ใน Docker)

```bash
# ใน Docker (Container จะรันที่ Port 3001)
sudo docker-compose up -d app
```

### 3. เริ่ม Infrastructure (Database, Redis, MinIO)

```bash
# จำเป็นสำหรับทั้งคู่
sudo docker-compose up -d postgres redis minio
```

---

## 🐛 Troubleshooting Production 503

หากหน้าเว็บ Production (https://v-erp.itd.in.th) ขึ้น `503 Service Unavailable`:

1.  **สาเหตุ:** Container `v-erp-app` อาจจะ Crash หรือไม่ได้รันอยู่
2.  **ตรวจสอบ:**
    ```bash
    sudo docker ps  # ดูสถานะ (Up หรือ Restarting)
    sudo docker logs v-erp-app --tail 50  # ดู Error logs
    ```
3.  **ปัญหาที่พบบ่อย - Volume Mount:**
    *   ถ้าใช้ `docker-compose.yml` เดิมที่ mount `./:/app` จะทำให้ Container หา `server.js` ไม่เจอ
    *   **แก้ไข:** ใน `docker-compose.yml` ของ Production ต้อง **ไม่** mount volume ทับ code
4.  **ปัญหาที่พบบ่อย - Permissions:**
    *   ใช้ `Dockerfile` ที่มีการ `chown nextjs:nextjs` ให้ถูกต้อง

---

## 📂 การเปลี่ยนแปลงโครงสร้าง

1.  **`docker-compose.yml`**:
    *   เปลี่ยน Port Mapping ของ `app` เป็น `3001:3000`
    *   ลบ `volumes` mount ออก (เพื่อให้ใช้ Image content)
    *   ลบ `command: ["sleep", "infinity"]` เพื่อให้รัน `npm start`

2.  **`Dockerfile`**:
    *   แก้ไข Permission ของ user `nextjs`
    *   Optimized build process

---

*Last Updated: 2026-01-06*
