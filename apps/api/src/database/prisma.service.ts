import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isDbConnected = false;

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.isDbConnected = true;
      this.logger.log('Connected to PostgreSQL database via Prisma ORM.');
    } catch (error) {
      this.isDbConnected = false;
      this.logger.warn(
        'PostgreSQL database not currently reachable. Operating in In-Memory / Deterministic Fixture mode.'
      );
    }
  }

  async onModuleDestroy() {
    if (this.isDbConnected) {
      await this.$disconnect();
    }
  }

  public get isConnected(): boolean {
    return this.isDbConnected;
  }
}
