import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/decorators/public.decorator';
import type { HealthCheckResponse } from '@mcms/contracts';

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<HealthCheckResponse> {
    const isDbHealthy = await this.prisma.isHealthy();
    const overallStatus = isDbHealthy ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: isDbHealthy ? 'ok' : 'error',
      },
    };
  }
}
