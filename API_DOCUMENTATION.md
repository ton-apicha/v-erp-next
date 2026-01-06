# 📚 API Documentation

## Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://v-erp.itd.in.th/api`

## Authentication

All API endpoints (except `/auth/*`) require authentication via NextAuth.js session.

**Headers:**
```
Cookie: next-auth.session-token=<token>
```

---

## 🔐 Authentication

### Login
**POST** `/api/auth/signin`

**Request:**
```json
{
  "email": "admin@v-group.la",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clx...",
    "email": "admin@v-group.la",
    "name": "Admin V-GROUP",
    "role": "ADMIN"
  }
}
```

### Logout
**POST** `/api/auth/signout`

---

## 👷 Workers API

### List Workers
**GET** `/api/workers`

**Query Parameters:**
- `search` (optional): Search by name, ID, phone
- `status` (optional): Filter by status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
[
  {
    "id": "clx...",
    "workerId": "WK-20260105-001",
    "firstNameTH": "สมชาย",
    "lastNameTH": "ใจดี",
    "gender": "MALE",
    "dateOfBirth": "1995-03-15T00:00:00.000Z",
    "status": "WORKING",
    "phoneNumber": "0812345678",
    "createdBy": { "name": "Admin" },
    "agent": { "companyName": "ABC Recruitment" },
    "client": { "companyName": "XYZ Factory" }
  }
]
```

---

### Get Worker
**GET** `/api/workers/:id`

**Response:**
```json
{
  "id": "clx...",
  "workerId": "WK-20260105-001",
  "firstNameTH": "สมชาย",
  "lastNameTH": "ใจดี",
  "firstNameEN": "Somchai",
  "lastNameEN": "Jaidee",
  "nickname": "ชาย",
  "gender": "MALE",
  "dateOfBirth": "1995-03-15T00:00:00.000Z",  
  "nationality": "LAO",
  "religion": "Buddhism",
  "phoneNumber": "0812345678",
  "email": "somchai@example.com",
  "lineId": "somchai123",
  "address": "123 หมู่ 1 ต.xxx อ.xxx จ.xxx",
  "status": "WORKING",
  "passportNo": "P1234567",
  "visaNo": "V9876543",
  "workPermitNo": "W5555555",
  "agentId": "clx...",
  "clientId": "clx...",
  "createdById": "clx...",
  "createdAt": "2026-01-05T10:00:00.000Z",
  "updatedAt": "2026-01-05T10:00:00.000Z",
  "createdBy": {
    "name": "Admin",
    "email": "admin@v-group.la"
  },
  "agent": {
    "id": "clx...",
    "companyName": "ABC Recruitment",
    "contactPerson": "John Doe",
    "phoneNumber": "0911111111"
  },
  "client": {
    "id": "clx...",
    "companyName": "XYZ Factory",
    "contactPerson": "Jane Smith",
    "phoneNumber": "0922222222"
  },
  "documents": []
}
```

---

### Create Worker
**POST** `/api/workers`

**Request:**
```json
{
  "firstNameTH": "สมชาย",
  "lastNameTH": "ใจดี",
  "firstNameEN": "Somchai",
  "lastNameEN": "Jaidee",
  "nickname": "ชาย",
  "gender": "MALE",
  "dateOfBirth": "1995-03-15",
  "nationality": "LAO",
  "religion": "Buddhism",
  "phoneNumber": "0812345678",
  "email": "somchai@example.com",
  "lineId": "somchai123",
  "address": "123 หมู่ 1 ต.xxx อ.xxx จ.xxx",
  "passportNo": "P1234567",
  "visaNo": "V9876543",
  "workPermitNo": "W5555555"
}
```

**Response:**
```json
{
  "id": "clx...",
  "workerId": "WK-20260105-002",
  "firstNameTH": "สมชาย",
  "lastNameTH": "ใจดี",
  "status": "PENDING",
  "createdAt": "2026-01-05T10:00:00.000Z"
}
```

**Status Codes:**
- `201`: Created successfully
- `400`: Validation error
- `401`: Unauthorized
- `500`: Server error

---

### Update Worker
**PUT** `/api/workers/:id`

**Request:** Same as Create Worker

**Response:**
```json
{
  "id": "clx...",
  "workerId": "WK-20260105-001",
  "message": "Updated successfully"
}
```

---

### Delete Worker
**DELETE** `/api/workers/:id`

**Response:**
```json
{
  "message": "ลบข้อมูลสำเร็จ"
}
```

**Status Codes:**
- `200`: Deleted successfully
- `401`: Unauthorized
- `404`: Worker not found
- `500`: Server error

---

## 🤝 Agents API

### List Agents
**GET** `/api/agents`

**Response:**
```json
[
  {
    "id": "clx...",
    "agentId": "AG-20260105-001",
    "companyName": "ABC Recruitment",
    "contactPerson": "John Doe",
    "phoneNumber": "0911111111",
    "email": "contact@abc.com",
    "commissionRate": 5.5,
    "_count": {
      "workers": 15
    }
  }
]
```

### Create Agent
**POST** `/api/agents`

**Request:**
```json
{
  "companyName": "ABC Recruitment",
  "contactPerson": "John Doe",
  "phoneNumber": "0911111111",
  "email": "contact@abc.com",
  "address": "456 ถ.xxx",
  "taxId": "0123456789012",
  "commissionRate": 5.5
}
```

---

## 🏢 Clients API

### List Clients
**GET** `/api/clients`

**Response:**
```json
[
  {
    "id": "clx...",
    "clientId": "CL-20260105-001",
    "companyName": "XYZ Factory",
    "contactPerson": "Jane Smith",
    "phoneNumber": "0922222222",
    "industry": "Manufacturing",
    "employeeCount": 500,
    "_count": {
      "workers": 25
    }
  }
]
```

### Create Client
**POST** `/api/clients`

**Request:**
```json
{
  "companyName": "XYZ Factory",
  "contactPerson": "Jane Smith",
  "phoneNumber": "0922222222",
  "email": "info@xyz.com",
  "address": "789 ถ.xxx",
  "taxId": "9876543210123",
  "industry": "Manufacturing",
  "employeeCount": 500
}
```

---

## 📊 Statistics API

### Dashboard Stats
**GET** `/api/stats/dashboard`

**Response:**
```json
{
  "workers": {
    "total": 150,
    "pending": 20,
    "working": 100,
    "ready": 30
  },
  "agents": {
    "total": 10,
    "active": 8
  },
  "clients": {
    "total": 15,
    "active": 12
  }
}
```

---

## 🔍 Search API

### Global Search
**GET** `/api/search?q=<query>`

**Response:**
```json
{
  "workers": [...],
  "agents": [...],
  "clients": [...]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `UNAUTHORIZED`: Not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input
- `INTERNAL_ERROR`: Server error

---

## Rate Limiting

- **Development:** No limits
- **Production:** 100 requests per minute per IP

---

## Pagination

Paginated endpoints support:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `sort`: Sort field (e.g., `createdAt`)
- `order`: Sort order (`asc` or `desc`)

**Response:**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3
}
```

---

## Webhooks (Future)

Coming in Phase 6:
- Worker status change
- Document expiry alerts
- New agent registration

---

## SDK (Future)

TypeScript SDK coming soon:
```typescript
import { VerpClient } from '@v-erp/sdk'

const client = new VerpClient({ apiKey: '...' })
const workers = await client.workers.list()
```
