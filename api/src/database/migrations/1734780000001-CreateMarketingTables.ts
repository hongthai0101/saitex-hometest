import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class CreateMarketingTables1734780000001 implements MigrationInterface {
  name = 'CreateMarketingTables1734780000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customers table
    await queryRunner.createTable(
      new Table({
        name: 'customers',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'enum',
            enum: ['male', 'female', 'other'],
            isNullable: true,
          },
          {
            name: 'city',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'country',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'total_spent',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: '0',
          },
          {
            name: 'order_count',
            type: 'integer',
            default: '0',
          },
          {
            name: 'last_order_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'loyalty_tier',
            type: 'enum',
            enum: ['bronze', 'silver', 'gold', 'platinum'],
            default: "'bronze'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    )

    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sku',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'cost_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'brand',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'stock_quantity',
            type: 'integer',
            default: '0',
          },
          {
            name: 'total_sold',
            type: 'integer',
            default: '0',
          },
          {
            name: 'total_revenue',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: '0',
          },
          {
            name: 'rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: '0',
          },
          {
            name: 'review_count',
            type: 'integer',
            default: '0',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    )

    // Create marketing_campaigns table
    await queryRunner.createTable(
      new Table({
        name: 'marketing_campaigns',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['email', 'sms', 'social_media', 'display', 'search', 'influencer'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
            default: "'draft'",
          },
          {
            name: 'start_date',
            type: 'date',
          },
          {
            name: 'end_date',
            type: 'date',
          },
          {
            name: 'budget',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: '0',
          },
          {
            name: 'spent_amount',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: '0',
          },
          {
            name: 'impressions',
            type: 'integer',
            default: '0',
          },
          {
            name: 'clicks',
            type: 'integer',
            default: '0',
          },
          {
            name: 'conversions',
            type: 'integer',
            default: '0',
          },
          {
            name: 'revenue',
            type: 'decimal',
            precision: 12,
            scale: 2,
            default: '0',
          },
          {
            name: 'click_through_rate',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: '0',
          },
          {
            name: 'conversion_rate',
            type: 'decimal',
            precision: 5,
            scale: 4,
            default: '0',
          },
          {
            name: 'cost_per_click',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'cost_per_acquisition',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'return_on_ad_spend',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: '0',
          },
          {
            name: 'target_audience',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true,
    )

    // Create orders table
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'customer_id',
            type: 'uuid',
          },
          {
            name: 'order_number',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'subtotal_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'tax_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'shipping_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'total_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'payment_method',
            type: 'enum',
            enum: ['card', 'cash', 'bank_transfer', 'paypal', 'crypto'],
          },
          {
            name: 'payment_status',
            type: 'enum',
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: "'pending'",
          },
          {
            name: 'shipping_address',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'coupon_code',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    )

    // Create order_items table
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'order_id',
            type: 'uuid',
          },
          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'quantity',
            type: 'integer',
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
        ],
      }),
      true,
    )

    // Create campaign_metrics table
    await queryRunner.createTable(
      new Table({
        name: 'campaign_metrics',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'campaign_id',
            type: 'uuid',
          },
          {
            name: 'date',
            type: 'date',
          },
          {
            name: 'platform',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'impressions',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'clicks',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'ctr',
            type: 'decimal',
            precision: 10,
            scale: 4,
            default: '0',
          },
          {
            name: 'spend',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: '0',
          },
          {
            name: 'cpc',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'cpm',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'conversions',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'conversionValue',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: '0',
          },
          {
            name: 'conversionRate',
            type: 'decimal',
            precision: 10,
            scale: 4,
            default: '0',
          },
          {
            name: 'costPerConversion',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'roas',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'videoViews',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'likes',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'shares',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'comments',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'saves',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'reach',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'frequency',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'uniqueClicks',
            type: 'bigint',
            default: '0',
          },
          {
            name: 'qualityScore',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'relevanceScore',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'platformSpecificMetrics',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'cpuv',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'cpe',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: '0',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    )

    // Create foreign key constraints
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['customer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'customers',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.createForeignKey(
      'campaign_metrics',
      new TableForeignKey({
        columnNames: ['campaign_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'marketing_campaigns',
        onDelete: 'CASCADE',
      }),
    )

    // Create indexes for better performance
    await queryRunner.createIndex(
      'customers',
      new TableIndex({ name: 'IDX_customers_email', columnNames: ['email'] }),
    )

    await queryRunner.createIndex(
      'customers',
      new TableIndex({ name: 'IDX_customers_loyalty_tier', columnNames: ['loyalty_tier'] }),
    )

    await queryRunner.createIndex(
      'customers',
      new TableIndex({ name: 'IDX_customers_is_active', columnNames: ['is_active'] }),
    )

    await queryRunner.createIndex(
      'customers',
      new TableIndex({ name: 'IDX_customers_created_at', columnNames: ['created_at'] }),
    )

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_sku', columnNames: ['sku'] }),
    )

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_category', columnNames: ['category'] }),
    )

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_brand', columnNames: ['brand'] }),
    )

    await queryRunner.createIndex(
      'products',
      new TableIndex({ name: 'IDX_products_is_active', columnNames: ['is_active'] }),
    )

    await queryRunner.createIndex(
      'marketing_campaigns',
      new TableIndex({ name: 'IDX_campaigns_type', columnNames: ['type'] }),
    )

    await queryRunner.createIndex(
      'marketing_campaigns',
      new TableIndex({ name: 'IDX_campaigns_status', columnNames: ['status'] }),
    )

    await queryRunner.createIndex(
      'marketing_campaigns',
      new TableIndex({ name: 'IDX_campaigns_platform', columnNames: ['platform'] }),
    )

    await queryRunner.createIndex(
      'marketing_campaigns',
      new TableIndex({ name: 'IDX_campaigns_user_id', columnNames: ['user_id'] }),
    )

    await queryRunner.createIndex(
      'marketing_campaigns',
      new TableIndex({ name: 'IDX_campaigns_external_id', columnNames: ['external_id'] }),
    )

    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_customer_id', columnNames: ['customer_id'] }),
    )

    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_order_number', columnNames: ['order_number'] }),
    )

    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_status', columnNames: ['status'] }),
    )

    await queryRunner.createIndex(
      'orders',
      new TableIndex({ name: 'IDX_orders_created_at', columnNames: ['created_at'] }),
    )

    await queryRunner.createIndex(
      'order_items',
      new TableIndex({ name: 'IDX_order_items_order_id', columnNames: ['order_id'] }),
    )

    await queryRunner.createIndex(
      'order_items',
      new TableIndex({ name: 'IDX_order_items_product_id', columnNames: ['product_id'] }),
    )

    await queryRunner.createIndex(
      'campaign_metrics',
      new TableIndex({ name: 'IDX_campaign_metrics_campaign_id', columnNames: ['campaign_id'] }),
    )

    await queryRunner.createIndex(
      'campaign_metrics',
      new TableIndex({ name: 'IDX_campaign_metrics_date', columnNames: ['date'] }),
    )

    await queryRunner.createIndex(
      'campaign_metrics',
      new TableIndex({ name: 'IDX_campaign_metrics_platform', columnNames: ['platform'] }),
    )

    await queryRunner.createIndex(
      'campaign_metrics',
      new TableIndex({ name: 'IDX_campaign_metrics_campaign_date', columnNames: ['campaign_id', 'date'] }),
    )

    // Create unique constraint for campaign metrics (one record per campaign per day)
    await queryRunner.createIndex(
      'campaign_metrics',
      new TableIndex({
        name: 'IDX_campaign_metrics_unique',
        columnNames: ['campaign_id', 'date'],
        isUnique: true
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('campaign_metrics', 'IDX_campaign_metrics_unique')
    await queryRunner.dropIndex('campaign_metrics', 'IDX_campaign_metrics_campaign_date')
    await queryRunner.dropIndex('campaign_metrics', 'IDX_campaign_metrics_platform')
    await queryRunner.dropIndex('campaign_metrics', 'IDX_campaign_metrics_date')
    await queryRunner.dropIndex('campaign_metrics', 'IDX_campaign_metrics_campaign_id')
    await queryRunner.dropIndex('order_items', 'IDX_order_items_product_id')
    await queryRunner.dropIndex('order_items', 'IDX_order_items_order_id')
    await queryRunner.dropIndex('orders', 'IDX_orders_created_at')
    await queryRunner.dropIndex('orders', 'IDX_orders_status')
    await queryRunner.dropIndex('orders', 'IDX_orders_order_number')
    await queryRunner.dropIndex('orders', 'IDX_orders_customer_id')
    await queryRunner.dropIndex('marketing_campaigns', 'IDX_campaigns_external_id')
    await queryRunner.dropIndex('marketing_campaigns', 'IDX_campaigns_user_id')
    await queryRunner.dropIndex('marketing_campaigns', 'IDX_campaigns_platform')
    await queryRunner.dropIndex('marketing_campaigns', 'IDX_campaigns_status')
    await queryRunner.dropIndex('marketing_campaigns', 'IDX_campaigns_type')
    await queryRunner.dropIndex('products', 'IDX_products_is_active')
    await queryRunner.dropIndex('products', 'IDX_products_brand')
    await queryRunner.dropIndex('products', 'IDX_products_category')
    await queryRunner.dropIndex('products', 'IDX_products_sku')
    await queryRunner.dropIndex('customers', 'IDX_customers_created_at')
    await queryRunner.dropIndex('customers', 'IDX_customers_is_active')
    await queryRunner.dropIndex('customers', 'IDX_customers_loyalty_tier')
    await queryRunner.dropIndex('customers', 'IDX_customers_email')

    // Drop foreign keys
    const campaignMetricsTable = await queryRunner.getTable('campaign_metrics')
    if (campaignMetricsTable) {
      const campaignForeignKey = campaignMetricsTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('campaign_id') !== -1
      )
      if (campaignForeignKey) {
        await queryRunner.dropForeignKey('campaign_metrics', campaignForeignKey)
      }
    }

    const orderItemsTable = await queryRunner.getTable('order_items')
    if (orderItemsTable) {
      const orderForeignKey = orderItemsTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('order_id') !== -1
      )
      if (orderForeignKey) {
        await queryRunner.dropForeignKey('order_items', orderForeignKey)
      }

      const productForeignKey = orderItemsTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('product_id') !== -1
      )
      if (productForeignKey) {
        await queryRunner.dropForeignKey('order_items', productForeignKey)
      }
    }

    const ordersTable = await queryRunner.getTable('orders')
    if (ordersTable) {
      const customerForeignKey = ordersTable.foreignKeys.find(
        fk => fk.columnNames.indexOf('customer_id') !== -1
      )
      if (customerForeignKey) {
        await queryRunner.dropForeignKey('orders', customerForeignKey)
      }
    }

    // Drop tables in reverse order
    await queryRunner.dropTable('campaign_metrics')
    await queryRunner.dropTable('order_items')
    await queryRunner.dropTable('orders')
    await queryRunner.dropTable('marketing_campaigns')
    await queryRunner.dropTable('products')
    await queryRunner.dropTable('customers')
  }
}