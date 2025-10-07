import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingCampaign } from '../entities/campaign.entity';
import { CampaignMetrics } from '../entities/campaign-metrics.entity';
import { Customer } from '../entities/customer.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class SeedingService {
  constructor(
    @InjectRepository(MarketingCampaign)
    private campaignRepository: Repository<MarketingCampaign>,
    @InjectRepository(CampaignMetrics)
    private metricsRepository: Repository<CampaignMetrics>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async truncateAll(): Promise<void> {
    // Truncate in correct order (child tables first)
    // Use query builder to delete all without criteria
    await this.orderItemRepository.createQueryBuilder().delete().execute();
    await this.orderRepository.createQueryBuilder().delete().execute();
    await this.metricsRepository.createQueryBuilder().delete().execute();
    await this.campaignRepository.createQueryBuilder().delete().execute();
    await this.productRepository.createQueryBuilder().delete().execute();
    await this.customerRepository.createQueryBuilder().delete().execute();
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number, decimals = 2): number {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    );
  }

  async seedData(): Promise<void> {
    // Define time range: 2 years back from now
    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);

    const productNames = [
      'Premium T-Shirt',
      'Classic Jeans',
      'Running Shoes',
      'Leather Jacket',
      'Cotton Hoodie',
      'Sports Cap',
      'Denim Shorts',
      'Winter Coat',
      'Sneakers',
      'Backpack',
    ];
    const categories = ['Apparel', 'Footwear', 'Accessories', 'Outerwear'];

    // Seed 50 products - spread over 2 years
    const products: any[] = [];
    for (let i = 0; i < 50; i++) {
      products.push({
        name: `${productNames[i % productNames.length]} ${i + 1}`,
        sku: `SKU-${String(i + 1).padStart(4, '0')}`,
        price: this.randomFloat(19.99, 199.99),
        category: categories[i % categories.length],
        stock: this.randomInt(10, 500),
        createdAt: this.randomDate(twoYearsAgo, now),
      });
    }
    const savedProducts = await this.productRepository.save(products);

    // Seed 100 customers
    const firstNames = [
      'John',
      'Jane',
      'Michael',
      'Sarah',
      'David',
      'Emma',
      'Robert',
      'Lisa',
      'William',
      'Jennifer',
    ];
    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
    ];
    const cities = [
      'New York',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
    ];
    const countries = ['USA', 'Canada', 'UK', 'Australia'];

    // Seed 100 customers - spread over 2 years
    const customers: any[] = [];
    for (let i = 0; i < 100; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      customers.push({
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
        firstName,
        lastName,
        phone: `+1${this.randomInt(1000000000, 9999999999)}`,
        city: cities[i % cities.length],
        country: countries[i % countries.length],
        createdAt: this.randomDate(twoYearsAgo, now),
      });
    }
    const savedCustomers = await this.customerRepository.save(customers);

    // Seed 20 campaigns
    const campaignTypes = [
      'search',
      'display',
      'social_media',
      'email',
      'influencer',
      'sms',
    ];
    const platforms = [
      'google_ads',
      'facebook_ads',
      'instagram',
      'twitter',
      'linkedin',
      'tiktok',
    ];
    const statuses = ['active', 'paused', 'completed', 'draft'];
    const objectives = [
      'conversions',
      'traffic',
      'brand_awareness',
      'engagement',
      'lead_generation',
      'reach',
    ];

    // Seed 20 campaigns - spread over 2 years
    const campaigns: MarketingCampaign[] = [];

    for (let i = 0; i < 20; i++) {
      // Random start date within the 2-year period
      const campaignStart = this.randomDate(twoYearsAgo, now);
      const campaignEnd = new Date(campaignStart);
      campaignEnd.setDate(campaignEnd.getDate() + this.randomInt(30, 180));

      const createdAt = new Date(campaignStart);
      createdAt.setDate(createdAt.getDate() - this.randomInt(1, 30)); // Created before start date

      const campaign = this.campaignRepository.create({
        name: `Campaign ${i + 1} - ${objectives[i % objectives.length]}`,
        type: campaignTypes[i % campaignTypes.length],
        platform: platforms[i % platforms.length],
        status: statuses[i % statuses.length],
        budget: this.randomFloat(1000, 50000),
        startDate: campaignStart,
        endDate: campaignEnd,
        objective: objectives[i % objectives.length] as any,
        createdAt: createdAt,
      });
      campaigns.push(campaign);
    }
    const savedCampaigns = await this.campaignRepository.save(campaigns);

    // Seed 400 campaign metrics (20 campaigns x 20 days each) - with realistic dates
    const metrics: any[] = [];
    for (const campaign of savedCampaigns) {
      // Calculate the campaign duration
      const startTime = new Date(campaign.startDate).getTime();
      const endTime = new Date(campaign.endDate).getTime();
      const durationDays = Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));

      // Generate metrics for up to 20 days or campaign duration, whichever is smaller
      const metricDays = Math.min(20, durationDays);

      for (let day = 0; day < metricDays; day++) {
        const metricDate = new Date(campaign.startDate);
        metricDate.setDate(metricDate.getDate() + day);

        const impressions = this.randomInt(5000, 50000);
        const clicks = this.randomInt(100, 2000);
        const conversions = this.randomInt(5, 100);
        const spend = this.randomFloat(50, 1000);
        const conversionValue = this.randomFloat(
          conversions * 20,
          conversions * 100,
        );
        const ctr = (clicks / impressions) * 100;
        const cpc = spend / clicks;
        const roas = conversionValue / spend;

        const createdAt = new Date(metricDate);
        createdAt.setHours(23, 59, 59); // Metrics created at end of day

        metrics.push({
          campaign: campaign,
          campaignId: campaign.id,
          date: metricDate,
          platform: campaign.platform,
          impressions,
          clicks,
          conversions,
          spend,
          conversionValue,
          ctr: parseFloat(ctr.toFixed(4)),
          cpc: parseFloat(cpc.toFixed(2)),
          roas: parseFloat(roas.toFixed(2)),
          reach: this.randomInt(Math.floor(impressions * 0.6), Math.floor(impressions * 0.9)),
          videoViews: this.randomInt(0, Math.floor(clicks * 0.8)),
          likes: this.randomInt(0, Math.floor(clicks * 0.3)),
          shares: this.randomInt(0, Math.floor(clicks * 0.1)),
          comments: this.randomInt(0, Math.floor(clicks * 0.15)),
          createdAt: createdAt,
        });
      }
    }
    await this.metricsRepository.save(metrics);

    // Seed 300 orders - spread over 2 years
    const orderStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    const paymentMethods = ['card', 'cash', 'bank_transfer', 'paypal', 'crypto'];
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const orders: any[] = [];

    for (let i = 0; i < 300; i++) {
      const customer = savedCustomers[i % savedCustomers.length];

      // Orders should be after customer creation
      const customerCreatedAt = new Date(customer.createdAt);
      const orderDate = this.randomDate(customerCreatedAt, now);

      const subtotal = this.randomFloat(50, 1000);
      const tax = this.randomFloat(subtotal * 0.05, subtotal * 0.1);
      const shipping = this.randomFloat(5, 20);
      const discount = this.randomFloat(0, subtotal * 0.2);
      const total = subtotal + tax + shipping - discount;

      orders.push({
        customer: customer,
        orderNumber: `ORD-${String(i + 1).padStart(6, '0')}`,
        status: orderStatuses[i % orderStatuses.length],
        subtotalAmount: subtotal,
        taxAmount: tax,
        shippingAmount: shipping,
        discountAmount: discount,
        totalAmount: total,
        paymentMethod: paymentMethods[i % paymentMethods.length],
        paymentStatus: paymentStatuses[i % paymentStatuses.length],
        createdAt: orderDate,
      });
    }
    const savedOrders = await this.orderRepository.save(orders);

    // Seed 600 order items (2 items per order average)
    const orderItems: any[] = [];
    for (const order of savedOrders) {
      const numItems = this.randomInt(1, 4);
      for (let i = 0; i < numItems; i++) {
        const product = savedProducts[this.randomInt(0, savedProducts.length - 1)];
        const quantity = this.randomInt(1, 5);
        const unitPrice = product.price;
        const totalPrice = quantity * unitPrice;

        orderItems.push({
          order: order,
          product: product,
          quantity,
          unitPrice,
          totalPrice,
        });
      }
    }
    await this.orderItemRepository.save(orderItems);
  }

  async runSeed(): Promise<{ message: string; count: number }> {
    // Truncate all tables
    await this.truncateAll();

    // Seed new data
    await this.seedData();

    // Count seeded records
    const counts = {
      products: await this.productRepository.count(),
      customers: await this.customerRepository.count(),
      campaigns: await this.campaignRepository.count(),
      metrics: await this.metricsRepository.count(),
      orders: await this.orderRepository.count(),
      orderItems: await this.orderItemRepository.count(),
    };

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

    return {
      message: 'Database seeded successfully',
      count: totalCount,
    };
  }
}
