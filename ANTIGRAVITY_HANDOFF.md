# Antigravity Handoff: V-ERP Next

**Date:** 2026-01-06
**Objective:** Continue development directly on `v-core-server`.

## 1. Project Overview
**V-ERP Next** is an Enterprise Resource Planning system for V-GROUP.
- **Tech Stack:** Next.js 15 (App Router), Prisma (Postgres), NextAuth.js, Tailwind CSS.
- **Infrastructure:** Docker, Docker Compose, Nginx Proxy (Automated SSL).

## 2. Current Deployment State
- **Server:** `v-core-server` (IP: `34.142.158.126`)
- **Location:** `/home/tataff_001/Desktop/CODE/v-erp-next`
- **URL:** `https://v-erp.itd.in.th`
- **Architecture:**
    - **Nginx Proxy:** Handles ports 80/443, SSL termination (Let's Encrypt), and routing. Located in `proxy/`.
    - **V-ERP App:** Runs on internal port 3000, connected via `web-proxy` network. Not exposed publicly directly.
    - **Database:** Postgres container (`v-erp-postgres`), data volume `postgres_data`.

## 3. Key Configurations & recent Fixes

### A. Reverse Proxy (`proxy/docker-compose.yml`)
- Uses `nginxproxy/nginx-proxy` & `nginxproxy/acme-companion`.
- **CRITICAL:** `HTTPS_METHOD=noredirect` is set to prevent Cloudflare redirect loops.
- **Network:** External network named `web-proxy`.

### B. V-ERP Docker (`Dockerfile`)
- **Fix:** Explicitly copies both `@prisma/client` AND `.prisma` folders from `builder` to `runner` stage.
- **Reason:** Prevents "Prisma Client did not initialize yet" error during `db:seed`.

### C. Next.js 15 Compatibility
- **Routes:** All `params` and `searchParams` in `page.tsx`/`route.ts` are now awaited (Promises).
- **Auth:** `src/lib/auth.ts` patched for type safety with `next-auth` session.

## 4. How to Develop/Deploy Here

### Running the App
The app is currently running via Docker Compose.
```bash
cd /home/tataff_001/Desktop/CODE/v-erp-next
# View logs
sudo docker-compose logs -f app
# Restart app
sudo docker-compose restart app
# Full rebuild (if code changes)
sudo docker-compose up -d --build
```

### Environment Variables
- Production config is in `.env.production`.
- Active run config is `.env`.
- **Note:** Ensure `NEXTAUTH_URL` matches the https domain.

## 5. Known Quirks
- **Sudo:** You need `sudo` for docker commands.
- **Docker Compose:** The server uses `docker-compose` (v1 style) syntax in some scripts, but modern docker has `docker compose`. Scripts call `docker-compose`.
- **DNS:** Users might cache redirects. If testing URLs, use Incognito or `curl -I`.

## 6. Admin User (Seeded)
- **Email:** `admin@v-group.la`
- **Password:** (Default from seed, usually `password` or similar, check `prisma/seed.js`)
