import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'

export interface TableSchema {
  tableName: string
  columns: ColumnSchema[]
  relationships: RelationshipSchema[]
}

export interface ColumnSchema {
  name: string
  type: string
  nullable: boolean
  isPrimary: boolean
  isForeign: boolean
  defaultValue?: any
  comment?: string
}

export interface RelationshipSchema {
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  relatedTable: string
  foreignKey: string
  referencedKey: string
}

@Injectable()
export class SchemaAnalyzerService {
  private readonly logger = new Logger(SchemaAnalyzerService.name)

  constructor(private dataSource: DataSource) {}

  /**
   * Get schema information for marketing module tables
   */
  async getMarketingSchema(): Promise<TableSchema[]> {
    try {
      const marketingTables = await this.getMarketingTables()
      const schemas: TableSchema[] = []

      for (const tableName of marketingTables) {
        const schema = await this.getTableSchema(tableName)
        if (schema) {
          // Add sample data for better context
          const sampleData = await this.getSampleData(tableName, 2)
          schemas.push({
            ...schema,
            sampleData,
          } as any)
        }
      }

      this.logger.log(`Retrieved schema for ${schemas.length} marketing tables`)
      return schemas
    } catch (error) {
      this.logger.error('Error getting marketing schema:', error)
      return []
    }
  }

  /**
   * Get all table schemas (for comprehensive analysis)
   */
  async getAllTableSchemas(): Promise<TableSchema[]> {
    try {
      const tableNames = await this.getAllTableNames()
      const schemas: TableSchema[] = []

      for (const tableName of tableNames) {
        const schema = await this.getTableSchema(tableName)
        if (schema) {
          schemas.push(schema)
        }
      }

      this.logger.log(`Retrieved schema for ${schemas.length} tables`)
      return schemas
    } catch (error) {
      this.logger.error('Error getting all table schemas:', error)
      return []
    }
  }

  /**
   * Get schema for a specific table
   */
  private async getTableSchema(tableName: string): Promise<TableSchema | null> {
    try {
      const columns = await this.getTableColumns(tableName)
      const relationships = await this.getTableRelationships(tableName)

      return {
        tableName,
        columns,
        relationships,
      }
    } catch (error) {
      this.logger.error(`Error getting schema for table ${tableName}:`, error)
      return null
    }
  }

  /**
   * Get column information for a table
   */
  private async getTableColumns(tableName: string): Promise<ColumnSchema[]> {
    const query = `
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        col_description(pgc.oid, ordinal_position) as comment
      FROM information_schema.columns isc
      LEFT JOIN pg_class pgc ON pgc.relname = isc.table_name
      WHERE table_name = $1
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `

    const result = await this.dataSource.query(query, [tableName])

    const primaryKeys = await this.getPrimaryKeys(tableName)
    const foreignKeys = await this.getForeignKeys(tableName)

    return result.map((row: any) => ({
      name: row.column_name,
      type: this.formatColumnType(row),
      nullable: row.is_nullable === 'YES',
      isPrimary: primaryKeys.includes(row.column_name),
      isForeign: foreignKeys.some((fk: any) => fk.column_name === row.column_name),
      defaultValue: row.column_default,
      comment: row.comment,
    }))
  }

  /**
   * Get relationship information for a table
   */
  private async getTableRelationships(tableName: string): Promise<RelationshipSchema[]> {
    const query = `
      SELECT
        kcu.column_name as foreign_key,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_key
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
    `

    const result = await this.dataSource.query(query, [tableName])

    return result.map((row: any) => ({
      type: 'many-to-one' as const, // Default assumption
      relatedTable: row.referenced_table,
      foreignKey: row.foreign_key,
      referencedKey: row.referenced_key,
    }))
  }

  /**
   * Get primary keys for a table
   */
  private async getPrimaryKeys(tableName: string): Promise<string[]> {
    const query = `
      SELECT column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
    `

    const result = await this.dataSource.query(query, [tableName])
    return result.map((row: any) => row.column_name)
  }

  /**
   * Get foreign keys for a table
   */
  private async getForeignKeys(tableName: string): Promise<any[]> {
    const query = `
      SELECT
        kcu.column_name,
        ccu.table_name AS referenced_table,
        ccu.column_name AS referenced_column
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = $1
        AND tc.table_schema = 'public'
    `

    return this.dataSource.query(query, [tableName])
  }

