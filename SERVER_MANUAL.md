# 📘 V-ERP Server & Development Manual

> **This document is the "Source of Truth" for AI Agents and Developers working on this machine.**
> Please read this first when starting a new session.

---

## 🏗️ System Architecture (Dual Environment)

This machine hosts both a **Development** environment (for coding) and a **Production** environment (for stable deployment) simultaneously.

| Environment | URL | Port | Technologies | Purpose |
|-------------|-----|------|--------------|---------|
| **Development** | `http://localhost:3000` | 3000 | Node via Host (`npm run dev`) | Hot-reload, coding, debugging |
| **Production** | `http://localhost:3001` | 3001 | Docker (`v-erp-app`) | Stable demo, client review |
| **Public URL** | `https://v-erp.itd.in.th` | 443 | Nginx Proxy → Docker:3000 | External Access |

### Critical Containers
- `v-erp-postgres`: Database (Port 5432)
- `v-erp-redis`: Queue/Cache (Port 6379)
- `v-erp-minio`: Object Storage (Port 9000/9001)
- `v-erp-app`: Production Next.js App (Port 3001)

---

## 🛠️ Development Workflow

### 1. Start Development Server
Use this mode when writing code or fixing bugs.
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next

# Ensure DB/Redis/Minio are running
sudo docker-compose up -d postgres redis minio

# Run Dev Server
npm run dev
```
*   **Note:** If port 3000 is blocked, check if a previous node process is running (`lsof -i :3000`).

### 2. Database Management (Prisma)
The database runs in Docker, but we manage it via host commands.
```bash
# Push schema changes to DB
npx prisma db push

# Open Database GUI
npx prisma studio

# Generate Prisma Client (after schema change)
npx prisma generate
```

---

## 🚀 Production Deployment Workflow

Use this mode when you want to deploy verified changes to the "Production" container (Port 3001).

### 1. Deployment Command
This rebuilds the Docker image with your latest code.
```bash
sudo docker-compose up -d --build
```
*   **Wait for:** `npm run build` to finish inside the container (approx. 2-3 mins).
*   **Check Status:** `sudo docker logs v-erp-app --tail 50 -f`

### 2. Verification
Check if the deployment was successful:
```bash
curl -I http://localhost:3001
```

---

## 🌳 Git & Version Control Workflow

We follow a strict versioning policy.

### 1. Branching
*   **`main`**: Production-ready code. Always deploy from here.

### 2. Committing
Use Conventional Commits format:
*   `feat: ...` for new features
*   `fix: ...` for bug fixes
*   `docs: ...` for documentation
*   `style: ...` for formatting/UI

#### Example Flow:
```bash
# 1. Add changes
git add .

# 2. Commit
git commit -m "feat(landing): update hero section images"

# 3. Push to GitHub
git push origin main
```

---

## 🔐 Credentials & Access

*   **Super Admin:** `admin@v-group.la` / `admin123`
*   **Test Worker:** `worker@test.com` / `password`
*   **Database URL:** `postgresql://postgres:postgres@localhost:5432/v_erp_db?schema=public`

---

## ⚠️ Common Troubleshooting

### ❌ Docker: "server.js not found"
**Cause:** Volume mounting `./:/app` in `docker-compose.yml` overwrites the built image content.
**Fix:** Ensure `docker-compose.yml` (production) does **NOT** have volumes mounted for the `app` service.

### ❌ Next.js: "Hydration failed"
**Cause:** Landing page mismatch between Server/Client execution.
**Fix:** Add `suppressHydrationWarning` to the `<html>` tag or ensure generic timestamps use `useEffect`.

### ❌ Git: "refspec master does not match"
**Cause:** Our main branch is named `main`, not `master`.
**Fix:** Always use `git push origin main`.
