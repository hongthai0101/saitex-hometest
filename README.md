# Saitex - AI-Powered Business Intelligence Platform

<div align="center">

![Saitex Logo](https://via.placeholder.com/200x60/4F46E5/FFFFFF?text=SAITEX)

**An intelligent business analytics platform with natural language SQL generation**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E.svg)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991.svg)](https://openai.com/)

[Features](#-features) • [Architecture](#-architecture) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [API](#-api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

Saitex is a modern full-stack business intelligence platform that leverages AI to transform natural language queries into SQL, providing instant insights from your business data. Built with cutting-edge technologies, it offers real-time analytics, interactive dashboards, and an intelligent chatbot interface.

### What Makes Saitex Special?

- 🤖 **AI-Powered SQL Generation**: Convert natural language to SQL using GPT-4
- 📊 **Real-time Analytics**: Interactive dashboards with live data visualization
- 💬 **Intelligent Chatbot**: Ask questions in plain English, get data-driven answers
- 🔒 **Enterprise-Ready**: Secure, scalable, and production-ready
- 🎨 **Modern UI/UX**: Beautiful interface built with React and Tailwind CSS
- 📈 **Marketing Analytics**: Pre-built dashboards for customer, product, and campaign insights

---

## ✨ Key Features

### 🧠 AI Chat Interface

- **Natural Language Processing**: Ask questions in plain English
- **Smart SQL Generation**: Automatically generates optimized PostgreSQL queries
- **Contextual Understanding**: Maintains conversation history for follow-up questions
- **Real-time Streaming**: See responses as they're generated
- **Query Validation**: Automatic validation and error handling for generated SQL

### 📊 Analytics Dashboards

- **Customer Analytics**: Customer segmentation, lifetime value, acquisition trends
- **Product Performance**: Sales metrics, inventory tracking, top-performing products
- **Marketing Campaigns**: Campaign ROI, conversion rates, channel performance
- **Revenue Insights**: Revenue trends, forecasting, profit margins

### 🔐 Security & Performance

- **Role-Based Access Control**: User authentication and authorization
- **SQL Injection Prevention**: Built-in query validation and sanitization
- **Performance Optimization**: Efficient database queries with proper indexing
- **Query Validation**: Real-time SQL validation before execution

---

## 🏗 Architecture

Saitex follows a modern microservices-inspired architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │          React SPA (Vite + TypeScript)           │  │
│  │  - ShadCN UI Components                          │  │
│  │  - React Query (Server State)                    │  │
│  │  - Zustand (Client State)                        │  │
│  │  - React Router v6                               │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ REST API / SSE
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                     │
│  ┌─────────────────────────────────────────────────┐  │
│  │        NestJS API (TypeScript + Express)         │  │
│  │  - RESTful Controllers                           │  │
│  │  - Business Logic Services                       │  │
│  │  - Dependency Injection                          │  │
│  │  - Event Emitters                                │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   OpenAI     │  │   Schema     │  │  Insight     │ │
│  │   Service    │  │  Analyzer    │  │  Service     │ │
│  │              │  │              │  │              │ │
│  │ - Prompt     │  │ - Schema     │  │ - Chat       │ │
│  │   Analysis   │  │   Extraction │  │   Processing │ │
│  │ - SQL Gen    │  │ - Validation │  │ - Message    │ │
│  │ - Streaming  │  │ - Sample     │  │   History    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  ┌──────────────────────────────┐  ┌──────────────────┐│
│  │        PostgreSQL            │  │     OpenAI       ││
│  │                              │  │                  ││
│  │ - Marketing Tables           │  │ - GPT-4o         ││
│  │ - Insight Tables             │  │ - GPT-4o-mini    ││
│  │ - TypeORM Entities           │  │ - Embeddings     ││
│  │ - Migrations & Seeders       │  │                  ││
│  └──────────────────────────────┘  └──────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Design Patterns

- **Repository Pattern**: Data access abstraction with TypeORM
- **Dependency Injection**: Loose coupling and testability
- **Service Layer**: Business logic separation
- **DTO Pattern**: Data validation and transformation
- **Event-Driven**: Async operations with EventEmitter2

---

## 🛠 Tech Stack

### Frontend (`/app`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3 | UI Framework |
| **TypeScript** | 5.7 | Type Safety |
| **Vite** | 5.4 | Build Tool |
| **Tailwind CSS** | 3.4 | Styling |
| **ShadCN UI** | Latest | Component Library |
| **React Query** | 5.62 | Server State Management |
| **Zustand** | 5.0 | Client State Management |
| **React Router** | 6.28 | Routing |
| **React Hook Form** | 7.54 | Form Management |
| **Zod** | 3.24 | Schema Validation |
| **Recharts** | 2.15 | Data Visualization |
| **React Markdown** | 10.1 | Markdown Rendering |
| **Axios** | 1.7 | HTTP Client |

### Backend (`/api`)

| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.0 | API Framework |
| **TypeScript** | 5.7 | Type Safety |
| **PostgreSQL** | 16+ | Primary Database |
| **TypeORM** | 0.3 | ORM |
| **OpenAI** | 5.22 | AI Integration |
| **Swagger** | 8.0 | API Documentation |
| **bcrypt** | 5.1 | Password Hashing |
| **class-validator** | 0.14 | DTO Validation |
| **class-transformer** | 0.5 | DTO Transformation |

---

## 📁 Project Structure

```
saitex/
├── app/                          # Frontend React Application
│   ├── src/
│   │   ├── components/           # Reusable UI Components
│   │   │   ├── ui/              # ShadCN UI components
│   │   │   ├── chat/            # Chat interface components
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   └── common/          # Shared components
│   │   ├── pages/               # Page components
│   │   │   ├── ChatbotPage.tsx  # AI Chat interface
│   │   │   ├── DashboardPage.tsx # Analytics dashboard
│   │   │   ├── LoginPage.tsx    # Authentication
│   │   │   └── ...
│   │   ├── layouts/             # Layout components
│   │   ├── routes/              # Routing configuration
│   │   ├── services/            # API service layer
│   │   │   ├── api.ts           # Axios instance
│   │   │   ├── auth.service.ts  # Auth API
│   │   │   └── chat.service.ts  # Chat API
│   │   ├── store/               # Zustand stores
│   │   │   ├── auth.store.ts    # Auth state
│   │   │   └── chat.store.ts    # Chat state
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript types
│   │   ├── lib/                 # Utilities
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── api/                          # Backend NestJS API
│   ├── src/
│   │   ├── modules/             # Feature modules
│   │   │   ├── insight/         # AI Insight module
│   │   │   │   ├── entities/    # TypeORM entities
│   │   │   │   ├── dto/         # Data Transfer Objects
│   │   │   │   ├── services/    # Business logic
│   │   │   │   │   ├── insight.service.ts
│   │   │   │   │   ├── openai.service.ts
│   │   │   │   │   └── schema-analyzer.service.ts
│   │   │   │   ├── insight.controller.ts
│   │   │   │   └── insight.module.ts
│   │   │   ├── marketing/       # Marketing data module
│   │   │   └── auth/            # Authentication module
│   │   ├── database/            # Database configuration
│   │   │   ├── migrations/      # TypeORM migrations
│   │   │   └── seeders/         # Database seeders
│   │   ├── common/              # Shared utilities
│   │   ├── config/              # Configuration files
│   │   ├── app.module.ts
│   │   └── main.ts              # Entry point
│   ├── test/                    # Test files
│   ├── .env.example
│   └── package.json
│
├── .serena/                      # Serena MCP config
├── .claude/                      # Claude AI config
├── CLAUDE.md                     # AI Assistant rules
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **pnpm** >= 8.x (recommended) or npm
- **PostgreSQL** >= 14.x
- **OpenAI API Key** (for AI features)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/saitex.git
cd saitex
```

2. **Install dependencies**

```bash
# Install frontend dependencies
cd app
pnpm install

# Install backend dependencies
cd ../api
pnpm install
```

3. **Database Setup**

```bash
# Create PostgreSQL database
createdb saitex_db

# Run migrations
cd api
pnpm run migration:run

# Seed sample data
pnpm run seed
```

4. **Environment Configuration**

**Frontend (.env in `/app`):**

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Saitex
VITE_APP_VERSION=1.0.0
```

**Backend (.env in `/api`):**

```env
# Application
APP_PORT=3000
APP_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=saitex_db

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# JWT (Optional - for auth)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=3600

# CORS
CORS_ORIGINS=http://localhost:5173
```

5. **Start Development Servers**

```bash
# Terminal 1 - Start Backend API
cd api
pnpm run start:dev

# Terminal 2 - Start Frontend
cd app
pnpm run dev
```

6. **Access the Application**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

---

## ⚙️ Configuration

### OpenAI Configuration

The system uses OpenAI's GPT models for:

1. **Prompt Analysis** (GPT-4o-mini): Determines if user query is data-related
2. **SQL Generation** (GPT-4o): Generates PostgreSQL queries from natural language
3. **Response Generation** (GPT-4o-mini): Formats AI responses with markdown

### Database Schema

The application uses the following main tables:

**Marketing Module:**
- `customers` - Customer data with demographics
- `products` - Product catalog with categories
- `orders` - Order transactions
- `order_items` - Order line items
- `marketing_campaigns` - Campaign information
- `campaign_metrics` - Daily campaign metrics

**Insight Module:**
- `conversations` - Chat conversation threads
- `messages` - Chat messages with SQL queries and results

### SQL Generation Optimization

The system includes advanced prompt engineering for accurate SQL generation:

- ✅ Date filtering patterns (DATE_TRUNC, INTERVAL)
- ✅ Aggregation best practices (GROUP BY, ROUND, COALESCE)
- ✅ Performance guidelines (LIMIT, indexes)
- ✅ Few-shot examples for common queries
- ✅ Schema-aware with relationships
- ✅ Sample data for context

---

## 🔧 Development

### Frontend Development

```bash
cd app

# Development
pnpm dev              # Start dev server
pnpm build           # Build for production
pnpm preview         # Preview production build

# Code Quality
pnpm lint            # Run ESLint
pnpm format          # Format with Prettier
```

**Key Frontend Patterns:**

```typescript
// Component Structure
export const Component = ({ prop }: Props) => {
  const [state, setState] = useState()

  return (
    <div className={cn("base-classes", className)}>
      {/* Content */}
    </div>
  )
}

// API Service
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getUsers,
})

