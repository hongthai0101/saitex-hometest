import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '3000', 10),
  environment: process.env.APP_ENV || 'development',
  apiPrefix: 'api',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
}));