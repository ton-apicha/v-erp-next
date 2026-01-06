# API Testing Implementation Plan

## Goal
Implement comprehensive integration tests for all API endpoints in the V-ERP Application to ensure reliability and correctness of backend logic.

## User Review Required
None. Internal testing task.

## Proposed Changes

1.  **Dependencies**: Install `jest-mock-extended` for mocking Prisma Client.
2.  **Configuration**:
    - Create `src/lib/__mocks__/db.ts` to mock the global prisma instance.
    - Update `jest.setup.ts` if global mocks need registration.
3.  **Test Files**:
    - Create `src/app/api/__tests__` directory updates.
    - **Locations**: `src/app/api/locations/__tests__/locations.test.ts` (Provinces, Districts, Subdistricts)
    - **Workers**: `src/app/api/workers/__tests__/workers.test.ts` (CRUD)
    - **Agents**: `src/app/api/agents/__tests__/agents.test.ts` (CRUD)
    - **Clients**: `src/app/api/clients/__tests__/clients.test.ts` (CRUD)
    - **Auth**: `src/app/api/auth/[...nextauth]/__tests__/route.test.ts` (Mocked validation)

## Verification Plan

### Automated Tests
Run the following command to execute the test suite:
```bash
sudo docker-compose exec -T app npm test
```

### Coverage Goal
Aim for >80% coverage on API route handlers, ensuring success and error paths are tested.