// State Management
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

### Backend Development

```bash
cd api

# Development
pnpm run start:dev    # Start in watch mode
pnpm run build       # Build project
pnpm run start:prod  # Start production

# Database
pnpm run migration:generate -- -n MigrationName
pnpm run migration:run
pnpm run seed

# Testing
pnpm run test        # Unit tests
pnpm run test:e2e    # E2E tests
pnpm run test:cov    # Coverage

# Code Quality
pnpm run lint        # ESLint
pnpm run format      # Prettier
```

**Key Backend Patterns:**

```typescript
// Module Structure
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [Controller],
  providers: [Service],
})
export class FeatureModule {}

// Service with Repository
@Injectable()
export class Service {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}
}

// Controller with Swagger
@ApiTags('feature')
@Controller('feature')
export class Controller {
  @Get()
  @ApiOperation({ summary: 'Get all' })
  async findAll() {}
}
```

---

## 🚢 Deployment

### Production Build

**Frontend:**

```bash
cd app
pnpm build
# Output: dist/
```

**Backend:**

```bash
cd api
pnpm build
# Output: dist/
```

### Docker Deployment

```dockerfile
# Example Dockerfile for Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/main"]
```

### Environment Variables (Production)

```env
# Backend Production
APP_ENV=production
DB_SSL=true
OPENAI_API_KEY=sk-prod-...
CORS_ORIGINS=https://app.saitex.com
```

