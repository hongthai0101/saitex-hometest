import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm'

export class CreateInsightTables1734779999999 implements MigrationInterface {
  name = 'CreateInsightTables1734779999999'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create conversations table
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'total_tokens',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: 0,
          },
          {
            name: 'metadata',
            type: 'jsonb',
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

    // Create messages table
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'conversation_id',
            type: 'uuid',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'assistant', 'system'],
            default: "'user'",
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['text', 'sql_query', 'data_result', 'suggestion', 'error'],
            default: "'text'",
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'prompt_tokens',
            type: 'integer',
            default: 0,
          },
          {
            name: 'completion_tokens',
            type: 'integer',
            default: 0,
          },
          {
            name: 'total_tokens',
            type: 'integer',
            default: 0,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 6,
            default: 0,
          },
          {
            name: 'sql_query',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'sql_result',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'processing_time',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
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
          },
        ],
      }),
      true,
    )

    // Create foreign key constraint
    await queryRunner.createForeignKey(
      'messages',
      new TableForeignKey({
        columnNames: ['conversation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'conversations',
        onDelete: 'CASCADE',
      }),
    )

    // Create indexes for better performance
    await queryRunner.createIndex(
      'conversations',
      new TableIndex({ name: 'IDX_conversations_user_id', columnNames: ['user_id'] }),
    )

    await queryRunner.createIndex(
      'conversations',
      new TableIndex({ name: 'IDX_conversations_created_at', columnNames: ['created_at'] }),
    )

    await queryRunner.createIndex(
      'conversations',
      new TableIndex({ name: 'IDX_conversations_deleted_at', columnNames: ['deleted_at'] }),
    )

    await queryRunner.createIndex(
      'messages',
      new TableIndex({ name: 'IDX_messages_conversation_id', columnNames: ['conversation_id'] }),
    )

    await queryRunner.createIndex(
      'messages',
      new TableIndex({ name: 'IDX_messages_role', columnNames: ['role'] }),
    )

    await queryRunner.createIndex(
      'messages',
      new TableIndex({ name: 'IDX_messages_type', columnNames: ['type'] }),
    )

    await queryRunner.createIndex(
      'messages',
      new TableIndex({ name: 'IDX_messages_created_at', columnNames: ['created_at'] }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('messages', 'IDX_messages_created_at')
    await queryRunner.dropIndex('messages', 'IDX_messages_type')
    await queryRunner.dropIndex('messages', 'IDX_messages_role')
    await queryRunner.dropIndex('messages', 'IDX_messages_conversation_id')
    await queryRunner.dropIndex('conversations', 'IDX_conversations_deleted_at')
    await queryRunner.dropIndex('conversations', 'IDX_conversations_created_at')
    await queryRunner.dropIndex('conversations', 'IDX_conversations_user_id')

    // Drop foreign key
    const table = await queryRunner.getTable('messages')
    if (table) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('conversation_id') !== -1)
      if (foreignKey) {
        await queryRunner.dropForeignKey('messages', foreignKey)
      }
    }

    // Drop tables
    await queryRunner.dropTable('messages')
    await queryRunner.dropTable('conversations')
  }
}