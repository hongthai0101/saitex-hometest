# Saitex Frontend

Modern React application built with TypeScript, Vite, and Recharts.

## 🚀 Tech Stack

- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool
- **Recharts** - Charts and data visualization
- **React Router v6** - Routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Styling
- **React Hook Form + Zod** - Form validation

## 📁 Project Structure

```
app/
├── src/
│   ├── components/         # UI components
│   │   ├── ui/            # Reusable UI components
│   │   ├── common/        # Common components
│   │   └── layout/        # Layout components
│   ├── features/          # Feature-based modules
│   ├── pages/             # Page components
│   ├── routes/            # Routing configuration
│   ├── services/          # API services
│   ├── store/             # State management (Zustand)
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and helpers
│   ├── assets/            # Static assets
│   └── config/            # Configuration files
├── public/                # Public static files
└── package.json
```

## 🛠️ Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint

# Format code
pnpm format
```

## 🎨 Architecture Highlights

### Feature-Based Structure
Code is organized by features rather than file types, making it easier to locate and manage related code.

### Type Safety
Strict TypeScript configuration ensures type safety across the application.

### State Management
- **React Query** for server state (API data, caching, synchronization)
- **Zustand** for client state (UI state, user preferences)
- **React Hook Form** for form state

### Code Splitting
Routes are lazy-loaded for optimal performance and faster initial load times.

### API Integration
Centralized API service with interceptors for authentication, error handling, and request/response transformation.

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Saitex
```

### Path Aliases

The following path aliases are configured:

```typescript
@/*              -> ./src/*
@/components/*   -> ./src/components/*
@/features/*     -> ./src/features/*
@/pages/*        -> ./src/pages/*
@/services/*     -> ./src/services/*
@/store/*        -> ./src/store/*
@/hooks/*        -> ./src/hooks/*
@/types/*        -> ./src/types/*
@/lib/*          -> ./src/lib/*
@/assets/*       -> ./src/assets/*
@/config/*       -> ./src/config/*
```

## 📊 Charts with Recharts

Dashboard page includes examples of:
- Line charts for trend visualization
- Bar charts for comparative data
- Responsive charts that adapt to screen size

## 🎯 Best Practices

1. **Component Design**
   - Keep components small and focused
   - Use TypeScript interfaces for props
   - Implement proper error boundaries

2. **State Management**
   - Use React Query for server state
   - Use Zustand for global client state
   - Keep local state in components when possible

3. **Performance**
   - Lazy load routes and heavy components
   - Use React.memo for expensive renders
   - Implement proper memoization with useMemo/useCallback

4. **Code Quality**
   - Follow ESLint rules
   - Write meaningful TypeScript types
   - Keep files under 300 lines
   - Add comments for complex logic

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Vite Documentation](https://vitejs.dev)
- [Recharts Documentation](https://recharts.org)
- [React Router Documentation](https://reactrouter.com)
- [React Query Documentation](https://tanstack.com/query)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

## 🤝 Contributing

1. Follow the established code structure
2. Use TypeScript strictly (no `any` types)
3. Write tests for new features
4. Run linting before committing
5. Follow conventional commit messages

## 📝 License

This project is part of the Saitex application.
