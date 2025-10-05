# Claude AI Assistant Rules for React TypeScript App

## Project Overview
This is a modern React application built with TypeScript, Vite, ShadCN UI, and Recharts. The project follows modern React patterns with a focus on type safety, accessibility, and maintainable code architecture.

## Core Technologies
- **Framework**: React 18 with TypeScript 5.7
- **Build Tool**: Vite 5.0
- **UI Library**: ShadCN UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS 3.3 with CSS Variables
- **State Management**: Zustand 4.4 + React Query 5.12
- **Routing**: React Router DOM 6.20
- **Charts**: Recharts 2.10
- **Forms**: React Hook Form 7.48 + Zod 3.22
- **Icons**: Lucide React 0.294
- **Package Manager**: pnpm

## Project Structure

```
app/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable components
│   │   ├── ui/                 # ShadCN UI components
│   │   │   ├── button.tsx      # Button component with variants
│   │   │   ├── card.tsx        # Card container components
│   │   │   ├── input.tsx       # Form input component
│   │   │   ├── label.tsx       # Form label component
│   │   │   ├── badge.tsx       # Status badge component
│   │   │   ├── avatar.tsx      # User avatar component
│   │   │   ├── dropdown-menu.tsx # Dropdown menu
│   │   │   ├── switch.tsx      # Toggle switch
│   │   │   └── tabs.tsx        # Tabbed interface
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # Application header
│   │   │   └── Sidebar.tsx     # Navigation sidebar
│   │   └── common/             # Common components
│   │       └── LoadingScreen.tsx
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom React hooks
│   ├── layouts/                # Page layout components
│   │   ├── MainLayout.tsx      # Main application layout
│   │   └── AuthLayout.tsx      # Authentication layout
│   ├── lib/                    # Utility libraries
│   │   └── utils.ts            # Utility functions (cn, formatters)
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   │   ├── Login.tsx       # Login page
│   │   │   └── Register.tsx    # Registration page
│   │   ├── Dashboard.tsx       # Dashboard with charts
│   │   ├── Analytics.tsx       # Analytics page
│   │   ├── Users.tsx           # User management
│   │   ├── Settings.tsx        # Settings page
│   │   └── NotFound.tsx        # 404 error page
│   ├── routes/                 # Routing configuration
│   │   ├── index.tsx           # Main routes configuration
│   │   └── PrivateRoute.tsx    # Protected route component
│   ├── services/               # API services
│   │   ├── api.service.ts      # Base API service
│   │   └── auth.service.ts     # Authentication service
│   ├── store/                  # State management (Zustand)
│   ├── types/                  # TypeScript type definitions
│   │   ├── api.ts              # API response types
│   │   └── user.ts             # User entity types
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main App component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles with CSS variables
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
└── components.json             # ShadCN UI configuration
```

## Development Rules

### 1. Component Development Rules

#### ShadCN UI Components
**ALWAYS use ShadCN UI components when available:**

```tsx
// ✅ CORRECT - Use ShadCN UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ❌ INCORRECT - Don't create custom buttons/cards when ShadCN exists
<button className="px-4 py-2 bg-blue-500">Click me</button>
<div className="border rounded-lg p-4">Content</div>
```

#### Component Variant Patterns
**Use class-variance-authority (CVA) for component variants:**

```tsx
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

#### Component Structure
**Follow this component structure pattern:**

```tsx
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SomeIcon } from 'lucide-react'

// 2. Types/Interfaces
interface ComponentProps {
  title: string
  onAction?: () => void
}

