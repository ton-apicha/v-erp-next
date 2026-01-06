# 📝 TODO & Roadmap

## 🎯 Current Status: 70% Complete

---

## ✅ Completed (Phases 1-5)

### Phase 1: Project Setup
- [x] Next.js 15 + TypeScript
- [x] Tailwind CSS
- [x] Prisma Schema
- [x] Database Models
- [x] Project Structure

### Phase 2: Authentication
- [x] NextAuth.js Setup
- [x] Login Page
- [x] Protected Routes
- [x] Dashboard Layout
- [x] Sidebar Navigation
- [x] User Seed Data

### Phase 3: Workers CRUD
- [x] Workers List Page
- [x] Add Worker Form
- [x] Worker Table Component
- [x] Search & Filter
- [x] Delete Worker
- [x] API Routes (GET, POST, DELETE)

### Phase 4: Agents & Clients
- [x] Agents List Page
- [x] Clients List Page
- [x] Statistics Display

### Phase 5: Deployment
- [x] Dockerfile
- [x] docker-compose.yml
- [x] Deployment Scripts
- [x] Nginx Configuration
- [x] Documentation

---

## 🚧 In Progress (40% Remaining)

### High Priority

#### 1. Workers Module (Complete)
- [x] Worker Detail Page (`/dashboard/workers/[id]`)
  - Display all worker information
  - Show related agent/client
  - Display documents
  - Show employment history
  
- [x] Edit Worker Form (`/dashboard/workers/[id]/edit`)
  - Pre-fill existing data
  - Validation
  - Update API endpoint (PUT)
  
- [x] Worker Status Management
  - Change status (PENDING → READY → WORKING)
  - Status history tracking
  - Notifications on status change (Basic implementation via Edit)

#### 2. Agents Module (Complete)
- [x] Agent Detail Page
- [x] Add Agent Form (`/dashboard/agents/new`)
- [x] Edit Agent Form
- [x] Agent API Routes (POST, PUT, DELETE)
- [ ] Commission Calculator

#### 3. Clients Module (Complete)
- [x] Client Detail Page
- [x] Add Client Form (`/dashboard/clients/new`)
- [x] Edit Client Form
- [x] Client API Routes (POST, PUT, DELETE)
- [x] Client-Worker Assignment

#### 4. Documents Module
- [x] Document Upload Component
- [x] File Storage (Cloud Storage or Local)
- [x] Document List/Gallery
- [x] Download Documents
- [x] Document Categories
- [x] API Routes for Documents
- [x] Documents Management Page

#### 5. Settings Module (NEW)
- [x] Settings Page
- [x] Reset Database Function (with double confirmation)
- [ ] Profile Settings
- [ ] Company Settings
- [ ] Notification Preferences

#### 6. SOS Alerts Module (NEW)
- [x] SOS Alerts Page
- [x] Priority-based display
- [x] Status management UI
- [ ] Real-time notifications

#### 7. Academy Module (NEW)
- [x] Academy Placeholder Page
- [ ] Training Schedule Management
- [ ] Material Issuance Tracking

---

### Medium Priority

#### 5. Dashboard Enhancements
- [ ] Charts (Workers by status, monthly stats)
- [ ] Recent activities
- [ ] Quick actions
- [ ] Expiring documents alerts

#### 6. Search & Filter
- [ ] Global search (workers, agents, clients)
- [ ] Advanced filters
- [ ] Saved searches
- [ ] Export results (CSV, Excel)

#### 7. Reports
- [ ] Worker Reports (by status, agent, client)
- [ ] Agent Reports (commission, performance)
- [ ] Client Reports (workforce, costs)
- [ ] Custom report builder
- [ ] PDF export
- [ ] Email reports

#### 8. User Management
- [ ] User List Page
- [ ] Add/Edit User
- [ ] Role Management
- [ ] Permissions
- [ ] Activity Logs

#### 9. Notifications
- [ ] Passport expiry alerts (90 days)
- [ ] Visa expiry alerts
- [ ] Work permit expiry alerts
- [ ] Email notifications
- [ ] LINE Notify integration
- [ ] In-app notifications

---

### Low Priority

#### 10. Settings
- [ ] Company Settings
- [ ] Email Templates
- [ ] Notification Preferences
- [ ] System Configuration
- [ ] Backup/Restore

