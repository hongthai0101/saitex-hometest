import { DataSource } from 'typeorm';
import { Customer } from '../../modules/marketing/entities/customer.entity';
import { Product } from '../../modules/marketing/entities/product.entity';
import { Order } from '../../modules/marketing/entities/order.entity';
import { OrderItem } from '../../modules/marketing/entities/order-item.entity';
import { MarketingCampaign } from '../../modules/marketing/entities/campaign.entity';
import { CampaignMetrics } from '../../modules/marketing/entities/campaign-metrics.entity';

export class MarketingDataSeeder {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 Starting marketing data seeding...');

    try {
      // Clear existing data
      await this.clearData();

      // Seed data in order
      const products = await this.seedProducts();
      const customers = await this.seedCustomers();
      const campaigns = await this.seedCampaigns();
      const orders = await this.seedOrders(customers, products);
      await this.seedCampaignMetrics(campaigns);

      console.log('✅ Marketing data seeding completed successfully!');
      console.log(`📊 Seeded:
        - ${products.length} products
        - ${customers.length} customers
        - ${campaigns.length} campaigns
        - ${orders.length} orders
        - Campaign metrics for 2 years`);
    } catch (error) {
      console.error('❌ Error seeding marketing data:', error);
      throw error;
    }
  }

  private async clearData(): Promise<void> {
    console.log('🧹 Clearing existing marketing data...');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Clear tables in correct order (PostgreSQL handles cascading)
      await queryRunner.query('TRUNCATE TABLE campaign_metrics CASCADE');
      await queryRunner.query('TRUNCATE TABLE order_items CASCADE');
      await queryRunner.query('TRUNCATE TABLE orders CASCADE');
      await queryRunner.query('TRUNCATE TABLE marketing_campaigns CASCADE');
      await queryRunner.query('TRUNCATE TABLE products CASCADE');
      await queryRunner.query('TRUNCATE TABLE customers CASCADE');
    } finally {
      await queryRunner.release();
    }
  }

  private async seedProducts(): Promise<Product[]> {
    console.log('📦 Seeding products...');

    const productRepo = this.dataSource.getRepository(Product);
    const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Automotive', 'Toys'];
    const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Microsoft', 'Canon', 'HP', 'Dell', 'Generic'];

    const products: Partial<Product>[] = [];

    for (let i = 1; i <= 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const basePrice = Math.random() * 500 + 10; // $10 - $510
      const costPrice = basePrice * (0.4 + Math.random() * 0.3); // 40-70% of price

      products.push({
        name: `${brand} ${category} Product ${i}`,
        description: `High quality ${category.toLowerCase()} product from ${brand}. Perfect for everyday use.`,
        sku: `SKU-${category.substring(0,3).toUpperCase()}-${i.toString().padStart(4, '0')}`,
        price: Math.round(basePrice * 100) / 100,
        costPrice: Math.round(costPrice * 100) / 100,
        category,
        brand,
        stockQuantity: Math.floor(Math.random() * 1000) + 50,
        totalSold: Math.floor(Math.random() * 500),
        totalRevenue: 0, // Will be calculated from orders
        rating: Math.round((3 + Math.random() * 2) * 100) / 100, // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 200) + 10,
        isActive: Math.random() > 0.1, // 90% active
        createdAt: this.randomDate(new Date('2022-01-01'), new Date('2024-06-01')),
      });
    }

    return await productRepo.save(products);
  }

  private async seedCustomers(): Promise<Customer[]> {
    console.log('👥 Seeding customers...');

    const customerRepo = this.dataSource.getRepository(Customer);
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Chris', 'Jessica', 'Daniel', 'Ashley', 'Robert', 'Amanda', 'James', 'Lisa', 'William'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
    const countries = ['USA', 'Canada', 'UK', 'Germany', 'France', 'Australia', 'Japan', 'Brazil'];
    const loyaltyTiers = ['bronze', 'silver', 'gold', 'platinum'];

    const customers: Partial<Customer>[] = [];

    for (let i = 1; i <= 200; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const createdDate = this.randomDate(new Date('2022-01-01'), new Date());

      customers.push({
        email,
        firstName,
        lastName,
        phone: Math.random() > 0.3 ? `+1${Math.floor(Math.random() * 9000000000) + 1000000000}` : undefined,
        dateOfBirth: Math.random() > 0.4 ? this.randomDate(new Date('1960-01-01'), new Date('2000-01-01')) : undefined,
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)],
        city: cities[Math.floor(Math.random() * cities.length)],
        country: countries[Math.floor(Math.random() * countries.length)],
        totalSpent: 0, // Will be calculated from orders
        orderCount: 0, // Will be calculated from orders
        lastOrderDate: undefined, // Will be set from orders
        loyaltyTier: loyaltyTiers[Math.floor(Math.random() * loyaltyTiers.length)],
        isActive: Math.random() > 0.05, // 95% active
        createdAt: createdDate,
      });
    }

    return await customerRepo.save(customers);
  }

  private async seedCampaigns(): Promise<MarketingCampaign[]> {
    console.log('📢 Seeding marketing campaigns...');

    const campaignRepo = this.dataSource.getRepository(MarketingCampaign);
    const types = ['email', 'sms', 'social_media', 'display', 'search', 'influencer'];
    const statuses = ['completed', 'active', 'paused'];

    const campaigns: Partial<MarketingCampaign>[] = [];

    for (let i = 1; i <= 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const startDate = this.randomDate(new Date('2022-01-01'), new Date('2024-10-01'));
      const endDate = new Date(startDate.getTime() + (Math.random() * 90 + 7) * 24 * 60 * 60 * 1000); // 7-97 days
      const budget = Math.round((Math.random() * 50000 + 1000) * 100) / 100; // $1K - $51K
      const spentAmount = budget * (0.7 + Math.random() * 0.3); // 70-100% of budget

      campaigns.push({
        name: `${type.replace('_', ' ').toUpperCase()} Campaign ${i}`,
        description: `Strategic ${type} marketing campaign to drive engagement and conversions.`,
        type,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        startDate,
        endDate,
        budget,
        spentAmount: Math.round(spentAmount * 100) / 100,
        impressions: Math.floor(Math.random() * 1000000) + 10000,
        clicks: Math.floor(Math.random() * 50000) + 100,
        conversions: Math.floor(Math.random() * 1000) + 10,
        revenue: Math.round((Math.random() * 100000 + 5000) * 100) / 100,
        clickThroughRate: Math.round((Math.random() * 0.05 + 0.005) * 10000) / 10000, // 0.5-5.5%
        conversionRate: Math.round((Math.random() * 0.1 + 0.01) * 10000) / 10000, // 1-11%
        costPerClick: Math.round((Math.random() * 5 + 0.5) * 100) / 100,
        costPerAcquisition: Math.round((Math.random() * 100 + 10) * 100) / 100,
        returnOnAdSpend: Math.round((Math.random() * 5 + 1) * 100) / 100,
        targetAudience: 'Adults 25-54, interested in technology and lifestyle products',
        metadata: {
          objective: 'Brand awareness and lead generation',
          platforms: type === 'social_media' ? ['Facebook', 'Instagram', 'Twitter'] : [type],
        },
        createdAt: startDate,
      });
    }

    return await campaignRepo.save(campaigns);
  }

  private async seedOrders(customers: Customer[], products: Product[]): Promise<Order[]> {
    console.log('🛒 Seeding orders and order items...');

    const orderRepo = this.dataSource.getRepository(Order);
    const orderItemRepo = this.dataSource.getRepository(OrderItem);
    const customerRepo = this.dataSource.getRepository(Customer);
    const productRepo = this.dataSource.getRepository(Product);

    const statuses = ['delivered', 'shipped', 'confirmed'];
    const paymentMethods = ['card', 'paypal', 'bank_transfer'];
    const paymentStatuses = ['paid', 'paid', 'paid', 'refunded']; // Mostly paid

    const orders: Order[] = [];
    const allOrderItems: OrderItem[] = [];

    // Generate orders across 2+ years with seasonal patterns
    for (let i = 1; i <= 800; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderDate = this.randomDate(new Date('2022-01-01'), new Date());

      // Seasonal boost (Nov-Dec get more orders)
      const month = orderDate.getMonth();
      const seasonalBoost = (month === 10 || month === 11) ? 1.5 : 1;

      const itemCount = Math.floor(Math.random() * 4 + 1); // 1-4 items per order
      const orderItems: Partial<OrderItem>[] = [];
      let subtotal = 0;

      // Create order items
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3 + 1);
        const unitPrice = product.price * (0.9 + Math.random() * 0.2); // ±10% price variation
        const totalPrice = quantity * unitPrice;

        orderItems.push({
          productId: product.id,
          quantity,
          unitPrice: Math.round(unitPrice * 100) / 100,
          totalPrice: Math.round(totalPrice * 100) / 100,
          discountAmount: Math.random() > 0.8 ? Math.round(totalPrice * 0.1 * 100) / 100 : 0,
        });

        subtotal += totalPrice;
      }

      const discountAmount = Math.random() > 0.7 ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
      const taxAmount = Math.round((subtotal - discountAmount) * 0.08 * 100) / 100;
      const shippingAmount = subtotal > 50 ? 0 : 9.99;
      const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

      const orderData = {
        customerId: customer.id,
        orderNumber: `ORD-${orderDate.getFullYear()}-${i.toString().padStart(6, '0')}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        subtotalAmount: Math.round(subtotal * 100) / 100,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
        shippingAddress: `${Math.floor(Math.random() * 9999) + 1} Main St, ${customer.city}, ${customer.country}`,
        couponCode: Math.random() > 0.8 ? 'SAVE10' : undefined,
        notes: Math.random() > 0.9 ? 'Please handle with care' : undefined,
        createdAt: orderDate,
        updatedAt: orderDate,
      };

      const order = await orderRepo.save(orderData);

      orders.push(order);

      // Save order items
      for (const item of orderItems) {
        const orderItem = await orderItemRepo.save({
          ...item,
          orderId: order.id,
        });
        allOrderItems.push(orderItem);
      }
    }

    // Update customer totals and product sales
    console.log('📊 Updating customer and product statistics...');

    // Update customers
    for (const customer of customers) {
      const customerOrders = orders.filter(o => o.customerId === customer.id);
      const totalSpent = customerOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const lastOrder = customerOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

      await customerRepo.update(customer.id, {
        totalSpent: Math.round(totalSpent * 100) / 100,
        orderCount: customerOrders.length,
        lastOrderDate: lastOrder?.createdAt || null,
      });
    }

    // Update products
    for (const product of products) {
      const productItems = allOrderItems.filter(item => item.productId === product.id);
      const totalSold = productItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = productItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);

      await productRepo.update(product.id, {
        totalSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      });
    }

    return orders;
  }

  private async seedCampaignMetrics(campaigns: MarketingCampaign[]): Promise<void> {
    console.log('📈 Seeding campaign metrics...');

    const metricsRepo = this.dataSource.getRepository(CampaignMetrics);
    const platforms = ['Facebook', 'Google Ads', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'];

    const metrics: Partial<CampaignMetrics>[] = [];

    for (const campaign of campaigns) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const startDate = new Date(campaign.startDate);
      const endDate = new Date(campaign.endDate);

      // Generate daily metrics for campaign duration
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dailyImpressions = Math.floor(campaign.impressions / this.daysBetween(startDate, endDate) * (0.5 + Math.random()));
        const dailyClicks = Math.floor(dailyImpressions * campaign.clickThroughRate * (0.5 + Math.random()));
        const dailySpend = campaign.spentAmount / this.daysBetween(startDate, endDate) * (0.5 + Math.random());
        const dailyConversions = Math.floor(dailyClicks * campaign.conversionRate * (0.5 + Math.random()));

        metrics.push({
          campaignId: campaign.id,
          date: new Date(date),
          platform,
          impressions: dailyImpressions,
          clicks: dailyClicks,
          ctr: dailyClicks / dailyImpressions || 0,
          spend: Math.round(dailySpend * 100) / 100,
          cpc: dailyClicks > 0 ? Math.round((dailySpend / dailyClicks) * 100) / 100 : 0,
          cpm: Math.round((dailySpend / dailyImpressions * 1000) * 100) / 100,
          conversions: dailyConversions,
          conversionValue: Math.round(dailyConversions * (50 + Math.random() * 200) * 100) / 100,
          conversionRate: dailyClicks > 0 ? dailyConversions / dailyClicks : 0,
          costPerConversion: dailyConversions > 0 ? Math.round((dailySpend / dailyConversions) * 100) / 100 : 0,
          roas: Math.round((2 + Math.random() * 3) * 100) / 100, // 2-5x ROAS
          videoViews: Math.floor(dailyImpressions * (0.1 + Math.random() * 0.3)),
          likes: Math.floor(dailyClicks * (0.05 + Math.random() * 0.15)),
          shares: Math.floor(dailyClicks * (0.01 + Math.random() * 0.05)),
          comments: Math.floor(dailyClicks * (0.005 + Math.random() * 0.02)),
          saves: Math.floor(dailyClicks * (0.02 + Math.random() * 0.08)),
          reach: Math.floor(dailyImpressions * (0.7 + Math.random() * 0.3)),
          frequency: Math.round((1 + Math.random() * 2) * 100) / 100,
          uniqueClicks: Math.floor(dailyClicks * (0.8 + Math.random() * 0.2)),
          qualityScore: Math.round((7 + Math.random() * 3) * 100) / 100, // 7-10
          relevanceScore: Math.round((6 + Math.random() * 4) * 100) / 100, // 6-10
          platformSpecificMetrics: {
            adFormat: platform === 'Facebook' ? ['image', 'video', 'carousel'][Math.floor(Math.random() * 3)] : 'text',
            placement: platform === 'Google Ads' ? 'search' : 'feed',
          },
          cpuv: Math.round((dailySpend / Math.max(1, Math.floor(dailyImpressions * 0.2))) * 100) / 100,
          cpe: Math.round((dailySpend / Math.max(1, dailyClicks + Math.floor(dailyClicks * 0.1))) * 100) / 100,
          createdAt: new Date(date),
          updatedAt: new Date(date),
        });
      }
    }

    // Save in batches for better performance
    const batchSize = 100;
    for (let i = 0; i < metrics.length; i += batchSize) {
      const batch = metrics.slice(i, i + batchSize);
      await metricsRepo.save(batch);
    }
  }

  private randomDate(start: Date, end: Date): Date {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const randomTime = startTime + Math.random() * (endTime - startTime);
    return new Date(randomTime);
  }

  private daysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}