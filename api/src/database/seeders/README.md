# Database Seeders

This directory contains database seeders for populating the marketing database with test data for the insight module.

## Overview

The marketing data seeder creates comprehensive test data including:

- **100 Products** - Various categories, brands, and price ranges
- **200 Customers** - With realistic demographics and loyalty tiers
- **50 Marketing Campaigns** - Different types (email, social media, search, etc.)
- **800+ Orders** - Spanning 2+ years with seasonal patterns
- **Daily Campaign Metrics** - Detailed performance data for each campaign

## Total Records

The seeder creates approximately **1,000+ records** across all tables:

- 100 products
- 200 customers
- 50 campaigns
- 800 orders
- 2,000+ order items
- 3,000+ campaign metrics (daily data)

## Data Characteristics

### Time Range
- **Start Date**: January 1, 2022
- **End Date**: Current date
- **Pattern**: Realistic seasonal patterns with higher activity in Nov-Dec

### Products
- 8 categories: Electronics, Clothing, Home & Garden, Sports, Books, Beauty, Automotive, Toys
- 10 brands: Apple, Samsung, Nike, Adidas, Sony, Microsoft, Canon, HP, Dell, Generic
- Price range: $10 - $510
- Cost margins: 40-70% of selling price

### Customers
- Realistic names, emails, phone numbers
- Demographics: Age, gender, location
- Loyalty tiers: Bronze, Silver, Gold, Platinum
- Purchase history and spending patterns

### Orders
- Realistic order patterns across seasons
- 1-4 items per order
- Various payment methods and statuses
- Shipping, tax, and discount calculations

### Campaigns
- 6 types: email, sms, social_media, display, search, influencer
- Budgets: $1K - $51K
- Performance metrics: CTR, conversion rates, ROAS
- Daily performance tracking

## Running the Seeders

### Prerequisites

1. Make sure your database is set up and migrations are run:
```bash
npm run typeorm migration:run
```

2. Set up your environment variables in `.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=saitex_db
```

### Run the Seeder

```bash
# Run all marketing data seeders
npm run seed
```

This will:
1. Clear existing marketing data
2. Seed products, customers, and campaigns
3. Generate orders with realistic patterns
4. Create campaign metrics with daily data
5. Update calculated fields (customer totals, product sales)

### Expected Output

```
🚀 Starting database seeding process...
✅ Database connection established
🌱 Starting marketing data seeding...
🧹 Clearing existing marketing data...
📦 Seeding products...
👥 Seeding customers...
📢 Seeding marketing campaigns...
🛒 Seeding orders and order items...
📊 Updating customer and product statistics...
📈 Seeding campaign metrics...
✅ Marketing data seeding completed successfully!
📊 Seeded:
  - 100 products
  - 200 customers
  - 50 campaigns
  - 800 orders
  - Campaign metrics for 2 years
🎉 All seeders completed successfully!
🔌 Database connection closed
```

## Data Quality

The seeded data includes:

### Realistic Patterns
- Seasonal sales spikes in November-December
- Weekday vs weekend order patterns
- Customer purchase behavior based on loyalty tiers
- Product performance variation by category

### Business Intelligence Ready
- Complete customer journey data
- Product performance metrics
- Campaign attribution data
- Revenue and profitability tracking
- Time-series data for trend analysis

### AI-Friendly Data
- Rich metadata for natural language queries
- Structured relationships for joins
- Balanced data distribution
- Realistic business scenarios

## Sample Queries

After seeding, you can test the insight module with queries like:

```sql
-- Top selling products
SELECT name, total_sold, total_revenue FROM products ORDER BY total_sold DESC LIMIT 10;

-- Customer loyalty distribution
SELECT loyalty_tier, COUNT(*) FROM customers GROUP BY loyalty_tier;

-- Monthly sales trends
SELECT DATE_TRUNC('month', created_at) as month, SUM(total_amount) as revenue
FROM orders GROUP BY month ORDER BY month;

-- Campaign performance
SELECT name, type, impressions, clicks, conversions, return_on_ad_spend
FROM marketing_campaigns ORDER BY return_on_ad_spend DESC;
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your `.env` file configuration
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Migration Required**
   ```bash
   npm run typeorm migration:run
   ```

3. **Permission Issues**
   - Ensure database user has CREATE, INSERT, DELETE permissions
   - Check TRUNCATE permissions for clearing data

4. **Memory Issues**
   - The seeder uses batch processing for large datasets
   - If you encounter memory issues, reduce batch sizes in the seeder

### Re-running Seeders

The seeder will automatically clear existing marketing data before inserting new data. It's safe to run multiple times.

## Customization

To modify the seeded data:

1. **Change quantities**: Edit the loop counts in `marketing-data.seeder.ts`
2. **Adjust date ranges**: Modify `randomDate()` calls
3. **Add new categories**: Update the arrays in seed methods
4. **Custom patterns**: Modify the business logic in seed methods

## File Structure

```
seeders/
├── README.md                    # This file
├── marketing-data.seeder.ts     # Main seeder class
└── run-seeders.ts              # Seeder execution script
```

The seeder is modular and follows best practices:
- Proper error handling
- Transaction safety
- Batch processing for performance
- Realistic data generation
- Comprehensive logging