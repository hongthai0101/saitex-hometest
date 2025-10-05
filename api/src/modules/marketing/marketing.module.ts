import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Customer } from './entities/customer.entity'
import { Product } from './entities/product.entity'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { MarketingCampaign } from './entities/campaign.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      Product,
      Order,
      OrderItem,
      MarketingCampaign,
    ]),
  ],
  providers: [],
  exports: [TypeOrmModule],
})
export class MarketingModule {}