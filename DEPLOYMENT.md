# 🚀 V-ERP Deployment Guide

## 📋 สรุปโปรเจค

**V-ERP** คือระบบ ERP แบบ Lean Architecture สำหรับธุรกิจจัดหาแรงงาน SME

### ✅ Features Complete:
- ✅ Authentication & Authorization (NextAuth.js)
- ✅ Workers Management (CRUD, Search, Filter)
- ✅ Agents Management (List, Stats)
- ✅ Clients Management (List, Stats)
- ✅ Dashboard with Statistics
- ✅ Role-Based Access Control
- ✅ Responsive Design
- ✅ Production-Ready Deployment Files

### 📊 Progress: ~60% Complete

---

## 🎯 Deployment Steps

### 1️⃣ **Local Development**

```bash
# Clone/Extract project
cd V-ERP-Next

# Install dependencies
npm install

# Setup database (PostgreSQL required)
npm run db:push
npm run db:seed

# Run development server
npm run dev
# Visit: http://localhost:3000
```

**Demo Login:**
- Email: `admin@v-group.la`
- Password: `admin123`

---

### 2️⃣ **Production Deployment (VM)**

#### Prerequisites:
- VM: 35.197.153.65 (running)
- Domain: v-erp.itd.in.th (configured in DNS)
- Docker & Docker Compose

#### Steps:

**A. Create Release Package**
```bash
cd /home/my/Desktop/CODE/V-ERP-Next
chmod +x create-release.sh
./create-release.sh
```

**B. Upload to Server**
```bash
scp -i ~/.ssh/google_compute_engine v-erp.zip my@35.197.153.65:~/
scp -i ~/.ssh/google_compute_engine deploy.sh my@35.197.153.65:~/
```

**C. Deploy on Server**
```bash
# SSH to server
ssh -i ~/.ssh/google_compute_engine my@35.197.153.65

# Run deployment
chmod +x deploy.sh
./deploy.sh

# Follow prompts to set DB password
```

**D. Configure Nginx (for v-erp.itd.in.th)**
```bash
# Copy nginx config
sudo cp /opt/v-erp/nginx/v-erp.conf /etc/nginx/sites-available/v-erp
sudo ln -s /etc/nginx/sites-available/v-erp /etc/nginx/sites-enabled/

# Install certbot (if not installed)
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d v-erp.itd.in.th

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

### 3️⃣ **Access URLs**

After deployment:
- **V-CORE (Admin):** https://v-erp.itd.in.th
- **V-PARTNER:** https://v-erp.itd.in.th/partner
- **V-CLIENT:** https://v-erp.itd.in.th/client
- **V-LIFE:** https://v-erp.itd.in.th/life

Existing:
- **AndamanPoll:** https://poll.itd.in.th (unchanged)

---

## 🔧 Management Commands

### Docker Commands:
```bash
cd /opt/v-erp

# View logs
sudo docker-compose logs -f app

# Restart
sudo docker-compose restart

# Stop
sudo docker-compose down

# Start
sudo docker-compose up -d

# Rebuild
sudo docker-compose up -d --build
```

### Database Commands:
```bash
# Run migrations
sudo docker-compose exec app npx prisma db push

# Seed data
sudo docker-compose exec app npm run db:seed

# Open Prisma Studio
sudo docker-compose exec app npx prisma studio
```

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Deployment:** Docker + Docker Compose
- **Web Server:** Nginx (Reverse Proxy)

---

## 🗂️ Project Structure

```
V-ERP-Next/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Protected routes
│   │   │   ├── workers/        # ✅ Workers CRUD
│   │   │   ├── agents/         # ✅ Agents List
│   │   │   ├── clients/        # ✅ Clients List
│   │   │   └── page.tsx        # ✅ Dashboard
│   │   ├── login/              # ✅ Login page
│   │   ├── api/                # API Routes
│   │   │   ├── auth/           # NextAuth
│   │   │   └── workers/        # Workers API
│   │   └── page.tsx            # ✅ Home
│   ├── components/             # Shared components
│   └── lib/                    # Utilities
├── prisma/
│   ├── schema.prisma           # ✅ Complete schema
│   └── seed.js                 # ✅ Seed data
├── Dockerfile                  # ✅ Production build
├── docker-compose.yml          # ✅ Multi-container setup
├── deploy.sh                   # ✅ Deployment script
├── create-release.sh           # ✅ Package script
└── nginx/
    └── v-erp.conf              # ✅ Nginx config
```

---

## 📊 Database Schema

### Tables:
- **users** - Admin, Manager, Staff users
- **workers** - แรงงาน (Full details, documents)
- **agents** - ตัวแทน (Commission tracking)
- **clients** - นายจ้าง (Industry, contact)
- **documents** - File storage metadata
- **audit_logs** - Activity tracking

---

## 🔐 Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@v-group.la | admin123 |
| Manager | manager@v-group.la | manager123 |
| Staff | staff@v-group.la | staff123 |

**⚠️ Change passwords in production!**

---

## 🎯 Roadmap (Future Phases)

### Phase 4: Advanced Features (20%)
- [ ] Worker Detail Page
- [ ] Edit Worker Form
- [ ] Agents CRUD (Add/Edit)
- [ ] Clients CRUD (Add/Edit)
- [ ] Document Upload
- [ ] Search Improvements

### Phase 5: Reports & Analytics (10%)
- [ ] Worker Reports
- [ ] Agent Commission Reports
- [ ] Client Reports
- [ ] Dashboard Charts
- [ ] Export to Excel/PDF

### Phase 6: Notifications (10%)
- [ ] Visa Expiry Alerts
- [ ] Work Permit Expiry Alerts
- [ ] Email Notifications
- [ ] LINE Notify Integration

---

## 🐛 Troubleshooting

### Issue: Port 3000 already in use
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Issue: Database connection failed
```bash
# Check if PostgreSQL is running
sudo docker-compose ps

# View database logs
sudo docker-compose logs postgres
```

### Issue: Permission denied
```bash
chmod +x deploy.sh
chmod +x create-release.sh
```

---

## 📞 Support

For issues or questions, contact: **dev@v-group.la**

---

## 📝 License

© 2026 V-GROUP. All rights reserved.
