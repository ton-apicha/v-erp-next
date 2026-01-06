# 🤝 Contributing to V-ERP

Thank you for your interest in contributing to V-ERP! This document provides guidelines for developers.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Git Workflow](#git-workflow)
5. [Testing](#testing)
6. [Documentation](#documentation)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Git
- VS Code (recommended)

### Setup Development Environment

```bash
# 1. Clone repository
git clone <repository-url>
cd V-ERP-Next

# 2. Install dependencies
npm install

# 3. Setup database
createdb v_erp
npm run db:push
npm run db:seed

# 4. Run development server
npm run dev
```

### Recommended VS Code Extensions
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens

---

## 🔄 Development Workflow

### 1. Pick a Task
- Check `TODO.md` for available tasks
- Assign yourself to a GitHub issue
- Discuss with team if needed

### 2. Create a Branch
```bash
git checkout -b feature/worker-edit-page
git checkout -b fix/login-error
git checkout -b docs/api-examples
```

**Branch Naming:**
- `feature/<name>` - New features
- `fix/<name>` - Bug fixes
- `refactor/<name>` - Code refactoring
- `docs/<name>` - Documentation
- `test/<name>` - Tests

### 3. Develop
- Follow code standards (below)
- Write tests if applicable
- Update documentation

### 4. Commit
```bash
git add .
git commit -m "feat: add worker edit page"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/dependencies

**Examples:**
```
feat: add worker edit form with validation

- Created edit form component
- Added PUT API endpoint
- Implemented form validation with Zod

Closes #123
```

### 5. Push & Create PR
```bash
git push origin feature/worker-edit-page
```

Then create a Pull Request on GitHub.

---

## 💻 Code Standards

### TypeScript
- Use TypeScript for all files
- Define types in `src/types/`
- Avoid `any` type
- Use strict mode

```typescript
// ✅ Good
interface WorkerFormData {
  firstName: string
  lastName: string
}

// ❌ Bad
const data: any = { ... }
```

### React Components
- Use functional components
- Use React Server Components when possible
- Keep components small and focused
- Use meaningful names

```tsx
// ✅ Good - Server Component
export default async function WorkersList() {
  const workers = await prisma.worker.findMany()
  return <WorkerTable workers={workers} />
}

// ✅ Good - Client Component
'use client'
export default function WorkerForm() {
  const [loading, setLoading] = useState(false)
  // ...
}
```

### File Structure
```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Auth routes
│   ├── dashboard/    # Protected routes
│   ├── api/          # API routes
│   └── page.tsx      # Public pages
├── components/       # Reusable components
│   ├── ui/           # UI components
│   └── forms/        # Form components
├── lib/              # Utilities
│   ├── db.ts         # Prisma client
│   ├── auth.ts       # Auth utilities
│   └── utils.ts      # Helper functions
└── types/            # TypeScript types
```

### Naming Conventions
- **Files:** `kebab-case.tsx`
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Types:** `PascalCase`

```typescript
// ✅ Good
const MAX_FILE_SIZE = 5 * 1024 * 1024

function calculateCommission(amount: number): number {
  return amount * 0.05
}

interface WorkerFormProps {
  initialData?: Worker
  onSubmit: (data: WorkerFormData) => void
}
```

### Tailwind CSS
- Use Tailwind utility classes
- Define custom classes in `globals.css`
- Follow mobile-first approach

```tsx
// ✅ Good
<div className="flex flex-col gap-4 md:flex-row md:gap-6">
  <button className="btn btn-primary">Save</button>
</div>

// ❌ Bad - Inline styles
<div style={{ display: 'flex', gap: '16px' }}>
```

### API Routes
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent responses
- Handle errors properly
- Validate input with Zod

```typescript
// ✅ Good
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    // Validate with Zod
    const validated = workerSchema.parse(body)
    
    const worker = await prisma.worker.create({ data: validated })
    return NextResponse.json(worker, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### Database
- Use Prisma for all database operations
- Write migrations for schema changes
- Use transactions for multiple operations

```typescript
// ✅ Good
const worker = await prisma.worker.create({
  data: {
    workerId: generateWorkerId(),
    firstNameTH,
    lastNameTH,
    createdById: session.user.id,
  },
  include: {
    createdBy: { select: { name: true } }
  }
})

// ✅ Good - Transaction
await prisma.$transaction([
  prisma.worker.create({ data: workerData }),
  prisma.auditLog.create({ data: logData })
])
```

---

## 🌿 Git Workflow

### Main Branches
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches

### Workflow
```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Develop and commit
git add .
git commit -m "feat: my feature"

# 4. Push and create PR
git push origin feature/my-feature

# 5. After PR approved, merge to develop
# 6. Periodically merge develop to main for releases
```

### Pull Request Guidelines
- **Title:** Clear and descriptive
- **Description:** 
  - What changed?
  - Why?
  - How to test?
- **Screenshots:** For UI changes
- **Checklist:**
  - [ ] Tests pass
  - [ ] Code follows standards
  - [ ] Documentation updated
  - [ ] No console logs/debuggers

---

## 🧪 Testing

### Unit Tests (Coming Soon)
```bash
npm run test
```

### E2E Tests (Coming Soon)
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Forms validate correctly
- [ ] Errors display properly
- [ ] Success messages show
- [ ] Responsive on mobile
- [ ] Loading states work
- [ ] Navigation works

---

## 📚 Documentation

### Code Comments
- Write comments for complex logic
- Document function parameters
- Explain "why", not "what"

```typescript
// ✅ Good
/**
 * Generate unique worker ID in format WK-YYYYMMDD-XXX
 * We use date + sequence to ensure uniqueness and sortability
 */
function generateWorkerId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const sequence = String(count + 1).padStart(3, '0')
  return `WK-${date}-${sequence}`
}

// ❌ Bad
// This function generates worker ID
function generateWorkerId() { ... }
```

### Update Documentation
When making changes, update:
- `README.md` - If setup changed
- `API_DOCUMENTATION.md` - If API changed
- `DATABASE_SCHEMA.md` - If schema changed
- `TODO.md` - Mark tasks as complete

---

## 🤔 Questions?

- **Technical:** Open a GitHub Discussion
- **Bugs:** Create a GitHub Issue
- **Features:** Create a GitHub Issue with `enhancement` label

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing! 🙏
