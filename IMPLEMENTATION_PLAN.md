# 📋 Comprehensive Implementation Plan

## 1. 🌍 Address System (Foundation)
The address system is critical for professional data entry. We need to implement standard location selection (Thailand & Laos).

- [x] **API Routes**: Create endpoints to fetch location data.
  - `GET /api/locations/provinces` (Filter by country: TH, LA)
  - `GET /api/locations/districts` (Filter by province)
  - `GET /api/locations/subdistricts` (Filter by district)
- [x] **UI Component**: Create a reusable `AddressSelector` component.
  - Support Country selection (Laos/Thailand default).
  - Cascading dropdowns (Province -> District -> Subdistrict).
  - Auto-fill Zip code (if available in schema).

## 2. 🤝 Agents Module (Master Data)
Agents are required before we can fully utilize the Worker module.

- [x] **API Routes**:
  - `POST /api/agents` (Create new agent)
  - `PUT /api/agents/[id]` (Update agent)
  - `DELETE /api/agents/[id]` (Archive/Delete)
  - `GET /api/agents` (List & Minimal list)
- [x] **UI Pages**:
  - `src/app/dashboard/agents/new/page.tsx`: Create Agent Form (incorporating `AddressSelector`).
  - `src/app/dashboard/agents/[id]/edit/page.tsx`: Edit Agent Form.

## 3. 🏢 Clients Module (Master Data)
Similar to Agents, Clients are essential for assigning workers.

- [x] **API Routes**:
  - `POST /api/clients` (Create new client)
  - `PUT /api/clients/[id]` (Update client)
  - `DELETE /api/clients/[id]` (Archive/Delete)
  - `GET /api/clients` (List & Minimal list)
- [x] **UI Pages**:
  - `src/app/dashboard/clients/new/page.tsx`: Create Client Form.
  - `src/app/dashboard/clients/[id]/edit/page.tsx`: Edit Client Form.

## 4. 👷 Workers Module (Core)
Upgrade the existing module to use the new foundation.

- [x] **Enhance Create Form** (`workers/new`):
  - Add **Agent Selection** (Dropdown from Agent API).
  - Add **Client Selection** (Dropdown from Client API).
  - Replace text address fields with `AddressSelector`.
- [x] **Create Edit Form**:
  - `src/app/dashboard/workers/[id]/edit/page.tsx`: Full edit capability.
- [ ] **Status Workflow**:
  - Add UI controls to change worker status (e.g., button to move from "Screening" to "Ready").

## 5. 📂 Document Management
Ensure the document upload system connects properly to all entities.

- [x] Verify `DocumentUpload` component works with new Agent/Client entities.
- [ ] Ensure `minio` setup is robust or provide fallback/mock for local dev.

---

## 🚀 Workflow Execution Order
1.  **Address APIs** -> Enable standard addresses.
2.  **Agent/Client APIs** -> Enable creating master data.
3.  **Address UI Component** -> Enable usage in forms.
4.  **Agent/Client Forms** -> Populate the system.
5.  **Refactor Worker Form** -> Connect everything together.