#### 11. Audit Logs
- [ ] Audit Log List
- [ ] Filter by user/action/entity
- [ ] Export logs

#### 12. Multi-Portal (V-PARTNER, V-CLIENT, V-LIFE)
- [ ] V-PARTNER Portal (Agent view)
  - Agent dashboard
  - Manage their workers
  - Commission tracking
  
- [ ] V-CLIENT Portal (Employer view)
  - Client dashboard
  - View assigned workers
  - Request workers
  
- [ ] V-LIFE Portal (Worker view)
  - Worker profile
  - Document viewer
  - Notification center

#### 13. Advanced Features
- [ ] Contract Management
- [ ] Payroll Integration
- [ ] Immigration Document Tracking
- [ ] Training Records
- [ ] Performance Reviews
- [ ] Incident Reporting

---

## 🔮 Future Ideas (Phase 7+)

### 14. Mobile App
- [ ] React Native app
- [ ] Worker self-service
- [ ] QR code check-in

### 15. Integrations
- [ ] Accounting software (QuickBooks, Xero)
- [ ] HR software
- [ ] Email marketing (MailChimp)
- [ ] SMS gateway

### 16. Analytics
- [ ] Business Intelligence dashboard
- [ ] Predictive analytics
- [ ] Machine learning suggestions

### 17. Multi-language
- [ ] Thai
- [ ] English
- [ ] Lao
- [ ] Burmese

---

## 📊 Priority Matrix

| Feature | Priority | Effort | Impact | Status |
|---------|----------|--------|--------|--------|
| Worker Detail/Edit | High | Medium | High | ✅ Done |
| Agents CRUD | High | Medium | High | ✅ Done |
| Clients CRUD | High | Medium | High | ✅ Done |
| Documents Upload | High | High | High | ✅ Done |
| Dashboard Charts | Medium | Medium | Medium | ⏳ Todo |
| Reports | Medium | High | High | ⏳ Todo |
| Notifications | Medium | Medium | High | ⏳ Todo |
| Multi-Portal | Low | Very High | Medium | ⏳ Future |
| Mobile App | Low | Very High | Medium | ⏳ Future |

---

## 🎯 Sprint Plan (Suggested)

### Sprint 1 (1 week): Complete Workers Module
- Worker Detail Page
- Edit Worker Form
- Status Management

### Sprint 2 (1 week): Complete Agents & Clients
- Agents CRUD
- Clients CRUD
- Relationship Management

### Sprint 3 (1 week): Documents & Files
- Upload Component
- Cloud Storage Integration
- Document Management

### Sprint 4 (1 week): Reports & Analytics
- Dashboard Charts
- Basic Reports
- Export Functions

### Sprint 5 (1 week): Notifications & Alerts
- Expiry Alerts
- Email Notifications
- LINE Notify

### Sprint 6 (1 week): Polish & Testing
- Bug Fixes
- Performance Optimization
- User Testing

---

## 🐛 Known Issues

- [ ] TypeScript lint warnings in agents/clients pages
- [ ] Missing error boundaries
- [ ] No loading skeletons
- [ ] Forms don't handle network errors gracefully

---

## 💡 Improvement Ideas

### UX/UI
- [ ] Add loading skeletons
- [ ] Improve form validation messages
- [ ] Add keyboard shortcuts
- [x] Dark mode toggle
- [ ] Print-friendly views

### Performance

- [ ] Implement pagination
- [ ] Add caching (React Query)
- [ ] Optimize images
- [ ] Code splitting

### Security
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)

### Developer Experience
- [ ] Add Storybook
- [ ] Setup CI/CD
- [ ] Add pre-commit hooks
- [ ] Automated testing

---

## 📝 Notes

- **Database:** PostgreSQL is required (not SQLite)
- **Node Version:** 20+ required for Next.js 15
- **Deployment:** Nginx reverse proxy recommended for production

---

## 🤝 How to Contribute

1. Pick a task from TODO
2. Create a branch (`feature/task-name`)
3. Develop and test
4. Create Pull Request
5. Update this file (mark as done ✅)

See `CONTRIBUTING.md` for details.

---

Last Updated: 2026-01-06
