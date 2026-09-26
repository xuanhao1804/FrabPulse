import { Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  name: string;
  failureThreshold?: number; // Consecutive failures before opening (default: 3)
  resetTimeoutMs?: number;   // Time to stay open before attempting half-open probe (default: 60000ms)
}

export class CircuitBreaker {
  private readonly logger: Logger;
  private readonly name: string;
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private nextAttemptTimestamp = 0;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 300_000; // 5 minutes default
    this.logger = new Logger(`CircuitBreaker[${this.name}]`);
  }

  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttemptTimestamp) {
      this.state = 'HALF_OPEN';
      this.logger.log(`Circuit transitioned to HALF_OPEN probe state.`);
    }
    return this.state;
  }

  getStats() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      failureThreshold: this.failureThreshold,
      resetTimeoutMs: this.resetTimeoutMs,
      nextAttemptTimestamp: this.nextAttemptTimestamp
    };
  }

  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      this.logger.debug(`Circuit is OPEN. Fast-failing and executing fallback.`);
      if (fallback) {
        return fallback();
      }
      throw new Error(`CircuitBreaker[${this.name}] is OPEN. Action blocked.`);
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (err: any) {
      this.recordFailure(err);
      if (fallback) {
        return fallback();
      }
      throw err;
    }
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN' || this.state === 'OPEN') {
      this.logger.log(`Probe succeeded. Circuit reset to CLOSED.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(err?: any): void {
    this.failureCount++;
    this.logger.warn(`Failure recorded (${this.failureCount}/${this.failureThreshold}): ${err?.message || err}`);

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state = 'OPEN';
    this.nextAttemptTimestamp = Date.now() + this.resetTimeoutMs;
    this.logger.warn(`Circuit tripped to OPEN. External requests paused for ${Math.round(this.resetTimeoutMs / 1000)}s.`);
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttemptTimestamp = 0;
  }
}
