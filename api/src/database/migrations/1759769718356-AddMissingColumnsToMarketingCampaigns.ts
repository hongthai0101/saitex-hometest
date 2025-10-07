import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMissingColumnsToMarketingCampaigns1759769718356 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and add daily_budget column
        const hasDailyBudget = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='marketing_campaigns' AND column_name='daily_budget'
        `);
        if (hasDailyBudget.length === 0) {
            await queryRunner.addColumn('marketing_campaigns', new TableColumn({
                name: 'daily_budget',
                type: 'decimal',
                precision: 10,
                scale: 2,
                isNullable: true,
            }));
        }

        // Check and add targeting column
        const hasTargeting = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='marketing_campaigns' AND column_name='targeting'
        `);
        if (hasTargeting.length === 0) {
            await queryRunner.addColumn('marketing_campaigns', new TableColumn({
                name: 'targeting',
                type: 'jsonb',
                isNullable: true,
            }));
        }

        // Check and add creative_assets column
        const hasCreativeAssets = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='marketing_campaigns' AND column_name='creative_assets'
        `);
        if (hasCreativeAssets.length === 0) {
            await queryRunner.addColumn('marketing_campaigns', new TableColumn({
                name: 'creative_assets',
                type: 'jsonb',
                isNullable: true,
            }));
        }

        // Check and add platform_specific_data column
        const hasPlatformSpecificData = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='marketing_campaigns' AND column_name='platform_specific_data'
        `);
        if (hasPlatformSpecificData.length === 0) {
            await queryRunner.addColumn('marketing_campaigns', new TableColumn({
                name: 'platform_specific_data',
                type: 'jsonb',
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('marketing_campaigns', 'platform_specific_data');
        await queryRunner.dropColumn('marketing_campaigns', 'creative_assets');
        await queryRunner.dropColumn('marketing_campaigns', 'targeting');
        await queryRunner.dropColumn('marketing_campaigns', 'daily_budget');
    }

}
