import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { InsightController } from './insight.controller'
import { InsightService } from './services/insight.service'
import { OpenAIService } from './services/openai.service'
import { SchemaAnalyzerService } from './services/schema-analyzer.service'

import { Conversation } from './entities/conversation.entity'
import { Message } from './entities/message.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    ConfigModule,
    EventEmitterModule,
  ],
  controllers: [InsightController],
  providers: [
    InsightService,
    OpenAIService,
    SchemaAnalyzerService,
  ],
  exports: [
    InsightService,
    OpenAIService,
    SchemaAnalyzerService,
  ],
})
export class InsightModule {}