  /**
   * Get marketing-related table names
   */
  private async getMarketingTables(): Promise<string[]> {
    const allTables = await this.getAllTableNames()

    // Filter for marketing-related tables
    const marketingKeywords = [
      'campaign',
      'marketing',
      'customer',
      'user',
      'order',
      'product',
      'sale',
      'lead',
      'conversion',
      'analytics',
      'engagement',
      'subscription',
      'revenue',
      'visitor',
      'traffic',
    ]

    return allTables.filter(tableName =>
      marketingKeywords.some(keyword =>
        tableName.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  }

  /**
   * Get all table names from the database
   */
  private async getAllTableNames(): Promise<string[]> {
    const query = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'typeorm_%'
      ORDER BY table_name
    `

    const result = await this.dataSource.query(query)
    return result.map((row: any) => row.table_name)
  }

  /**
   * Format column type with length/precision
   */
  private formatColumnType(row: any): string {
    let type = row.data_type

    if (row.character_maximum_length) {
      type += `(${row.character_maximum_length})`
    } else if (row.numeric_precision && row.numeric_scale) {
      type += `(${row.numeric_precision},${row.numeric_scale})`
    } else if (row.numeric_precision) {
      type += `(${row.numeric_precision})`
    }

    return type
  }

  /**
   * Get sample data for better SQL generation context
   */
  async getSampleData(tableName: string, limit: number = 3): Promise<any[]> {
    try {
      const query = `SELECT * FROM ${tableName} LIMIT $1`
      return await this.dataSource.query(query, [limit])
    } catch (error) {
      this.logger.warn(`Could not get sample data for ${tableName}:`, error.message)
      return []
    }
  }

  /**
   * Validate SQL query against schema
   */
  async validateSQL(sqlQuery: string, schemas: TableSchema[]): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []
    const tableNames = schemas.map(s => s.tableName.toLowerCase())

    try {
      // 1. Check if tables exist
      const tablesInQuery = this.extractTablesFromSQL(sqlQuery)
      for (const table of tablesInQuery) {
        if (!tableNames.includes(table.toLowerCase())) {
          errors.push(`Table '${table}' does not exist in schema`)
        }
      }

      // 2. Check for dangerous operations
      const dangerousPatterns = [
        { pattern: /DROP\s+TABLE/i, error: 'DROP TABLE is not allowed' },
        { pattern: /TRUNCATE/i, error: 'TRUNCATE is not allowed' },
        { pattern: /DELETE\s+FROM/i, error: 'DELETE is not allowed (read-only queries)' },
        { pattern: /UPDATE\s+/i, error: 'UPDATE is not allowed (read-only queries)' },
        { pattern: /INSERT\s+INTO/i, error: 'INSERT is not allowed (read-only queries)' },
        { pattern: /ALTER\s+TABLE/i, error: 'ALTER TABLE is not allowed' },
      ]

      for (const { pattern, error } of dangerousPatterns) {
        if (pattern.test(sqlQuery)) {
          errors.push(error)
        }
      }

      // 3. Check for performance issues
      if (!sqlQuery.match(/LIMIT\s+\d+/i)) {
        warnings.push('Query should include LIMIT clause for performance')
      }

      if (sqlQuery.match(/SELECT\s+\*/i) && !sqlQuery.match(/LIMIT\s+[1-9]\d?$/i)) {
        warnings.push('SELECT * without LIMIT can return too many rows')
      }

      // 4. Validate SQL syntax using EXPLAIN
      if (errors.length === 0) {
        try {
          await this.dataSource.query(`EXPLAIN ${sqlQuery}`)
        } catch (explainError) {
          errors.push(`SQL syntax error: ${explainError.message}`)
        }
      }

      // Log warnings but don't fail validation
      if (warnings.length > 0) {
        this.logger.warn(`SQL validation warnings: ${warnings.join(', ')}`)
      }

      return { isValid: errors.length === 0, errors }
    } catch (error) {
      errors.push(`Validation error: ${error.message}`)
      return { isValid: false, errors }
    }
  }

  /**
   * Extract table names from SQL query (basic implementation)
   */
  private extractTablesFromSQL(sql: string): string[] {
    const tables: string[] = []
    const regex = /(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi
    let match

    while ((match = regex.exec(sql)) !== null) {
      tables.push(match[1])
    }

    return [...new Set(tables)] // Remove duplicates
  }
}