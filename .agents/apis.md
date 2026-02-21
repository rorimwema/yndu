# Yndu API Documentation

## Overview

This document describes the current API implementation status. The architecture specifies **GraphQL
Federation**, but the current implementation uses **REST endpoints** with a GraphQL stub.

---

## Current API Status

### GraphQL (NOT WORKING - Stub Only)

**Endpoint**: `POST /graphql`

The GraphQL endpoint is a stub that returns `{ data: null }`.

```typescript
// src/routes/mod.ts:26-30
router.post('/graphql', async (ctx) => {
  const body = await ctx.request.body.json();
  // GraphQL handler implementation
  ctx.response.body = { data: null };
});
```

**Federation Gateway**: Scaffolded at `gateway/src/index.js` but not connected to actual services.

---

## REST API Endpoints (Working)

### Base URL: `http://localhost:8000`

---

### Health Check

| Method | Endpoint  | Description           |
| ------ | --------- | --------------------- |
| GET    | `/health` | Service health status |

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-02-21T10:00:00Z"
}
```

---

### Authentication

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/register`        | Register new user      |
| POST   | `/api/auth/login`           | User login             |
| POST   | `/api/auth/verify-phone`    | Verify phone OTP       |
| POST   | `/api/auth/forgot-password` | Request password reset |

---

### Orders

| Method | Endpoint                 | Description                                          |
| ------ | ------------------------ | ---------------------------------------------------- |
| GET    | `/api/orders`            | List orders (filters: userId, status, limit, offset) |
| GET    | `/api/orders/:id`        | Get order by ID                                      |
| POST   | `/api/orders`            | Create new order                                     |
| PUT    | `/api/orders/:id/status` | Update order status                                  |

**GET /api/orders**

```
Query Parameters:
- userId (string, optional)
- status (string, optional): PENDING | CONFIRMED | ASSIGNED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED
- limit (number, default: 20)
- offset (number, default: 0)
```

**POST /api/orders**

```json
{
  "userId": "uuid",
  "items": [
    {
      "produceId": "uuid",
      "quantity": 2.5
    }
  ],
  "deliveryAddressId": "uuid",
  "preferredDeliveryDate": "2026-02-25",
  "isSubscription": false,
  "subscriptionFrequency": "WEEKLY"
}
```

**PUT /api/orders/:id/status**

```json
{
  "status": "CONFIRMED",
  "confirmedBy": "user-id",
  "reason": "Cancelled by user",
  "riderId": "rider-uuid"
}
```

---

### Subscriptions

| Method | Endpoint                                | Description                      |
| ------ | --------------------------------------- | -------------------------------- |
| GET    | `/api/subscriptions`                    | List user subscriptions          |
| GET    | `/api/subscriptions/:id`                | Get subscription details         |
| POST   | `/api/subscriptions`                    | Create subscription              |
| PUT    | `/api/subscriptions/:id/pause`          | Pause subscription               |
| PUT    | `/api/subscriptions/:id/resume`         | Resume subscription              |
| PUT    | `/api/subscriptions/:id/cancel`         | Cancel subscription              |
| PUT    | `/api/subscriptions/:id/modify`         | Modify subscription              |
| POST   | `/api/subscriptions/:id/generate-order` | Generate order from subscription |
| POST   | `/api/subscriptions/:id/renew`          | Process renewal                  |

**GET /api/subscriptions**

```
Query Parameters:
- userId (string, required)
- status (string, optional): ACTIVE | PAUSED | CANCELLED
```

**POST /api/subscriptions**

```json
{
  "userId": "uuid",
  "planName": "Medium Box",
  "planPriceCents": 5000,
  "billingCycle": "WEEKLY",
  "deliveryAddressId": "uuid",
  "preferredDeliveryDate": "2026-02-25",
  "items": [
    {
      "produceId": "uuid",
      "quantity": 1,
      "unit": "kg"
    }
  ]
}
```

**PUT /api/subscriptions/:id/pause**

```json
{
  "reason": "Vacation",
  "resumeDate": "2026-03-01"
}
```

**PUT /api/subscriptions/:id/modify**

```json
{
  "modificationType": "PLAN",
  "newPlanName": "Large Box",
  "newPlanPriceCents": 8000
}
```

---

### Inventory

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/inventory`     | List produce items |
| GET    | `/api/inventory/:id` | Get item by ID     |

**GET /api/inventory**

```
Query Parameters:
- category (string, optional): LEAFY_GREENS | ROOT_VEGETABLES | FRUITS | HERBS
- search (string, optional)
- limit (number, default: 20)
- offset (number, default: 0)
```

---

### Users

| Method | Endpoint                      | Description         |
| ------ | ----------------------------- | ------------------- |
| GET    | `/api/users/me`               | Get current user    |
| PUT    | `/api/users/me`               | Update current user |
| POST   | `/api/users/me/addresses`     | Add address         |
| DELETE | `/api/users/me/addresses/:id` | Remove address      |

---

## Response Formats

### Success Response

```json
{
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Pagination Response (Lists)

```json
{
  "items": [...],
  "pagination": {
    "limit": 20,
    "offset": 0,
    "total": 100
  }
}
```

---

## Status Codes

| Code | Description                         |
| ---- | ----------------------------------- |
| 200  | Success                             |
| 201  | Created                             |
| 400  | Bad Request                         |
| 401  | Unauthorized                        |
| 404  | Not Found                           |
| 409  | Conflict (e.g., insufficient stock) |
| 500  | Internal Server Error               |

---

## GraphQL Implementation Plan

To implement GraphQL according to architecture.md:

### 1. Create GraphQL Schema Files

- Define types: Order, Subscription, User, ProduceItem, etc.
- Define queries and mutations

### 2. Create Resolvers

- Implement resolvers in Deno
- Use `@gqtx` or similar GraphQL library for Deno

### 3. Set Up Apollo Federation

- Configure subgraphs for each service
- Set up gateway to compose schemas

### 4. Frontend Integration

- Install Apollo Client
- Create GraphQL queries and mutations
- Replace REST calls with GraphQL

---

## Notes

- Current implementation uses **REST** as the primary API
- GraphQL is planned but not implemented
- All data operations go through REST endpoints
- Frontend uses mock data for development
