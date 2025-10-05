import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../marketing/entities/order.entity';
import { Customer } from '../marketing/entities/customer.entity';
import { Product } from '../marketing/entities/product.entity';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Customer, Product])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