// 3. Component
export const Component = ({ title, onAction }: ComponentProps) => {
  // 4. State
  const [isLoading, setIsLoading] = useState(false)

  // 5. Event handlers
  const handleClick = () => {
    setIsLoading(true)
    onAction?.()
  }

  // 6. Render
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Action'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 2. Styling Rules

#### CSS Variables and Theme
**ALWAYS use CSS variables for theming:**

```tsx
// ✅ CORRECT - Use semantic color tokens
<div className="bg-background text-foreground border-border">
<Button className="bg-primary text-primary-foreground">
<Badge variant="destructive">Error</Badge>

// ❌ INCORRECT - Don't use hardcoded colors
<div className="bg-white text-black border-gray-200">
<button className="bg-blue-600 text-white">
```

#### Tailwind Classes
**Use the cn() utility for conditional classes:**

```tsx
import { cn } from '@/lib/utils'

// ✅ CORRECT - Use cn() utility
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes',
  className
)}>

// ❌ INCORRECT - Manual class concatenation
<div className={`base-classes ${isActive ? 'active-classes' : ''} ${className}`}>
```

#### Component Composition
**Use compound components pattern:**

```tsx
// ✅ CORRECT - Compound components
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// ❌ INCORRECT - Monolithic props
<Card
  title="Title"
  description="Description"
  content="Content"
  action="Action"
/>
```

### 3. TypeScript Rules

#### Type Definitions
**Define proper interfaces for all props and data:**

```tsx
// ✅ CORRECT - Proper type definitions
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'manager'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  className?: string
}

// ❌ INCORRECT - Using any or missing types
interface UserCardProps {
  user: any
  onEdit?: Function
  onDelete?: Function
}
```

#### Generic Types
**Use generics for reusable components:**

```tsx
// ✅ CORRECT - Generic data table
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ data, columns, onRowClick }: DataTableProps<T>) {
  // Implementation
}
```

#### API Response Types
**Type all API responses:**

```tsx
// ✅ CORRECT - Typed API responses
interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
  timestamp: string
}

interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

// Usage
const response: ApiResponse<PaginatedResponse<User>> = await api.get('/users')
```

### 4. State Management Rules

#### React Query for Server State
**Use React Query for all server state:**

```tsx
// ✅ CORRECT - React Query patterns
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users', { page, limit }],
  queryFn: () => userService.getUsers({ page, limit }),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

const mutation = useMutation({
  mutationFn: userService.createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
    toast.success('User created successfully')
  },
  onError: (error) => {
    toast.error(error.message)
  },
})

// ❌ INCORRECT - Manual state management for server data
const [users, setUsers] = useState<User[]>([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  setLoading(true)
  userService.getUsers().then(setUsers).finally(() => setLoading(false))
}, [])
```

#### Zustand for Client State
**Use Zustand for complex client state:**

```tsx
// ✅ CORRECT - Zustand store
interface AppStore {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'system',
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}))
```

### 5. Form Handling Rules

#### React Hook Form + Zod
**ALWAYS use React Hook Form with Zod validation:**

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// ✅ CORRECT - Schema-first validation
const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
})

type UserFormData = z.infer<typeof userSchema>

export const UserForm = () => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  })

  const onSubmit = (data: UserFormData) => {
    // Form is automatically validated
    mutation.mutate(data)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            {...form.register('email')}
            className={form.formState.errors.email ? 'border-destructive' : ''}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
```

### 6. Routing Rules

#### Route Organization
**Organize routes with lazy loading:**

```tsx
// ✅ CORRECT - Lazy loaded routes
import { lazy, Suspense } from 'react'
import { LoadingScreen } from '@/components/common/LoadingScreen'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Users = lazy(() => import('@/pages/Users'))

export const AppRoutes = () => (
  <Suspense fallback={<LoadingScreen />}>
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
)
```

#### Protected Routes
**Implement proper route protection:**

```tsx
// ✅ CORRECT - Route protection
export const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
```

### 7. API Integration Rules

#### Service Layer Pattern
**Use service layer for API calls:**

```tsx
// ✅ CORRECT - Service layer
class UserService {
  async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    return apiService.get<PaginatedResponse<User>>('/users', params)
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    return apiService.post<User>('/users', userData)
  }

  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return apiService.patch<User>(`/users/${id}`, userData)
  }

  async deleteUser(id: string): Promise<void> {
    return apiService.delete(`/users/${id}`)
  }
}

export const userService = new UserService()
```

#### Error Handling
**Implement consistent error handling:**

```tsx
// ✅ CORRECT - Error handling
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getUsers,
  retry: (failureCount, error) => {
    if (error.status === 404) return false
    return failureCount < 3
  },
  onError: (error) => {
    if (error.status === 401) {
      // Handle unauthorized
      logout()
    } else {
      toast.error(error.message || 'An error occurred')
    }
  },
})
```

### 8. Chart Implementation Rules

#### Recharts Best Practices
**Follow Recharts patterns:**

```tsx
// ✅ CORRECT - Recharts implementation
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export const SalesChart = ({ data }: { data: ChartData[] }) => (
  <Card>
    <CardHeader>
      <CardTitle>Sales Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
)
```

### 9. Performance Rules

#### Component Optimization
**Optimize components for performance:**

```tsx
// ✅ CORRECT - Optimized component
import { memo, useMemo, useCallback } from 'react'

