import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SseBroadcasterService } from '../services/sse-broadcaster.service';
import { PulseSseMessage } from '@frabpulse/shared';

@Controller('sse')
export class SseController {
  constructor(private readonly sseBroadcaster: SseBroadcasterService) {}

  @Sse('pulse')
  streamPulse(): Observable<{ data: PulseSseMessage<unknown> }> {
    return this.sseBroadcaster.getStream();
  }
}
