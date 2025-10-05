# Saitex Project - Claude AI Assistant Master Rules

## 🎯 Project Overview
Saitex is a full-stack web application with a modern architecture consisting of:
- **Frontend**: React TypeScript app with Vite, ShadCN UI, and Tailwind CSS
- **Backend**: NestJS API with PostgreSQL, TypeORM, and OpenAI integration
- **Architecture**: Modular, scalable, and AI-powered

## 📁 Project Structure

```
saitex/
├── app/                        # Frontend React application
│   ├── src/
│   │   ├── components/         # UI components (ShadCN + custom)
│   │   ├── pages/              # Page components
│   │   ├── layouts/            # Layout components
│   │   ├── routes/             # Routing configuration
│   │   ├── services/           # API services
│   │   ├── store/              # State management (Zustand)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript definitions
│   │   ├── contexts/           # React contexts
│   │   └── lib/                # Utilities
│   ├── public/                 # Static assets
│   └── package.json
│
├── api/                        # Backend NestJS API
│   ├── src/
│   │   ├── modules/            # Feature modules
│   │   ├── common/             # Shared components
│   │   ├── config/             # Configuration
│   │   ├── database/           # Database setup
│   │   └── main.ts             # Entry point
│   ├── test/                   # Test files
│   └── package.json
│
├── .serena/                    # Serena MCP configuration
├── .claude/                    # Claude configuration
└── CLAUDE.md                   # This file
```

## 🚀 Quick Start Commands

```bash
# Frontend (from /app directory)
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm lint               # Lint code
pnpm format             # Format code

# Backend (from /api directory)
pnpm start:dev          # Start API in watch mode
pnpm build              # Build API
pnpm test               # Run tests
pnpm migration:run      # Run database migrations

# Full Stack Development
# Terminal 1: cd api && pnpm start:dev
# Terminal 2: cd app && pnpm dev
```

## 🎨 Frontend Development Rules

### Technology Stack
- **React 18** with TypeScript 5
- **Vite 5** for blazing fast builds
- **ShadCN UI** for component library
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Router v6** for routing
- **React Hook Form + Zod** for forms

### Component Development

```typescript
// ALWAYS follow this component structure:
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComponentProps {
  title: string
  className?: string
}

export const Component = ({ title, className }: ComponentProps) => {
  const [state, setState] = useState(false)

  return (
    <div className={cn("base-classes", className)}>
      <Button variant="default">{title}</Button>
    </div>
  )
}
```

### State Management Rules

```typescript
// Server State - Use React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getUsers,
})

// Client State - Use Zustand
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// Form State - Use React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

### Styling Rules
- **ALWAYS** use Tailwind CSS classes
- **ALWAYS** use CSS variables for theming
- **ALWAYS** use cn() utility for conditional classes
- **NEVER** use inline styles unless absolutely necessary
- **PREFER** ShadCN UI components over custom ones

### Performance Optimization
- Use React.lazy() for route-level code splitting
- Implement proper memoization with useMemo/useCallback
- Use virtual scrolling for large lists
- Optimize bundle size with proper imports
- Cache API responses with React Query

## 🔧 Backend Development Rules

### Technology Stack
- **NestJS v11** framework
- **TypeScript 5.7**
- **PostgreSQL** database
- **TypeORM 0.3** for ORM
- **Swagger** for API documentation
- **JWT** for authentication
- **bcrypt** for password hashing

### Module Creation Pattern

```typescript
// Follow this structure for every module:

// 1. Entity
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  email: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt?: Date
}

// 2. DTOs
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string
}

// 3. Service
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>
  ) {}
}

// 4. Controller
@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private service: UserService) {}
}
```

### API Design Rules
- **ALWAYS** use RESTful conventions
- **ALWAYS** implement pagination for list endpoints
- **ALWAYS** validate inputs with DTOs
- **ALWAYS** use proper HTTP status codes
- **ALWAYS** document with Swagger decorators
- **ALWAYS** implement soft deletes
- **NEVER** expose sensitive data in responses

### Security Best Practices
- Hash passwords with bcrypt
- Use JWT for authentication
- Implement rate limiting
- Validate and sanitize all inputs
- Use environment variables for secrets
- Implement CORS properly
- Use HTTPS in production

## 🔄 Full Stack Integration Rules

### API Communication

```typescript
// Frontend Service
class UserService {
  private api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  })

  async getUsers() {
    const { data } = await this.api.get<ApiResponse<User[]>>('/users')
    return data
  }
}

// Backend Controller
@Get()
async findAll(): Promise<ApiResponse<User[]>> {
  const users = await this.service.findAll()
  return {
    statusCode: 200,
    message: 'Success',
    data: users,
    timestamp: new Date().toISOString(),
  }
}
```

### Type Sharing Strategy
- Define shared types in frontend `types/` directory
- Mirror API response types in frontend
- Use strict TypeScript on both ends
- Validate data at API boundaries

### Environment Configuration

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Saitex

# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=saitex_db
JWT_SECRET=secret-key
APP_PORT=3000
```

## 📝 Coding Standards

### TypeScript Rules
- **NEVER** use `any` type
- **ALWAYS** define interfaces for props
- **ALWAYS** use strict mode
- **PREFER** type inference when obvious
- **USE** generics for reusable code

### Naming Conventions
```typescript
// PascalCase for components/classes
UserProfile, ApiService

// camelCase for variables/functions
userId, getUserById()

// kebab-case for files
user-profile.tsx, api.service.ts

// UPPER_CASE for constants
MAX_RETRY_COUNT, API_TIMEOUT
```

