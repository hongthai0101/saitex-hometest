import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateUsersTables1734780000000 implements MigrationInterface {
  name = 'CreateUsersTables1734780000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable uuid-ossp extension for UUID generation
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
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
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'user', 'manager'],
            default: "'user'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'email_verified_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
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

    // Create indexes for better performance
    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_email', columnNames: ['email'] }),
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_role', columnNames: ['role'] }),
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_is_active', columnNames: ['is_active'] }),
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_created_at', columnNames: ['created_at'] }),
    )

    await queryRunner.createIndex(
      'users',
      new TableIndex({ name: 'IDX_users_deleted_at', columnNames: ['deleted_at'] }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('users', 'IDX_users_deleted_at')
    await queryRunner.dropIndex('users', 'IDX_users_created_at')
    await queryRunner.dropIndex('users', 'IDX_users_is_active')
    await queryRunner.dropIndex('users', 'IDX_users_role')
    await queryRunner.dropIndex('users', 'IDX_users_email')

    // Drop tables
    await queryRunner.dropTable('users')
  }
}