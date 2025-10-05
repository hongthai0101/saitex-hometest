import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import OpenAI from 'openai'

export interface PromptAnalysisResult {
  isDataRelated: boolean
  intent: 'query' | 'report' | 'statistics' | 'general'
  entities: string[]
  suggestedQueries?: string[]
  confidence: number
}

export interface SQLGenerationResult {
  sqlQuery: string
  explanation: string
  confidence: number
  tables: string[]
  columns: string[]
}

@Injectable()
export class OpenAIService {
  private readonly logger = new Logger(OpenAIService.name)
  private readonly openai: OpenAI

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required')
    }

    this.openai = new OpenAI({
      apiKey,
    })
  }

  /**
   * Analyze user prompt to understand intent and extract entities
   */
  async analyzePrompt(prompt: string): Promise<PromptAnalysisResult> {
    try {
      const systemPrompt = `
        You are an expert AI assistant that analyzes user prompts to determine if they are asking for data insights, reports, or statistics.

        Analyze the user prompt and respond with a JSON object containing:
        {
          "isDataRelated": boolean, // true if asking for data/reports/statistics
          "intent": "query" | "report" | "statistics" | "general",
          "entities": string[], // relevant business entities mentioned (customers, products, sales, etc.)
          "suggestedQueries": string[], // 3-5 suggested questions if not data related
          "confidence": number // 0-1 confidence score
        }

        Examples of data-related prompts:
        - "Show me sales revenue for last month"
        - "How many customers do we have?"
        - "What's the top selling product?"
        - "Generate a report on user engagement"

        If the prompt is NOT data-related, provide helpful suggestions for what they could ask about business data.
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      this.logger.log(`Prompt analysis completed for: "${prompt.substring(0, 50)}..."`)

      return {
        isDataRelated: result.isDataRelated || false,
        intent: result.intent || 'general',
        entities: result.entities || [],
        suggestedQueries: result.suggestedQueries || [],
        confidence: result.confidence || 0,
      }
    } catch (error) {
      this.logger.error('Error analyzing prompt:', error)
      return {
        isDataRelated: false,
        intent: 'general',
        entities: [],
        suggestedQueries: [
          'Show me total sales for this month',
          'How many active customers do we have?',
          'What are our top performing products?',
          'Generate a weekly performance report',
          'Show customer acquisition trends',
        ],
        confidence: 0,
      }
    }
  }

  /**
   * Generate SQL query based on user prompt and database schema
   */
  async generateSQL(
    prompt: string,
    tableSchemas: any[],
    analysisResult: PromptAnalysisResult,
  ): Promise<SQLGenerationResult> {
    try {
      const schemaDescription = this.formatSchemaForPrompt(tableSchemas)

      const systemPrompt = `
        You are an expert PostgreSQL database analyst. Generate ACCURATE and EFFICIENT SQL queries based on user requests.

        ## Database Schema:
        ${schemaDescription}

        ## CRITICAL RULES:
        1. **Table & Column Names**: Use EXACT names from schema (case-sensitive). Use snake_case format.
        2. **JOINs**: Always specify JOIN conditions using foreign keys from schema relationships
        3. **Date Filtering**:
           - For "last month": WHERE date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND date < DATE_TRUNC('month', CURRENT_DATE)
           - For "this month": WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
           - For "last week": WHERE date >= DATE_TRUNC('week', CURRENT_DATE - INTERVAL '1 week')
           - Use created_at or updated_at column based on context
        4. **Aggregations**:
           - Use SUM(), COUNT(), AVG() appropriately
           - Always GROUP BY when using aggregations
           - Use ROUND() for decimal values: ROUND(AVG(price)::numeric, 2)
        5. **Performance**:
           - Add LIMIT clause (default 100, max 1000) unless user specifies
           - Use indexes (id, created_at, foreign keys)
           - Avoid SELECT * when specific columns suffice
        6. **Data Types**:
           - Cast appropriately: column_name::numeric, column_name::text
           - Handle NULLs: COALESCE(column, 0)
        7. **Sorting**: Always add ORDER BY for consistent results (e.g., ORDER BY created_at DESC)

        ## Example Patterns:

        **Revenue by Month:**
        SELECT
          DATE_TRUNC('month', o.created_at) as month,
          ROUND(SUM(o.total_amount)::numeric, 2) as total_revenue,
          COUNT(o.id) as order_count
        FROM orders o
        WHERE o.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 month')
        GROUP BY DATE_TRUNC('month', o.created_at)
        ORDER BY month DESC
        LIMIT 12

        **Top Products:**
        SELECT
          p.name,
          p.category,
          SUM(oi.quantity) as total_sold,
          ROUND(SUM(oi.total_price)::numeric, 2) as revenue
        FROM products p
        JOIN order_items oi ON oi.product_id = p.id
        GROUP BY p.id, p.name, p.category
        ORDER BY total_sold DESC
        LIMIT 10

        **Customer Insights:**
        SELECT
          c.id,
          c.first_name || ' ' || c.last_name as customer_name,
          c.email,
          COUNT(o.id) as order_count,
          ROUND(SUM(o.total_amount)::numeric, 2) as total_spent
        FROM customers c
        LEFT JOIN orders o ON o.customer_id = c.id
        GROUP BY c.id, c.first_name, c.last_name, c.email
        HAVING COUNT(o.id) > 0
        ORDER BY total_spent DESC
        LIMIT 20

        ## Response Format (JSON):
        {
          "sqlQuery": "SELECT ...", // Complete, executable SQL query
          "explanation": "This query retrieves...", // Brief explanation (1-2 sentences)
          "confidence": 0.95, // Your confidence (0-1)
          "tables": ["orders", "products"], // Tables used
          "columns": ["total_amount", "created_at"] // Main columns used
        }

        ## User Context:
        - Intent: ${analysisResult.intent}
        - Entities mentioned: ${analysisResult.entities.join(', ') || 'none'}
        - Confidence: ${analysisResult.confidence}

        Generate the MOST ACCURATE SQL query for: "${prompt}"
      `

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')

      this.logger.log(`SQL generated for prompt: "${prompt.substring(0, 50)}..."`)

      return {
        sqlQuery: result.sqlQuery || '',
        explanation: result.explanation || '',
        confidence: result.confidence || 0,
        tables: result.tables || [],
        columns: result.columns || [],
      }
    } catch (error) {
      this.logger.error('Error generating SQL:', error)
      throw new Error('Failed to generate SQL query')
    }
  }

  /**
   * Generate streaming response for chat
   */
  async *generateStreamingResponse(
    prompt: string,
    context: string = '',
    sqlResult?: any,
  ): AsyncGenerator<string, void, unknown> {
    try {
      const systemPrompt = `
        You are a helpful business intelligence assistant. Provide clear, concise answers about business data.

        IMPORTANT: Format your response in MARKDOWN with proper structure including:
        - Use headings (# ## ###) to organize content
        - Use tables when displaying data results
        - Use bullet points and numbered lists for clarity
        - Use code blocks for SQL queries or technical content
        - Use bold and italic for emphasis
        - Include relevant icons/emojis where appropriate

        ${context ? `Context: ${context}` : ''}
        ${sqlResult ? `Data Result: ${JSON.stringify(sqlResult, null, 2)}` : ''}

        If data is provided, analyze it and provide insights. Always format the data in a markdown table.
        Format numbers appropriately with proper units ($, %, etc.) and highlight key findings.
        Keep responses conversational, business-focused, and well-structured in markdown format.

        Example response format:
        # Analysis Results

        ## Key Findings
        - **Total Revenue**: $X,XXX
        - **Growth Rate**: +X.X%

        ## Data Summary
        | Metric | Value | Change |
        |--------|-------|--------|
        | Revenue | $X,XXX | +X% |

        ## Recommendations
        > Based on the analysis, I recommend...
      `

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          yield content
        }
      }
    } catch (error) {
      this.logger.error('Error generating streaming response:', error)
      yield 'I apologize, but I encountered an error while processing your request. Please try again.'
    }
  }

  /**
   * Format database schema for OpenAI prompt
   */
  private formatSchemaForPrompt(tableSchemas: any[]): string {
    return tableSchemas
      .map((table) => {
        const columns = table.columns
          .map((col: any) => {
            const parts = [
              `  - ${col.name}`,
              `(${col.type})`,
            ]
            if (col.isPrimary) parts.push('[PRIMARY KEY]')
            if (col.isForeign) parts.push('[FOREIGN KEY]')
            if (col.nullable) parts.push('[nullable]')
            return parts.join(' ')
          })
          .join('\n')

        const relationships = table.relationships && table.relationships.length > 0
          ? '\n  Relationships:\n' + table.relationships
              .map((rel: any) => `    - ${rel.foreignKey} -> ${rel.relatedTable}.${rel.referencedKey} (${rel.type})`)
              .join('\n')
          : ''

        const sampleData = table.sampleData && table.sampleData.length > 0
          ? '\n  Sample Data (for context):\n' +
            JSON.stringify(table.sampleData.slice(0, 1), null, 2)
              .split('\n')
              .map(line => `    ${line}`)
              .join('\n')
          : ''

        return `Table: ${table.tableName}\n  Columns:\n${columns}${relationships}${sampleData}\n`
      })
      .join('\n')
  }

  /**
   * Calculate token usage and cost
   */
  calculateCost(promptTokens: number, completionTokens: number, model: string = 'gpt-4o-mini'): number {
    // Pricing as of 2024 (per 1K tokens)
    const pricing = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    }

    const rates = pricing[model] || pricing['gpt-4o-mini']
    const promptCost = (promptTokens / 1000) * rates.input
    const completionCost = (completionTokens / 1000) * rates.output

    return promptCost + completionCost
  }
}