### File Organization
- One component per file
- Group related files in directories
- Keep files under 300 lines
- Extract complex logic to hooks/services
- Co-locate tests with source files

### Git Commit Conventions
```bash
feat: Add user authentication
fix: Resolve navigation bug
docs: Update API documentation
style: Format code
refactor: Restructure auth module
test: Add user service tests
chore: Update dependencies
```

## 🧪 Testing Strategy

### Frontend Testing
```typescript
// Component testing with React Testing Library
describe('UserCard', () => {
  it('renders user information', () => {
    render(<UserCard user={mockUser} />)
    expect(screen.getByText(mockUser.name)).toBeInTheDocument()
  })
})
```

### Backend Testing
```typescript
// Service unit tests
describe('UserService', () => {
  it('should create user', async () => {
    const user = await service.create(createUserDto)
    expect(user).toBeDefined()
  })
})

// E2E API tests
it('POST /users', () => {
  return request(app.getHttpServer())
    .post('/users')
    .send(createUserDto)
    .expect(201)
})
```

## 🔍 Debugging & Development Tools

### Frontend Tools
- React DevTools
- Redux DevTools (for Zustand)
- Network tab for API debugging
- Lighthouse for performance
- React Query DevTools

### Backend Tools
- Swagger UI at `/api/docs`
- TypeORM query logging
- NestJS Logger service
- Postman/Insomnia for API testing

## ⚡ Performance Guidelines

### Frontend Performance
1. Lazy load routes and heavy components
2. Implement virtual scrolling for long lists
3. Optimize images (WebP, lazy loading)
4. Use React.memo for expensive renders
5. Minimize bundle size (analyze with vite-bundle-visualizer)

### Backend Performance
1. Use database indexes on frequently queried fields
2. Implement caching with Redis
3. Use pagination for large datasets
4. Optimize TypeORM queries (select specific fields)
5. Use database transactions for consistency

## 🚨 Common Pitfalls to Avoid

### Frontend
- ❌ Don't mutate state directly
- ❌ Don't use index as key in dynamic lists
- ❌ Don't make API calls in render
- ❌ Don't ignore TypeScript errors
- ❌ Don't create components unnecessarily

### Backend
- ❌ Don't use synchronize:true in production
- ❌ Don't expose sensitive data
- ❌ Don't ignore error handling
- ❌ Don't skip input validation
- ❌ Don't use raw SQL unless necessary

## 📚 Best Practices Checklist

### Before Committing Code
- [ ] Code passes linting
- [ ] TypeScript has no errors
- [ ] Tests are written and passing
- [ ] API endpoints are documented
- [ ] Sensitive data is not exposed
- [ ] Performance impact considered
- [ ] Code follows project conventions
- [ ] Complex logic is commented

### Code Review Focus
1. **Security**: Check for vulnerabilities
2. **Performance**: Look for bottlenecks
3. **Maintainability**: Ensure code is clean
4. **Testing**: Verify adequate coverage
5. **Documentation**: Check if well documented

## 🎯 Development Workflow

### Feature Development Process
1. **Plan**: Define requirements and design
2. **Setup**: Create branch from main
3. **Implement**: Write code following standards
4. **Test**: Write and run tests
5. **Document**: Update docs and comments
6. **Review**: Self-review and peer review
7. **Deploy**: Merge to main and deploy

### Daily Development
```bash
# Start your day
git pull origin main
pnpm install  # If dependencies changed

# Start services
cd api && pnpm start:dev
cd app && pnpm dev

# Make changes
git add .
git commit -m "feat: description"
git push origin feature-branch

# Create PR for review
```

## 🔐 Security Checklist

### Frontend Security
- [ ] Sanitize user inputs
- [ ] Use HTTPS only
- [ ] Store tokens securely (httpOnly cookies)
- [ ] Implement CSP headers
- [ ] Validate data from API

### Backend Security
- [ ] Hash passwords
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables
- [ ] Implement proper CORS
- [ ] Regular security updates

## 📖 Additional Resources

### Documentation
- Frontend components: `/app/README.md`
- Backend API: `/api/README.md`
- Swagger docs: `http://localhost:3000/api/docs`

### Important Files
- Frontend config: `/app/vite.config.ts`
- Backend config: `/api/src/config/`
- Database schema: `/api/src/modules/*/entities/`
- API routes: Check controllers in modules

## 🆘 Troubleshooting

### Common Issues & Solutions

**Frontend won't start**
```bash
cd app
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

**Backend database connection fails**
```bash
# Check PostgreSQL is running
# Verify .env database credentials
# Run migrations: pnpm migration:run
```

**Type errors after pulling**
```bash
# Rebuild TypeScript
pnpm build
# Restart TS server in VSCode
```

## 🎉 Final Notes

### Key Principles
1. **Consistency** - Follow established patterns
2. **Simplicity** - Keep it simple and readable
3. **Performance** - Optimize for user experience
4. **Security** - Never compromise on security
5. **Quality** - Write tests and documentation

### For Claude AI
When assisting with this project:
1. Always check existing patterns before suggesting new ones
2. Prioritize using existing components/utilities
3. Follow the established architecture
4. Suggest performance optimizations
5. Ensure security best practices
6. Write clean, maintainable code
7. Add appropriate tests
8. Update documentation

Remember: Good code is not just working code, but code that others can understand, maintain, and scale.