import { DataSource } from 'typeorm';
import { MarketingDataSeeder } from './marketing-data.seeder';

// Import entities
import { Customer } from '../../modules/marketing/entities/customer.entity';
import { Product } from '../../modules/marketing/entities/product.entity';
import { Order } from '../../modules/marketing/entities/order.entity';
import { OrderItem } from '../../modules/marketing/entities/order-item.entity';
import { MarketingCampaign } from '../../modules/marketing/entities/campaign.entity';
import { CampaignMetrics } from '../../modules/marketing/entities/campaign-metrics.entity';
import { Conversation } from '../../modules/insight/entities/conversation.entity';
import { Message } from '../../modules/insight/entities/message.entity';

import dotenv from 'dotenv';
dotenv.config();

async function runSeeders() {
  console.log('🚀 Starting database seeding process...');

  // Create DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'saitex_db',
    entities: [
      Customer,
      Product,
      Order,
      OrderItem,
      MarketingCampaign,
      CampaignMetrics,
      Conversation,
      Message,
    ],
    synchronize: false,
    logging: false,
  });

  try {
    // Initialize connection
    await dataSource.initialize();
    console.log('✅ Database connection established');

    // Run marketing data seeder
    const marketingSeeder = new MarketingDataSeeder(dataSource);
    await marketingSeeder.run();

    console.log('🎉 All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeders:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runSeeders();
}

export { runSeeders };