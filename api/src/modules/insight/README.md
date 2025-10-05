# Insight Module - AI-Powered Business Intelligence

## 📋 Overview

The Insight Module provides AI-powered business intelligence capabilities that allow users to chat with their business data using natural language. It leverages OpenAI's GPT models to understand user queries, generate SQL, and provide meaningful insights from your marketing and business data.

## 🚀 Features

### 1. **Natural Language to SQL**
- Users can ask questions in plain English
- AI analyzes the intent and generates appropriate SQL queries
- Automatic database schema analysis for accurate query generation

### 2. **Streaming Chat Interface**
- Real-time streaming responses using Server-Sent Events (SSE)
- Chat conversation management with message history
- Token usage and cost tracking

### 3. **Smart Intent Recognition**
- Distinguishes between data-related and general queries
- Provides helpful suggestions for non-data questions
- Confidence scoring for query understanding

### 4. **Business Data Analysis**
- Automatic analysis of marketing database tables
- Support for complex relationships and joins
- Data validation and error handling

### 5. **Comprehensive Tracking**
- Conversation and message persistence
- Token usage and cost calculations
- Processing time metrics
- Analytics events for monitoring

## 🏗️ Architecture

```
insight/
├── entities/           # Database entities
│   ├── conversation.entity.ts
│   └── message.entity.ts
├── dto/               # Data Transfer Objects
│   ├── create-conversation.dto.ts
│   ├── create-message.dto.ts
│   └── chat-request.dto.ts
├── services/          # Business logic services
│   ├── insight.service.ts
│   ├── openai.service.ts
│   └── schema-analyzer.service.ts
├── insight.controller.ts
├── insight.module.ts
└── README.md
```

## 📊 Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  user_id UUID,
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role ENUM('user', 'assistant', 'system'),
  type ENUM('text', 'sql_query', 'data_result', 'suggestion', 'error'),
  content TEXT,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  sql_query TEXT NULL,
  sql_result JSONB NULL,
  processing_time INTEGER NULL,
  metadata JSONB NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Setup & Configuration

### 1. Environment Variables
Add to your `.env` file:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here
```

### 2. Database Migration
Run the migration to create the insight tables:
```bash
npm run typeorm migration:run
```

### 3. Marketing Data
Ensure you have marketing tables set up (customers, products, orders, etc.) for the AI to analyze.

## 📡 API Endpoints

### Chat with Streaming Response
```http
POST /insights/chat
Content-Type: application/json

{
  "message": "Show me total sales for this month",
  "userId": "uuid-here",
  "conversationId": "uuid-here", // optional for new conversations
  "stream": true
}
```

**Streaming Response (SSE):**
```
data: {"content": "Based on", "finished": false}
data: {"content": " your sales data", "finished": false}
data: {"content": "", "finished": true, "usage": {...}, "sqlQuery": "SELECT ...", "sqlResult": [...]}
```

### Alternative SSE Endpoint
```http
POST /insights/chat/stream
Content-Type: application/json

{
  "message": "How many customers do we have?",
  "userId": "uuid-here"
}
```

**SSE Events:**
```
event: connected
data: {"message": "Connected to insight stream"}

event: chunk
data: {"content": "We currently have", "finished": false}

event: chunk
data: {"content": " 1,234 active customers", "finished": false}

event: done
data: {"message": "Stream completed"}
```

### Conversation Management
```http
# Get all conversations
GET /insights/conversations?userId=uuid-here

# Get specific conversation
GET /insights/conversations/:id?userId=uuid-here

# Create new conversation
POST /insights/conversations
{
  "title": "Sales Analysis",
  "userId": "uuid-here"
}

# Delete conversation
DELETE /insights/conversations/:id?userId=uuid-here

# Get conversation statistics
GET /insights/conversations/:id/stats
```

## 🤖 How It Works

### 1. **Query Analysis**
```typescript
const analysis = await openaiService.analyzePrompt("Show me top customers")
// Result: { isDataRelated: true, intent: "query", entities: ["customers"], confidence: 0.95 }
```

### 2. **Schema Analysis**
```typescript
const schemas = await schemaService.getMarketingSchema()
// Returns: [{ tableName: "customers", columns: [...], relationships: [...] }]
```

### 3. **SQL Generation**
```typescript
const sqlResult = await openaiService.generateSQL(prompt, schemas, analysis)
// Result: { sqlQuery: "SELECT COUNT(*) FROM customers WHERE is_active = true", ... }
```

### 4. **Data Execution & Response**
```typescript
const data = await dataSource.query(sqlResult.sqlQuery)
const responseStream = openaiService.generateStreamingResponse(prompt, context, data)
```

## 💡 Example Queries

The AI can handle various types of business questions:

### Sales & Revenue
- "What's our total revenue this month?"
- "Show me sales trends for the last 6 months"
- "Which products are our top sellers?"

### Customer Analytics
- "How many active customers do we have?"
- "What's our customer retention rate?"
- "Show me customer segmentation by loyalty tier"

### Marketing Performance
- "Which marketing campaigns performed best?"
- "What's our customer acquisition cost?"
- "Show me conversion rates by campaign type"

### Product Analysis
- "What are our most profitable products?"
- "Which products have the highest ratings?"
- "Show me inventory levels by category"

## 🛡️ Security & Validation

### SQL Injection Prevention
- All queries are generated by AI, not user input
- Query validation against database schema
- Parameterized queries where applicable

### Data Access Control
- User-scoped conversations
- No sensitive data exposure in responses
- Audit logging for all queries

### Rate Limiting
- Token usage tracking
- Cost monitoring per user/conversation
- Processing time limits

## 📈 Monitoring & Analytics

### Cost Tracking
```typescript
const stats = await insightService.getConversationStats(conversationId)
// Returns: { messageCount, totalTokens, totalCost, avgProcessingTime }
```

### Events
The service emits analytics events:
```typescript
// Listen for query completion events
eventEmitter.on('insight.query.completed', (data) => {
  console.log('Query completed:', data.userId, data.query, data.cost)
})
```

## 🚨 Error Handling

### Common Scenarios
1. **Non-data related queries** → Provides helpful suggestions
2. **SQL generation failures** → Falls back to general AI response
3. **Database errors** → Returns user-friendly error messages
4. **OpenAI API issues** → Graceful degradation with retry logic

### Error Response Format
```json
{
  "content": "I encountered an issue generating the query. Please try rephrasing your question.",
  "finished": true,
  "error": true
}
```

## 🔮 Future Enhancements

- **Multi-database support** for different business modules
- **Custom visualization generation** for charts and graphs
- **Saved query templates** for common business questions
- **Advanced analytics** with trend prediction
- **Integration with BI tools** like Tableau, Power BI
- **Natural language report generation**

## 📝 Best Practices

### For Frontend Integration
1. Use SSE for real-time streaming experience
2. Handle connection drops gracefully
3. Display token usage for transparency
4. Cache conversation history locally

### For Backend Optimization
1. Monitor OpenAI API costs regularly
2. Implement query result caching
3. Set up proper database indexes
4. Use connection pooling for database queries

### For User Experience
1. Provide example questions on empty state
2. Show typing indicators during processing
3. Display SQL queries for transparency
4. Allow users to refine queries easily

## 🤝 Contributing

When adding new features:
1. Update database schemas with migrations
2. Add comprehensive error handling
3. Include usage examples in documentation
4. Write tests for new functionality
5. Update cost calculations for new AI models