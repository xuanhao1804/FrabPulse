import { PrismaClient } from '@prisma/client';
import {
  SEED_ASSETS,
  SEED_PROVIDERS,
  SEED_SOURCES,
  LATEST_SEED_PRICES,
  SEED_MARKET_EVENTS
} from '../src/database/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FrabPulse database seed...');

  // 1. Seed Assets
  console.log('Seeding assets...');
  for (const asset of SEED_ASSETS) {
    await prisma.asset.upsert({
      where: { code: asset.code },
      update: {
        name: asset.name,
        category: asset.category,
        unit: asset.unit,
        symbol: asset.symbol,
        description: asset.description
      },
      create: {
        code: asset.code,
        name: asset.name,
        category: asset.category,
        unit: asset.unit,
        symbol: asset.symbol,
        description: asset.description
      }
    });
  }

  // 2. Seed Providers
  console.log('Seeding market providers...');
  for (const provider of SEED_PROVIDERS) {
    await prisma.marketProvider.upsert({
      where: { code: provider.code },
      update: {
        name: provider.name,
        websiteUrl: provider.websiteUrl,
        isLive: provider.isLive
      },
      create: {
        code: provider.code,
        name: provider.name,
        websiteUrl: provider.websiteUrl,
        isLive: provider.isLive
      }
    });
  }

  // 3. Seed News Sources
  console.log('Seeding verified news sources...');
  for (const src of SEED_SOURCES) {
    await prisma.newsSource.upsert({
      where: { code: src.code },
      update: {
        name: src.name,
        domain: src.domain,
        credibilityScore: src.credibilityScore,
        category: src.category,
        reliabilityNotes: src.reliabilityNotes
      },
      create: {
        code: src.code,
        name: src.name,
        domain: src.domain,
        credibilityScore: src.credibilityScore,
        category: src.category,
        reliabilityNotes: src.reliabilityNotes
      }
    });
  }

  // 4. Seed Latest Price Snapshots
  console.log('Seeding latest price snapshots...');
  const assetMap = await prisma.asset.findMany();
  const providerMap = await prisma.marketProvider.findMany();

  for (const price of LATEST_SEED_PRICES) {
    const asset = assetMap.find((a) => a.code === price.assetCode);
    const provider = providerMap.find((p) => p.code === price.providerCode);

    if (asset && provider) {
      await prisma.priceSnapshot.create({
        data: {
          assetId: asset.id,
          providerId: provider.id,
          buyPrice: price.buyPrice,
          sellPrice: price.sellPrice,
          spread: price.spread,
          currency: price.currency,
          timestamp: new Date(price.timestamp),
          change24hAbsolute: price.change24hAbsolute,
          change24hPercent: price.change24hPercent,
          isDemo: true
        }
      });
    }
  }

  // 5. Seed Market Events & Correlated Asset Movements
  console.log('Seeding market events and correlations...');
  const sourceMap = await prisma.newsSource.findMany();

  for (const event of SEED_MARKET_EVENTS) {
    const createdEvent = await prisma.marketEvent.upsert({
      where: { id: event.id },
      update: {
        title: event.title,
        summary: event.summary,
        eventType: event.eventType,
        happenedAt: new Date(event.happenedAt),
        detectedAt: new Date(event.detectedAt),
        entities: event.entities,
        confidence: event.confidence,
        synthesisFactualContext: event.synthesis.factualContext,
        synthesisSourceConsensus: event.synthesis.sourceConsensus,
        synthesisDivergence: event.synthesis.divergentPoints || [],
        methodologyNotes: event.methodologyNotes,
        isDemo: true
      },
      create: {
        id: event.id,
        title: event.title,
        summary: event.summary,
        eventType: event.eventType,
        happenedAt: new Date(event.happenedAt),
        detectedAt: new Date(event.detectedAt),
        entities: event.entities,
        confidence: event.confidence,
        synthesisFactualContext: event.synthesis.factualContext,
        synthesisSourceConsensus: event.synthesis.sourceConsensus,
        synthesisDivergence: event.synthesis.divergentPoints || [],
        methodologyNotes: event.methodologyNotes,
        isDemo: true
      }
    });

    // Seed articles & event citations
    for (const citation of event.sources) {
      const dbSource = sourceMap.find((s) => s.code === citation.sourceId.replace('src-', '').toUpperCase());
      if (dbSource) {
        const article = await prisma.article.upsert({
          where: { url: citation.articleUrl },
          update: {
            title: citation.articleTitle,
            summary: citation.excerpt || citation.articleTitle,
            publishedAt: new Date(citation.publishedAt)
          },
          create: {
            sourceId: dbSource.id,
            url: citation.articleUrl,
            title: citation.articleTitle,
            summary: citation.excerpt || citation.articleTitle,
            publishedAt: new Date(citation.publishedAt)
          }
        });

        await prisma.eventArticle.upsert({
          where: {
            eventId_articleId: {
              eventId: createdEvent.id,
              articleId: article.id
            }
          },
          update: {
            citationRole: citation.citationRole,
            excerpt: citation.excerpt
          },
          create: {
            eventId: createdEvent.id,
            articleId: article.id,
            citationRole: citation.citationRole,
            excerpt: citation.excerpt
          }
        });
      }
    }

    // Seed correlated asset movements
    for (const movement of event.relatedAssets) {
      const asset = assetMap.find((a) => a.code === movement.assetCode);
      if (asset) {
        await prisma.eventAssetMovement.upsert({
          where: {
            eventId_assetId: {
              eventId: createdEvent.id,
              assetId: asset.id
            }
          },
          update: {
            priceBefore: movement.priceBefore,
            priceAfter: movement.priceAfter,
            deltaAbsolute: movement.deltaAbsolute,
            deltaPercent: movement.deltaPercent,
            windowMinutes: movement.windowMinutes,
            measuredFrom: new Date(movement.measuredFrom),
            measuredTo: new Date(movement.measuredTo),
            isStatisticallySignificant: movement.isStatisticallySignificant,
            correlationCaveat: movement.correlationCaveat
          },
          create: {
            eventId: createdEvent.id,
            assetId: asset.id,
            priceBefore: movement.priceBefore,
            priceAfter: movement.priceAfter,
            deltaAbsolute: movement.deltaAbsolute,
            deltaPercent: movement.deltaPercent,
            windowMinutes: movement.windowMinutes,
            measuredFrom: new Date(movement.measuredFrom),
            measuredTo: new Date(movement.measuredTo),
            isStatisticallySignificant: movement.isStatisticallySignificant,
            correlationCaveat: movement.correlationCaveat
          }
        });
      }
    }
  }

  console.log('✅ FrabPulse seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
