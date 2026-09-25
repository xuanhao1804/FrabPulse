import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AIIntelligenceService } from '../../ai/services/ai-intelligence.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIIntelligenceService
  ) {}

  @Get()
  checkHealth() {
    return {
      status: 'UP',
      service: 'FrabPulse API Server',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        connected: this.prisma.isConnected,
        mode: this.prisma.isConnected ? 'POSTGRESQL_LIVE' : 'IN_MEMORY_FIXTURE'
      },
      aiProvider: {
        active: this.aiService.getActiveProviderName(),
        isMock: !this.aiService.getActiveProviderName().includes('OPENAI')
      },
      verticals: {
        goldPulse: 'ACTIVE'
      }
    };
  }
}
