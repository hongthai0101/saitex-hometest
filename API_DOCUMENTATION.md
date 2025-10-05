# Saitex API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Insights & Chat](#insights--chat)
  - [Conversations](#conversations)
  - [Messages](#messages)
  - [Marketing Analytics](#marketing-analytics)
- [Streaming Responses](#streaming-responses)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

---

## Overview

The Saitex API is a RESTful API that provides access to AI-powered business intelligence features. It uses OpenAI's GPT models to convert natural language queries into SQL and provide insights from your data.

### Key Features

- 🤖 Natural language to SQL conversion
- 💬 Conversational AI interface
- 📊 Real-time data analytics
- 🔄 Streaming responses
- 📝 Conversation history management

---

## Authentication

Currently, the API uses a demo user system. Full JWT authentication will be implemented in production.

**Demo User ID:**
```
a81bc81b-dead-4e5d-abff-90865d1e13b1
```

### Future Authentication (Coming Soon)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

---

## Base URL

```
Development: http://localhost:3000/api
Production:  https://api.saitex.com/api
```

---

## Response Format

All API responses follow a consistent structure:

### Success Response

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { /* response data */ },
  "timestamp": "2024-12-21T10:30:00.000Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-12-21T10:30:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error |

### Common Error Responses

**Validation Error:**
```json
{
  "statusCode": 400,
  "message": [
    "message should not be empty",
    "userId must be a UUID"
  ],
  "error": "Bad Request"
}
```

**Not Found:**
```json
{
  "statusCode": 404,
  "message": "Conversation 123 not found",
  "error": "Not Found"
}
```

---

## Endpoints

### Insights & Chat

#### 1. Send Chat Message (Streaming)

Generate AI response with SQL query execution.

```http
POST /api/insights/chat
Content-Type: application/json
```

**Request Body:**

```json
{
  "message": "Show me total revenue for last month",
  "userId": "a81bc81b-dead-4e5d-abff-90865d1e13b1",
  "conversationId": "conv-uuid-here", // Optional - creates new if omitted
  "stream": true
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's natural language query |
| userId | UUID | Yes | User identifier |
| conversationId | UUID | No | Existing conversation ID |
| stream | boolean | No | Enable streaming (default: true) |

**Response (Server-Sent Events):**

```
data: {"content": "Let me analyze", "finished": false}

data: {"content": " your revenue data", "finished": false}

data: {"content": " for last month...", "finished": false}

data: {"content": "", "finished": true, "sqlQuery": "SELECT DATE_TRUNC('month', created_at) as month, ROUND(SUM(total_amount)::numeric, 2) as revenue FROM orders WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE) GROUP BY DATE_TRUNC('month', created_at)", "sqlResult": [...], "usage": {"promptTokens": 150, "completionTokens": 250, "totalTokens": 400}, "metadata": {"processingTime": 2500, "cost": 0.0025, "conversationId": "new-conv-id"}}

data: [DONE]
```

**Non-Streaming Response:**

Set `stream: false` in request body:

```json
{
  "content": "Based on the data, your total revenue for last month was $45,320.50...",
  "sqlQuery": "SELECT ...",
  "sqlResult": [...],
  "usage": {
    "promptTokens": 150,
    "completionTokens": 250,
    "totalTokens": 400
  },
  "metadata": {
    "processingTime": 2500,
    "cost": 0.0025
  }
}
```

#### 2. Get Example Queries

Retrieve pre-defined example queries for users.

```http
GET /api/insights/examples
```

**Response:**

```json
{
  "categories": [
    "Sales Analysis",
    "Customer Insights",
    "Product Performance",
    "User Engagement",
    "Financial Overview",
    "Geographic Analysis"
  ],
  "examples": [
    {
      "id": 1,
      "category": "Sales Analysis",
      "title": "Revenue Trends",
      "query": "Show me the total revenue for each month this year",
      "description": "Analyze monthly revenue patterns and identify trends"
    },
    {
      "id": 2,
      "category": "Customer Insights",
      "title": "Customer Growth",
      "query": "How many new customers did we acquire in the last quarter?",
      "description": "Track customer acquisition and growth metrics"
    }
  ],
  "totalCount": 8
}
```

---

### Conversations

#### 1. Get All Conversations

Retrieve all conversations for a user.

```http
GET /api/insights/conversations?userId={userId}
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | User identifier |

**Response:**

```json
{
  "data": [
    {
      "id": "conv-uuid-1",
      "userId": "user-uuid",
      "title": "Revenue Analysis Q4",
      "isPinned": true,
      "totalTokens": 1500,
      "totalCost": 0.015,
      "createdAt": "2024-12-01T10:00:00.000Z",
      "updatedAt": "2024-12-15T14:30:00.000Z",
      "messages": [
        {
          "id": "msg-uuid-1",
          "role": "user",
          "content": "Show me Q4 revenue",
          "createdAt": "2024-12-01T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### 2. Get Single Conversation

Retrieve a specific conversation with all messages.

```http
GET /api/insights/conversations/{id}?userId={userId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Conversation ID |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | UUID | Yes | User identifier |

**Response:**

```json
{
  "id": "conv-uuid",
  "userId": "user-uuid",
  "title": "Revenue Analysis",
  "isPinned": false,
  "totalTokens": 2500,
  "totalCost": 0.025,
  "messages": [
    {
      "id": "msg-uuid-1",
      "conversationId": "conv-uuid",
      "role": "user",
      "type": "text",
      "content": "Show me revenue trends",
      "createdAt": "2024-12-01T10:00:00.000Z"
    },
    {
      "id": "msg-uuid-2",
      "conversationId": "conv-uuid",
      "role": "assistant",
      "type": "data_result",
      "content": "Here's your revenue analysis...",
      "sqlQuery": "SELECT ...",
      "sqlResult": [...],
      "promptTokens": 150,
      "completionTokens": 350,
      "totalTokens": 500,
      "cost": 0.005,
      "createdAt": "2024-12-01T10:00:05.000Z"
    }
  ],
  "createdAt": "2024-12-01T10:00:00.000Z",
  "updatedAt": "2024-12-01T10:00:05.000Z"
}
```

#### 3. Create Conversation

Create a new conversation.

```http
POST /api/insights/conversations
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "user-uuid",
  "title": "New Conversation"
}
```

**Response:**

```json
{
  "id": "new-conv-uuid",
  "userId": "user-uuid",
  "title": "New Conversation",
  "isPinned": false,
  "totalTokens": 0,
  "totalCost": 0,
  "createdAt": "2024-12-21T10:00:00.000Z",
  "updatedAt": "2024-12-21T10:00:00.000Z"
}
```

#### 4. Update Conversation

Update conversation title.

```http
PATCH /api/insights/conversations/{id}?userId={userId}
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Updated Title"
}
```

**Response:**

```json
{
  "id": "conv-uuid",
  "userId": "user-uuid",
  "title": "Updated Title",
  "isPinned": false,
  "updatedAt": "2024-12-21T10:05:00.000Z"
}
```

#### 5. Toggle Pin Conversation

Pin or unpin a conversation.

```http
PATCH /api/insights/conversations/{id}/pin?userId={userId}
```

**Response:**

```json
{
  "id": "conv-uuid",
  "isPinned": true,
  "updatedAt": "2024-12-21T10:10:00.000Z"
}
```

#### 6. Delete Conversation

Soft delete a conversation (and all messages).

```http
DELETE /api/insights/conversations/{id}?userId={userId}
```

**Response:**

```
204 No Content
```

---

### Messages

#### 1. Get Messages for Conversation

Retrieve all messages in a conversation.

```http
GET /api/insights/messages/{conversationId}
```

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| conversationId | UUID | Conversation ID |

**Response:**

```json
{
  "data": [
    {
      "id": "msg-uuid-1",
      "conversationId": "conv-uuid",
      "role": "user",
      "type": "text",
      "content": "Show me top products",
      "createdAt": "2024-12-21T10:00:00.000Z",
      "updatedAt": "2024-12-21T10:00:00.000Z"
    },
    {
      "id": "msg-uuid-2",
      "conversationId": "conv-uuid",
      "role": "assistant",
      "type": "data_result",
      "content": "Here are your top products...",
      "sqlQuery": "SELECT p.name, SUM(oi.quantity) as total_sold FROM products p JOIN order_items oi ON oi.product_id = p.id GROUP BY p.id ORDER BY total_sold DESC LIMIT 10",
      "sqlResult": [
        {
          "name": "Product A",
          "total_sold": 1500
        },
        {
          "name": "Product B",
          "total_sold": 1200
        }
      ],
      "promptTokens": 120,
      "completionTokens": 280,
      "totalTokens": 400,
      "cost": 0.004,
      "processingTime": 1850,
      "metadata": {
        "analysis": {
          "isDataRelated": true,
          "intent": "query",
          "confidence": 0.95
        }
      },
      "createdAt": "2024-12-21T10:00:05.000Z",
      "updatedAt": "2024-12-21T10:00:05.000Z"
    }
  ]
}
```

---

### Marketing Analytics

#### 1. Get Dashboard Metrics

```http
GET /api/insights/metrics/summary
```

**Response:**

```json
{
  "totalConversations": 42,
  "totalMessages": 156,
  "averageResponseTime": 1250,
  "tokensUsed": {
    "today": 15000,
    "thisMonth": 450000,
    "limit": 1000000
  },
  "popularQueries": [
    "Revenue analysis",
    "Customer segmentation",
    "Product performance"
  ],
  "lastActivity": "2024-12-21T10:30:00.000Z"
}
```

---

## Streaming Responses

The chat endpoint uses Server-Sent Events (SSE) for streaming responses.

### Client Implementation

**JavaScript/TypeScript:**

```typescript
async function streamChat(message: string) {
  const response = await fetch('http://localhost:3000/api/insights/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      userId: 'user-id',
      stream: true,
    }),
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)

        if (data === '[DONE]') {
          console.log('Stream finished')
          return
        }

        const parsed = JSON.parse(data)
        console.log('Chunk:', parsed)

        if (parsed.finished) {
          console.log('SQL Query:', parsed.sqlQuery)
          console.log('Result:', parsed.sqlResult)
        }
      }
    }
  }
}
```

### Stream Events

| Event | Description |
|-------|-------------|
| `content` chunk | Partial response content |
| `finished: false` | More chunks coming |
| `finished: true` | Final chunk with metadata |
| `[DONE]` | Stream complete |

---

## Rate Limiting

API rate limits are currently not enforced but will be implemented in future versions.

**Planned Rate Limits:**

| Tier | Requests/minute | Daily Limit |
|------|-----------------|-------------|
| Free | 10 | 1,000 |
| Pro | 60 | 10,000 |
| Enterprise | Unlimited | Unlimited |

**Future Rate Limit Headers:**

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640098800
```

---

## Examples

### Example 1: Simple Revenue Query

**Request:**

```bash
curl -X POST http://localhost:3000/api/insights/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me total revenue for last month",
    "userId": "a81bc81b-dead-4e5d-abff-90865d1e13b1",
    "stream": false
  }'
```

**Response:**

```json
{
  "content": "Based on your data, the total revenue for last month was **$45,320.50**.\n\n## Details\n\n| Month | Revenue | Orders |\n|-------|---------|--------|\n| Nov 2024 | $45,320.50 | 1,234 |\n\nThis represents a 12.5% increase compared to the previous month.",
  "sqlQuery": "SELECT DATE_TRUNC('month', created_at) as month, ROUND(SUM(total_amount)::numeric, 2) as revenue, COUNT(id) as orders FROM orders WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE) GROUP BY DATE_TRUNC('month', created_at)",
  "sqlResult": [
    {
      "month": "2024-11-01T00:00:00.000Z",
      "revenue": "45320.50",
      "orders": 1234
    }
  ]
}
```

### Example 2: Customer Analytics

**Request:**

```bash
curl -X POST http://localhost:3000/api/insights/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who are our top 5 customers by total spending?",
    "userId": "a81bc81b-dead-4e5d-abff-90865d1e13b1",
    "conversationId": "existing-conv-id"
  }'
```

### Example 3: Conversation Management

**Create Conversation:**

```bash
curl -X POST http://localhost:3000/api/insights/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "a81bc81b-dead-4e5d-abff-90865d1e13b1",
    "title": "Q4 Revenue Analysis"
  }'
```

**Get Conversations:**

```bash
curl -X GET "http://localhost:3000/api/insights/conversations?userId=a81bc81b-dead-4e5d-abff-90865d1e13b1"
```

**Delete Conversation:**

```bash
curl -X DELETE "http://localhost:3000/api/insights/conversations/conv-id?userId=user-id"
```

---

## Swagger UI

Interactive API documentation is available at:

```
http://localhost:3000/api/docs
```

This provides:
- Interactive API testing
- Request/response schemas
- Authentication setup
- Example payloads

---

## Support

For API support:
- 📧 Email: api-support@saitex.com
- 💬 Discord: https://discord.gg/saitex
- 📚 Docs: https://docs.saitex.com

---

## Changelog

### v1.0.0 (2024-12-21)
- Initial API release
- Chat streaming support
- Conversation management
- SQL generation with GPT-4

### Coming Soon
- JWT authentication
- Rate limiting
- Webhook support
- GraphQL endpoint
