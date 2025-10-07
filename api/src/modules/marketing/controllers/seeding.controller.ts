import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedingService } from '../services/seeding.service';

@ApiTags('marketing-seeding')
@Controller('marketing/seed')
export class SeedingController {
  constructor(private readonly seedingService: SeedingService) {}

  @Post()
  @ApiOperation({
    summary: 'Truncate and seed marketing database',
    description:
      'Truncates all marketing tables and seeds them with sample data',
  })
  @ApiResponse({
    status: 201,
    description: 'Database seeded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Database seeded successfully' },
        count: { type: 'number', example: 15 },
      },
    },
  })
  async seed() {
    return this.seedingService.runSeed();
  }
}
