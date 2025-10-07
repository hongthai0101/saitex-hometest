import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Customer } from './entities/customer.entity'
import { Product } from './entities/product.entity'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { MarketingCampaign } from './entities/campaign.entity'
import { CampaignMetrics } from './entities/campaign-metrics.entity'
import { SeedingService } from './services/seeding.service'
import { SeedingController } from './controllers/seeding.controller'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Product,
      Order,
      OrderItem,
      MarketingCampaign,
      CampaignMetrics,
    ]),
  ],
  providers: [SeedingService],
  controllers: [SeedingController],
  exports: [TypeOrmModule],
})
export class MarketingModule {}