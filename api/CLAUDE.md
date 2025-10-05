# Claude AI Assistant Rules for NestJS API Project

## Project Overview
This is a NestJS API project using PostgreSQL database with TypeORM. The project follows Domain-Driven Design (DDD) principles and modular architecture.

## Core Technologies
- **Framework**: NestJS v11
- **Language**: TypeScript v5.7
- **Database**: PostgreSQL with TypeORM v0.3
- **Package Manager**: pnpm
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Authentication**: bcrypt for password hashing

## Project Structure

```
api/
├── src/
│   ├── common/                 # Shared utilities and components
│   │   ├── decorators/         # Custom decorators
│   │   ├── dto/                # Common DTOs (Pagination, etc.)
│   │   ├── filters/            # Exception filters
│   │   ├── guards/             # Auth guards
│   │   ├── interceptors/       # Response/logging interceptors
│   │   ├── interfaces/         # Shared interfaces
│   │   ├── pipes/              # Validation pipes
│   │   └── utils/              # Helper functions
│   │
│   ├── config/                 # Configuration files
│   │   ├── app.config.ts       # App configuration
│   │   ├── database.config.ts  # Database configuration
│   │   └── jwt.config.ts       # JWT configuration
│   │
│   ├── database/               # Database module
│   │   ├── migrations/         # TypeORM migrations
│   │   ├── seeders/            # Database seeders
│   │   └── database.module.ts
│   │
│   ├── modules/                # Feature modules
│   │   ├── auth/               # Authentication module
│   │   ├── users/              # User management
│   │   └── [feature]/          # Other feature modules
│   │       ├── dto/            # Data Transfer Objects
│   │       ├── entities/       # TypeORM entities
│   │       ├── interfaces/     # Module interfaces
│   │       ├── [feature].controller.ts
│   │       ├── [feature].service.ts
│   │       └── [feature].module.ts
│   │
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
│
├── test/                       # Test files
│   ├── e2e/                    # End-to-end tests
│   └── unit/                   # Unit tests
│
├── .env                        # Environment variables
├── .env.example                # Example environment file
└── package.json
```

## Development Rules

### 1. Module Creation Rules

When creating a new module, ALWAYS follow this structure:

```typescript
// 1. Create the entity first
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Always include these fields
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}

// 2. Create DTOs
// create-[module].dto.ts
export class CreateModuleDto {
  // Use decorators from class-validator
  @IsNotEmpty()
  @IsString()
  fieldName: string;
}

// update-[module].dto.ts
export class UpdateModuleDto extends PartialType(CreateModuleDto) {}

// 3. Create service with repository pattern
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
  ) {}
}

// 4. Create controller with Swagger documentation
@ApiTags('module-name')
@Controller('module-name')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}
}
```

### 2. Database and Entity Rules

```typescript
// ALWAYS use these patterns for entities:

// 1. Soft deletes for all entities
@DeleteDateColumn()
deletedAt?: Date;

// 2. UUID for primary keys
@PrimaryGeneratedColumn('uuid')
id: string;

// 3. Indexes for frequently queried fields
@Index()
@Column()
email: string;

// 4. Relations should be clearly defined
@ManyToOne(() => User, user => user.posts)
@JoinColumn({ name: 'user_id' })
user: User;

// 5. Use migrations for schema changes (never use synchronize in production)
// Generate migration: npm run typeorm migration:generate -- -n MigrationName
```

### 3. Service Layer Rules

```typescript
// ALWAYS implement these patterns in services:

// 1. Pagination for list endpoints
async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Entity>> {
  const { page = 1, limit = 10 } = paginationDto;
  const skip = (page - 1) * limit;

  const [data, totalCount] = await this.repository.findAndCount({
    where: { deletedAt: null },
    skip,
    take: limit,
    order: { createdAt: 'DESC' },
  });

  return {
    data,
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
}

// 2. Proper error handling
async findOne(id: string): Promise<Entity> {
  const entity = await this.repository.findOne({
    where: { id, deletedAt: null },
  });

  if (!entity) {
    throw new NotFoundException(`Entity with ID ${id} not found`);
  }

  return entity;
}

// 3. Check for duplicates
async create(dto: CreateDto): Promise<Entity> {
  const existing = await this.repository.findOne({
    where: { email: dto.email },
  });

  if (existing) {
    throw new ConflictException('Email already exists');
  }

  const entity = this.repository.create(dto);
  return this.repository.save(entity);
}

// 4. Use transactions for complex operations
async complexOperation(): Promise<void> {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Multiple operations
    await queryRunner.commitTransaction();
  } catch (err) {
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }
}
```

### 4. Controller Rules

```typescript
// ALWAYS follow these patterns in controllers:

// 1. Use proper HTTP status codes
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateDto) {
  return this.service.create(dto);
}

// 2. Validate and transform inputs
@Get(':id')
async findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.service.findOne(id);
}

// 3. Use Swagger decorators
@ApiOperation({ summary: 'Create a new entity' })
@ApiResponse({ status: 201, description: 'Entity created successfully' })
@ApiResponse({ status: 409, description: 'Entity already exists' })

// 4. Implement proper guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
async remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

### 5. DTO and Validation Rules

```typescript
// ALWAYS use these validation patterns:

