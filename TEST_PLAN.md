# Test Suite Plan

This document outlines the strategy for implementing a comprehensive test suite for the V-ERP Next application.

## 1. Testing Strategy

We will adopt the "Testing Trophy" approach:
- **Static Analysis**: TypeScript, ESLint (Already in place)
- **Unit Tests**: Focus on utility functions, hooks, and complex logic reducers.
- **Integration Tests**: Focus on React Components (Pages, Forms) and their interactions. This will be the bulk of our tests.
- **E2E Tests**: Critical user flows (Login, Create Worker, Search) running on a real browser.

## 2. Technology Stack

- **Test Runner & Assertion**: `Jest`
- **Environment**: `jest-environment-jsdom`
- **Component Testing**: `@testing-library/react`, `@testing-library/dom`
- **User Events**: `@testing-library/user-event`
- **End-to-End**: `Playwright` (Phase 2)

## 3. Configuration Setup

### Dependencies
```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node
```

### Configuration Files
- `jest.config.ts`: Main configuration.
- `jest.setup.ts`: Global test setup (e.g., extending matchers).

## 4. Test Scope & Priorities

### Phase 1: Core Components (Immediate)
- **Header**: Verify language switching, user info display.
- **Sidebar**: Verify navigation links render correctly based on translations.
- **UI Components**: Cards, Buttons (Ensure basic rendering).

### Phase 2: Feature Integration (Next Sprint)
- **Workers Module**:
  - Test `WorkerTable` rendering empty state and data rows.
  - Test Search filter interactions.
- **Forms**: Validation testing on `AddWorkerForm`.

## 5. Directory Structure
Tests will be co-located with components within `__tests__` directories or using the `*.test.tsx` naming convention.

- `src/components/layout/__tests__/Header.test.tsx`
- `src/lib/__tests__/utils.test.ts`
