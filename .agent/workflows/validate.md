---
description: how to validate code for errors before deployment
---

# V-ERP Code Validation Workflow

// turbo-all

## Quick Validation

### 1. TypeScript Check
```bash
npm run typecheck
```

### 2. ESLint Check
```bash
npm run lint
```

### 3. Full Validation (TypeCheck + Lint)
```bash
npm run validate
```

### 4. Full Check (Validate + Build)
```bash
npm run check
```

## Fix Common Errors

### Auto-fix Linting Errors
```bash
npm run lint:fix
```

### Regenerate Prisma Client (after schema changes)
```bash
npm run db:generate
```

## Known Issues

Some TypeScript errors may exist from previous schema migrations. Priority errors to fix:
- API routes using deprecated models (agent, commission)
- Pages using removed fields (companyNameEN, firstNameEN)
- Type definitions in `src/types/index.ts`

When fixing, update both:
1. The source file
2. Related API routes
3. Type definitions
