# Finance Tracker API Documentation

## Overview
The Finance Tracker API is a RESTful API built with Express.js and MongoDB that allows users to manage their expenses, track spending patterns, and view financial summaries.

**Base URL**: `http://localhost:5000/api`

**Environment**: Development

---

## Table of Contents
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Expenses](#expenses)
  - [Summaries](#summaries)
- [Data Models](#data-models)
- [Request/Response Examples](#requestresponse-examples)

---

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Error Handling
All API responses follow a consistent format with a `success` flag and appropriate HTTP status codes.

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid input or validation error
- `500` - Internal Server Error: Server-side error

---

## Endpoints

### Health Check

#### GET /health
Check if the API is running and healthy.

**Request**
```
GET http://localhost:5000/health
```

**Response** (200 OK)
```json
{
  "status": "OK",
  "message": "Finance API is running",
  "timestamp": "2025-11-25T10:30:00.000Z"
}
```

---

### Expenses

#### POST /expenses
Add a new expense to the tracker.

**Request**
```
POST http://localhost:5000/api/expenses
Content-Type: application/json
```

**Request Body**
```json
{
  "amount": 45.50,
  "category": "Food",
  "date": "2025-11-25T10:30:00Z",
  "notes": "Lunch at restaurant"
}
```

**Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | Number | Yes | Expense amount (must be numeric) |
| `category` | String | Yes | Category of expense. Allowed values: `Food`, `Transport`, `Entertainment`, `Shopping`, `Bills`, `Health`, `Other` |
| `date` | Date | No | Date of expense (ISO 8601 format). Defaults to current date if not provided |
| `notes` | String | No | Additional notes about the expense (max 500 characters) |

**Response** (201 Created)
```json
{
  "success": true,
  "data": {
    "_id": "67414f8e9c2a5b3c1d8f9g0h",
    "amount": 45.50,
    "category": "Food",
    "date": "2025-11-25T10:30:00.000Z",
    "notes": "Lunch at restaurant",
    "createdAt": "2025-11-25T10:30:00.000Z",
    "updatedAt": "2025-11-25T10:30:00.000Z",
    "__v": 0
  },
  "message": "Expense added successfully"
}
```

**Error Response** (400 Bad Request)
```json
{
  "success": false,
  "message": "Amount must be a number"
}
```

---

#### GET /expenses
Retrieve all expenses (limited to last 100 entries).

**Request**
```
GET http://localhost:5000/api/expenses
```

**Response** (200 OK)
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "67414f8e9c2a5b3c1d8f9g0h",
      "amount": 45.50,
      "category": "Food",
      "date": "2025-11-25T12:30:00.000Z",
      "notes": "Lunch at restaurant",
      "createdAt": "2025-11-25T10:30:00.000Z",
      "updatedAt": "2025-11-25T10:30:00.000Z",
      "__v": 0
    },
    {
      "_id": "67414f8e9c2a5b3c1d8f9g0i",
      "amount": 30.00,
      "category": "Transport",
      "date": "2025-11-25T08:15:00.000Z",
      "notes": "Taxi to office",
      "createdAt": "2025-11-25T08:15:00.000Z",
      "updatedAt": "2025-11-25T08:15:00.000Z",
      "__v": 0
    }
  ]
}
```

---

### Summaries

#### GET /expenses/summary/daily
Get daily expense summary for today.

**Request**
```
GET http://localhost:5000/api/expenses/summary/daily
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "total": 120.50,
    "count": 4,
    "byCategory": {
      "Food": 75.50,
      "Transport": 30.00,
      "Entertainment": 15.00
    },
    "expenses": [
      {
        "_id": "67414f8e9c2a5b3c1d8f9g0h",
        "amount": 45.50,
        "category": "Food",
        "date": "2025-11-25T12:30:00.000Z",
        "notes": "Lunch",
        "createdAt": "2025-11-25T12:30:00.000Z",
        "updatedAt": "2025-11-25T12:30:00.000Z"
      }
    ]
  }
}
```

---

#### GET /expenses/summary/weekly
Get weekly expense summary (last 7 days).

**Request**
```
GET http://localhost:5000/api/expenses/summary/weekly
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "total": 850.00,
    "count": 28,
    "averagePerDay": 121.43,
    "byCategory": {
      "Food": 450.00,
      "Transport": 200.00,
      "Entertainment": 150.00,
      "Shopping": 50.00
    },
    "byDay": [
      {
        "date": "2025-11-18",
        "total": 95.50
      },
      {
        "date": "2025-11-19",
        "total": 120.00
      }
    ]
  }
}
```

---

#### GET /expenses/summary/monthly
Get monthly expense summary (last 30 days).

**Request**
```
GET http://localhost:5000/api/expenses/summary/monthly
```

**Response** (200 OK)
```json
{
  "success": true,
  "data": {
    "total": 3500.00,
    "count": 95,
    "averagePerDay": 116.67,
    "byCategory": {
      "Food": 1200.00,
      "Transport": 800.00,
      "Bills": 600.00,
      "Entertainment": 500.00,
      "Shopping": 300.00,
      "Health": 100.00
    },
    "topCategories": [
      {
        "category": "Food",
        "amount": 1200.00,
        "percentage": 34.29
      },
      {
        "category": "Transport",
        "amount": 800.00,
        "percentage": 22.86
      }
    ]
  }
}
```

---

## Data Models

### Expense Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `_id` | ObjectId | Auto | - | Unique identifier |
| `amount` | Number | Yes | > 0 | Expense amount in currency units |
| `category` | String | Yes | One of enum values | Type of expense |
| `date` | Date | Yes | - | Date of transaction |
| `notes` | String | No | Max 500 chars | Additional information |
| `createdAt` | Date | Auto | - | Timestamp when created |
| `updatedAt` | Date | Auto | - | Timestamp when last updated |

**Valid Categories**:
- Food
- Transport
- Entertainment
- Shopping
- Bills
- Health
- Other

---

## Request/Response Examples

### Example 1: Add Multiple Expenses

**Request 1**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "category": "Food",
    "notes": "Breakfast"
  }'
```

**Request 2**
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "category": "Shopping",
    "date": "2025-11-25T14:00:00Z",
    "notes": "Winter clothes"
  }'
```

### Example 2: Get Daily Summary

```bash
curl -X GET http://localhost:5000/api/expenses/summary/daily
```

This will return today's total expenses broken down by category.

---

## Notes

- All dates are in ISO 8601 format (UTC timezone)
- Amounts are stored as decimal numbers
- Expenses are sorted by date in descending order (most recent first)
- The API enforces validation on all inputs
- Maximum 500 characters allowed for notes
- All category names are case-sensitive

---

## Future Enhancements

- User authentication and authorization
- Update/Delete expense endpoints
- Recurring expenses
- Budget limits and alerts
- Export functionality (CSV, PDF)
- Advanced filtering and search
- Data analytics and insights

---

**Last Updated**: November 25, 2025
**API Version**: 1.0.0
