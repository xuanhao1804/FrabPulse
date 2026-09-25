import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MarketEvent } from '@frabpulse/shared';
import { PrismaService } from '../../../database/prisma.service';
import { SEED_MARKET_EVENTS } from '../../../database/seed-data';
import { CorrelationEngineService } from './correlation-engine.service';
import { AIIntelligenceService } from '../../ai/services/ai-intelligence.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly correlationEngine: CorrelationEngineService,
    private readonly aiService: AIIntelligenceService
  ) {}

  async getAllEvents(): Promise<MarketEvent[]> {
    // If DB is connected, fetch from relational tables
    if (this.prisma.isConnected) {
      try {
        const events = await this.prisma.marketEvent.findMany({
          orderBy: { happenedAt: 'desc' },
          include: {
            eventArticles: {
              include: {
                article: {
                  include: {
                    source: true
                  }
                }
              }
            },
            relatedAssets: {
              include: {
                asset: true
              }
            }
          }
        });

        if (events.length > 0) {
          return events.map((e) => ({
            id: e.id,
            title: e.title,
            summary: e.summary,
            eventType: e.eventType as MarketEvent['eventType'],
            happenedAt: e.happenedAt.toISOString(),
            detectedAt: e.detectedAt.toISOString(),
            entities: (e.entities as string[]) || [],
            confidence: e.confidence,
            isDemo: e.isDemo,
            methodologyNotes: e.methodologyNotes,
            synthesis: {
              factualContext: e.synthesisFactualContext,
              sourceConsensus: e.synthesisSourceConsensus,
              divergentPoints: (e.synthesisDivergence as string[]) || []
            },
            sources: e.eventArticles.map((ea) => ({
              sourceId: ea.article.source.code,
              sourceName: ea.article.source.name,
              sourceDomain: ea.article.source.domain,
              articleTitle: ea.article.title,
              articleUrl: ea.article.url,
              publishedAt: ea.article.publishedAt.toISOString(),
              citationRole: ea.citationRole as 'PRIMARY' | 'CONFIRMING' | 'PERSPECTIVE',
              excerpt: ea.excerpt || undefined
            })),
            relatedAssets: e.relatedAssets.map((ra) => ({
              assetCode: ra.asset.code as MarketEvent['relatedAssets'][0]['assetCode'],
              assetName: ra.asset.name,
              priceBefore: ra.priceBefore,
              priceAfter: ra.priceAfter,
              deltaAbsolute: ra.deltaAbsolute,
              deltaPercent: ra.deltaPercent,
              windowMinutes: ra.windowMinutes,
              measuredFrom: ra.measuredFrom.toISOString(),
              measuredTo: ra.measuredTo.toISOString(),
              isStatisticallySignificant: ra.isStatisticallySignificant,
              correlationCaveat: ra.correlationCaveat
            }))
          }));
        }
      } catch (err) {
        this.logger.warn('Failed to query Prisma events, falling back to seed repository', err);
      }
    }

    // Default: Return high-fidelity seed events
    return SEED_MARKET_EVENTS;
  }

  async getEventById(id: string): Promise<MarketEvent> {
    const all = await this.getAllEvents();
    const found = all.find((e) => e.id === id);
    if (!found) {
      throw new NotFoundException(`Market event with ID ${id} not found.`);
    }
    return found;
  }
}
