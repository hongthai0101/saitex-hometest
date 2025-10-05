# Saitex API - NestJS with PostgreSQL

## Cấu trúc project

```
api/
├── src/
│   ├── common/             # Shared components
│   │   ├── dto/           # Common DTOs
│   │   ├── filters/       # Exception filters
│   │   └── interceptors/  # Response interceptors
│   ├── config/            # Configuration files
│   │   ├── app.config.ts
│   │   └── database.config.ts
│   ├── database/          # Database module
│   │   └── database.module.ts
│   ├── modules/           # Feature modules
│   │   └── users/        # User module example
│   │       ├── dto/
│   │       ├── entities/
│   │       ├── users.controller.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── .env                   # Environment variables
├── .env.example          # Example environment file
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Cài đặt

### 1. Cài đặt dependencies
```bash
cd api
pnpm install
```

### 2. Cấu hình PostgreSQL
- Tạo database PostgreSQL
- Cập nhật file `.env` với thông tin database của bạn

### 3. Chạy ứng dụng
```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

## API Documentation

Swagger documentation có sẵn tại: `http://localhost:3000/api/docs`

## Các tính năng đã triển khai

### 1. Cấu trúc Module chuẩn
- Tổ chức theo domain/feature modules
- Separation of concerns rõ ràng

### 2. Database Integration
- TypeORM với PostgreSQL
- Auto-migration trong development
- Soft delete support
- Entity relationships

### 3. Configuration Management
- Environment-based configuration
- Config validation
- Centralized config modules

### 4. Error Handling
- Global exception filter
- Standardized error responses
- Logging integration

### 5. Response Transformation
- Consistent API response format
- Response interceptor

### 6. Validation
- DTO validation với class-validator
- Global validation pipe
- Type transformation

### 7. API Documentation
- Swagger/OpenAPI integration
- Auto-generated documentation

### 8. User Module (Example)
- CRUD operations
- Pagination support
- Password hashing với bcrypt
- Email validation

## Các endpoints có sẵn

### Users
- `POST /api/users` - Tạo user mới
- `GET /api/users` - Lấy danh sách users (với pagination)
- `GET /api/users/:id` - Lấy thông tin user
- `PATCH /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user (soft delete)

## Scripts

```bash
# Build project
pnpm run build

# Format code
pnpm run format

# Lint code
pnpm run lint

# Run tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e
```

## Best Practices được áp dụng

1. **Modular Architecture**: Tổ chức code theo modules độc lập
2. **Dependency Injection**: Sử dụng DI container của NestJS
3. **Configuration Management**: Centralized và type-safe configuration
4. **Error Handling**: Global error handling với custom filters
5. **Validation**: Input validation với DTOs
6. **Documentation**: Auto-generated API documentation
7. **Security**: Password hashing, CORS configuration
8. **Database**: TypeORM với migrations và soft delete

## Phát triển tiếp theo

Bạn có thể mở rộng project với:
- Authentication module (JWT/Passport)
- Authorization (Guards & Roles)
- File upload module
- Email service
- Queue/Background jobs (Bull)
- Caching (Redis)
- WebSocket support
- Microservices communication