### Deployment Checklist

- [ ] Set `DB_SSL=true` for production database
- [ ] Use environment variables for all secrets
- [ ] Enable CORS for specific domains only
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up monitoring (PM2, DataDog, etc.)
- [ ] Enable database backups
- [ ] Set up error tracking (Sentry)

---

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Swagger Documentation

Interactive API documentation available at:

```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Chat & Insights

```http
POST /api/insights/chat
Content-Type: application/json

{
  "message": "Show me total revenue for last month",
  "userId": "user-id",
  "conversationId": "conv-id" // optional
}
```

**Response (Server-Sent Events):**

```
data: {"content": "Analyzing", "finished": false}
data: {"content": " your data...", "finished": false}
data: {"content": "", "finished": true, "sqlQuery": "SELECT ...", "usage": {...}}
```

#### Conversations

```http
GET /api/insights/conversations?userId=user-id
POST /api/insights/conversations
PATCH /api/insights/conversations/:id
DELETE /api/insights/conversations/:id
```

#### Messages

```http
GET /api/insights/messages/:conversationId
```

#### Examples

```http
GET /api/insights/examples
```

**Response:**

```json
{
  "categories": ["Sales Analysis", "Customer Insights", ...],
  "examples": [
    {
      "id": 1,
      "category": "Sales Analysis",
      "title": "Revenue Trends",
      "query": "Show me total revenue for each month this year",
      "description": "Analyze monthly revenue patterns"
    }
  ]
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code formatting
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

### Code Style

- **Frontend**: ESLint + Prettier (Tailwind plugin)
- **Backend**: ESLint + Prettier
- **TypeScript**: Strict mode enabled
- **Naming**: PascalCase (components), camelCase (functions/variables)

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://reactjs.org/) - UI library
- [OpenAI](https://openai.com/) - AI models
- [ShadCN UI](https://ui.shadcn.com/) - Component library
- [TypeORM](https://typeorm.io/) - ORM framework

---

## 📞 Support

For support, email support@saitex.com or join our [Discord community](https://discord.gg/saitex).

---

<div align="center">

**[⬆ Back to Top](#saitex---ai-powered-business-intelligence-platform)**

Made with ❤️ by the Saitex Team

</div>
