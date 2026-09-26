import { Controller, Get, Query } from '@nestjs/common';
import { MarketDataService } from '../services/market-data.service';
import { AssetCode } from '@frabpulse/shared';

@Controller('market')
export class MarketDataController {
  constructor(private readonly marketDataService: MarketDataService) {}

  @Get('prices/latest')
  async getLatestPrices() {
    return this.marketDataService.getLatestPrices();
  }

  @Get('gold-gap')
  async getGoldGap() {
    return this.marketDataService.getGoldGap();
  }

  @Get('chart/series')
  async getChartSeries(@Query('asset') asset?: AssetCode) {
    return this.marketDataService.getHistoricalSeries(asset || 'XAU_USD');
  }

  @Get('assets')
  getAssets() {
    return this.marketDataService.getAssetsList();
  }

  @Get('health')
  async getMarketHealth() {
    return this.marketDataService.getMarketHealth();
  }
}