interface UserListProps {
  users: User[]
  onUserSelect: (user: User) => void
}

export const UserList = memo(({ users, onUserSelect }: UserListProps) => {
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.firstName.localeCompare(b.firstName)),
    [users]
  )

  const handleUserClick = useCallback(
    (user: User) => {
      onUserSelect(user)
    },
    [onUserSelect]
  )

  return (
    <div className="space-y-2">
      {sortedUsers.map((user) => (
        <UserCard key={user.id} user={user} onClick={handleUserClick} />
      ))}
    </div>
  )
})

UserList.displayName = 'UserList'
```

#### Bundle Optimization
**Optimize imports:**

```tsx
// ✅ CORRECT - Tree-shakable imports
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { User, Settings, LogOut } from 'lucide-react'

// ❌ INCORRECT - Import everything
import * as UI from '@/components/ui'
import * as Icons from 'lucide-react'
```

### 10. Accessibility Rules

#### ARIA and Semantic HTML
**Ensure proper accessibility:**

```tsx
// ✅ CORRECT - Accessible component
<Card>
  <CardHeader>
    <CardTitle as="h2">User Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <form aria-labelledby="settings-title">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            aria-describedby="email-error"
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>
    </form>
  </CardContent>
</Card>
```

### 11. Testing Rules

#### Component Testing
**Write tests for components:**

```tsx
// ✅ CORRECT - Component test
import { render, screen, fireEvent } from '@testing-library/react'
import { UserCard } from './UserCard'

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  isActive: true,
}

describe('UserCard', () => {
  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn()
    render(<UserCard user={mockUser} onEdit={onEdit} />)

    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })
})
```

## Commands and Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm preview               # Preview production build

# Code Quality
pnpm lint                  # Run ESLint
pnpm format               # Format with Prettier

# Testing
pnpm test                 # Run tests
pnpm test:watch          # Run tests in watch mode
pnpm test:coverage       # Run tests with coverage

# Dependencies
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
pnpm update              # Update dependencies
```

## File Naming Conventions

```
- Components: PascalCase (UserCard.tsx, LoginForm.tsx)
- Pages: PascalCase (Dashboard.tsx, Settings.tsx)
- Hooks: camelCase starting with 'use' (useAuth.ts, useUsers.ts)
- Utils: camelCase (formatDate.ts, apiClient.ts)
- Types: camelCase (user.ts, api.ts)
- Constants: UPPER_CASE (API_ENDPOINTS.ts)
```

## Environment Variables

```env
# Required for Vite (prefix with VITE_)
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Saitex App
VITE_APP_VERSION=1.0.0

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
```

## Important Notes

### ShadCN UI Specific Rules
1. **NEVER** modify components in `src/components/ui/` directly
2. **ALWAYS** extend or compose UI components instead
3. **USE** the `cn()` utility for className manipulation
4. **FOLLOW** the variant patterns using CVA
5. **MAINTAIN** the component composition pattern

### Performance Guidelines
1. **USE** React.lazy() for route-level code splitting
2. **IMPLEMENT** proper memoization for expensive operations
3. **OPTIMIZE** bundle size with proper imports
4. **CACHE** API responses with React Query
5. **MINIMIZE** re-renders with proper dependency arrays

### Security Guidelines
1. **VALIDATE** all user inputs with Zod schemas
2. **SANITIZE** data before rendering
3. **PROTECT** routes with proper authentication checks
4. **HANDLE** errors gracefully without exposing sensitive data
5. **USE** environment variables for configuration

### Code Quality Guidelines
1. **WRITE** self-documenting code with clear names
2. **MAINTAIN** consistent code style with Prettier/ESLint
3. **FOLLOW** TypeScript strict mode
4. **IMPLEMENT** proper error boundaries
5. **DOCUMENT** complex business logic

## When Adding New Features

1. **Plan the component hierarchy** and data flow
2. **Define TypeScript interfaces** for all data structures
3. **Create Zod schemas** for validation
4. **Use ShadCN UI components** as building blocks
5. **Implement proper error handling** and loading states
6. **Add React Query** for server state management
7. **Write tests** for critical functionality
8. **Update documentation** as needed

This project follows modern React best practices with a focus on type safety, accessibility, and maintainable architecture. Always prioritize user experience and code quality in all implementations.