import { IsEmail, IsNotEmpty, IsOptional, IsUUID, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Use appropriate validators
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(120)
  age?: number;
}

// 2. Use PartialType for update DTOs
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

// 3. Create response DTOs to exclude sensitive data
export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  // Never include password in response
}
```

### 6. Error Handling Rules

```typescript
// ALWAYS handle errors consistently:

// 1. Use NestJS built-in exceptions
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');
throw new NotFoundException('Resource not found');
throw new ConflictException('Resource already exists');

// 2. Create custom exceptions when needed
export class BusinessLogicException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNPROCESSABLE_ENTITY);
  }
}

// 3. Use global exception filter (already configured)
```

### 7. Security Rules

```typescript
// ALWAYS follow these security practices:

// 1. Hash passwords
import * as bcrypt from 'bcrypt';

@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  if (this.password && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
}

// 2. Use environment variables for sensitive data
process.env.JWT_SECRET
process.env.DB_PASSWORD

// 3. Implement rate limiting
import * as rateLimit from 'express-rate-limit';

// 4. Validate all inputs
@UsePipes(new ValidationPipe({
  whitelist: true,           // Strip unknown properties
  forbidNonWhitelisted: true, // Throw error for unknown properties
  transform: true,            // Auto-transform types
}))

// 5. Use HTTPS in production
// 6. Implement CORS properly
// 7. Never log sensitive information
```

### 8. Testing Rules

```typescript
// ALWAYS write tests:

// 1. Unit tests for services
describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();
  });

  it('should create a user', async () => {
    // Test implementation
  });
});

// 2. E2E tests for controllers
describe('UserController (e2e)', () => {
  it('POST /users', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(createUserDto)
      .expect(201);
  });
});
```

### 9. Code Style Rules

```typescript
// 1. Use consistent naming conventions
// - PascalCase for classes: UserService, CreateUserDto
// - camelCase for variables and methods: userId, getUserById()
// - kebab-case for file names: user.service.ts, create-user.dto.ts
// - UPPER_CASE for constants: MAX_RETRY_COUNT

// 2. Use async/await instead of promises
// Good
async getUserById(id: string) {
  return await this.repository.findOne({ where: { id } });
}

// Bad
getUserById(id: string) {
  return this.repository.findOne({ where: { id } }).then(user => user);
}

// 3. Use proper TypeScript types (avoid 'any')
// 4. Keep functions small and focused (Single Responsibility)
// 5. Use meaningful variable names
```

### 10. Performance Rules

```typescript
// 1. Use select to limit fields
await this.repository.find({
  select: ['id', 'email', 'firstName'],
});

// 2. Use relations carefully
await this.repository.findOne({
  where: { id },
  relations: ['profile'], // Only load necessary relations
});

// 3. Use indexes on frequently queried fields
@Index()
@Column()
email: string;

// 4. Implement caching where appropriate
@UseInterceptors(CacheInterceptor)
@Get()
async findAll() {
  return this.service.findAll();
}

// 5. Use pagination for large datasets
// 6. Use database transactions for data consistency
```

## Commands and Scripts

```bash
# Development
pnpm run start:dev       # Start in watch mode
pnpm run build          # Build project
pnpm run start:prod     # Start production

# Database
pnpm run typeorm migration:create -- -n MigrationName     # Create migration
pnpm run typeorm migration:generate -- -n MigrationName   # Generate migration
pnpm run typeorm migration:run                            # Run migrations
pnpm run typeorm migration:revert                         # Revert migration

# Testing
pnpm run test           # Run unit tests
pnpm run test:watch     # Run tests in watch mode
pnpm run test:cov       # Run tests with coverage
pnpm run test:e2e       # Run e2e tests

# Code Quality
pnpm run lint           # Lint code
pnpm run format         # Format code with prettier
```

## Environment Variables

```env
# Always required in .env file:
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=saitex_db

APP_PORT=3000
APP_ENV=development

JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Optional
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Important Notes

1. **NEVER** commit .env file to repository
2. **ALWAYS** use DTOs for input validation
3. **ALWAYS** use TypeORM migrations in production (never synchronize: true)
4. **ALWAYS** implement soft deletes
5. **ALWAYS** validate UUIDs in params
6. **ALWAYS** use transactions for multiple database operations
7. **ALWAYS** handle errors properly with try-catch or NestJS exceptions
8. **ALWAYS** write API documentation with Swagger decorators
9. **ALWAYS** use dependency injection
10. **NEVER** expose sensitive information in responses

## When Adding New Features

1. Create feature module in `src/modules/[feature-name]/`
2. Define entity with proper decorators
3. Create DTOs for create, update, and response
4. Implement service with repository pattern
5. Create controller with Swagger documentation
6. Add module to imports in AppModule
7. Write unit tests for service
8. Write e2e tests for controller
9. Update Swagger documentation
10. Create or generate migration if database schema changes

## Best Practices Summary

- Follow SOLID principles
- Use Domain-Driven Design (DDD)
- Implement Repository pattern
- Use Dependency Injection
- Write clean, testable code
- Document APIs with Swagger
- Handle errors gracefully
- Validate all inputs
- Use TypeScript strictly (no any)
- Keep business logic in services
- Controllers should be thin
- Use DTOs for data transfer
- Implement proper logging
- Use environment variables
- Write comprehensive tests