import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsPinnedToConversations1759597488884 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('conversations', new TableColumn({
            name: 'is_pinned',
            type: 'boolean',
            default: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('conversations', 'is_pinned');
    }

}
