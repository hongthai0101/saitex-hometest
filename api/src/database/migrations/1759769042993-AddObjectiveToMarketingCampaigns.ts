import { MigrationInterface, QueryRunner } from "typeorm";

export class AddObjectiveToMarketingCampaigns1759769042993 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if column exists
        const hasColumn = await queryRunner.query(`
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name='marketing_campaigns'
            AND column_name='objective'
        `);

        if (hasColumn.length > 0) {
            // Column exists, check if enum type exists
            const hasEnum = await queryRunner.query(`
                SELECT typname
                FROM pg_type
                WHERE typname = 'marketing_campaigns_objective_enum'
            `);

            if (hasEnum.length === 0) {
                // Enum doesn't exist, create it and change column type
                await queryRunner.query(`
                    CREATE TYPE "marketing_campaigns_objective_enum" AS ENUM (
                        'traffic',
                        'brand_awareness',
                        'conversions',
                        'catalog_sales',
                        'video_views',
                        'messages',
                        'store_traffic',
                        'reach',
                        'engagement',
                        'app_installs',
                        'lead_generation'
                    )
                `);

                await queryRunner.query(`
                    ALTER TABLE "marketing_campaigns"
                    ALTER COLUMN "objective" TYPE "marketing_campaigns_objective_enum"
                    USING "objective"::text::"marketing_campaigns_objective_enum"
                `);
            }
        } else {
            // Column doesn't exist, create enum and column
            await queryRunner.query(`
                CREATE TYPE "marketing_campaigns_objective_enum" AS ENUM (
                    'traffic',
                    'brand_awareness',
                    'conversions',
                    'catalog_sales',
                    'video_views',
                    'messages',
                    'store_traffic',
                    'reach',
                    'engagement',
                    'app_installs',
                    'lead_generation'
                )
            `);

            await queryRunner.query(`
                ALTER TABLE "marketing_campaigns"
                ADD COLUMN "objective" "marketing_campaigns_objective_enum"
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "marketing_campaigns" DROP COLUMN "objective"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "marketing_campaigns_objective_enum"`);
    }

}
