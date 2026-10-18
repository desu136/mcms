import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  SyncPushRequest,
  SyncPushResponse,
  SyncPullRequest,
  SyncPullResponse,
  SyncAcknowledgement,
  SyncServerEvent,
} from '@mcms/sync-core';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  async push(dto: SyncPushRequest): Promise<SyncPushResponse> {
    const acknowledgements: SyncAcknowledgement[] = [];

    for (const op of dto.operations) {
      try {
        // Check for idempotency: if operationId has already been recorded
        const existing = await this.prisma.syncJournal.findUnique({
          where: { operationId: op.operationId },
        });

        if (existing) {
          acknowledgements.push({
            operationId: op.operationId,
            status: 'DUPLICATE',
            newCursor: String(existing.cursorPosition),
          });
          continue;
        }

        // Record in the sync journal with strict optional property typing
        const createData: Prisma.SyncJournalCreateInput = {
          operationId: op.operationId,
          entityType: op.entityType,
          entityId: op.entityId,
          operation: op.operation,
          clientTimestamp: new Date(op.clientTimestamp),
        };

        if (op.payload !== null && op.payload !== undefined) {
          createData.payload = op.payload as Prisma.InputJsonValue;
        }

        const recorded = await this.prisma.syncJournal.create({
          data: createData,
        });

        acknowledgements.push({
          operationId: op.operationId,
          status: 'ACCEPTED',
          newCursor: String(recorded.cursorPosition),
        });
      } catch (err) {
        this.logger.error(`Error processing sync operation ${op.operationId}:`, err);
        acknowledgements.push({
          operationId: op.operationId,
          status: 'REJECTED',
          error: {
            code: 'SYNC_PROCESSING_ERROR',
            message: (err as Error).message,
          },
        });
      }
    }

    // Determine current global cursor
    const latest = await this.prisma.syncJournal.findFirst({
      orderBy: { cursorPosition: 'desc' },
      select: { cursorPosition: true },
    });

    const newCursor = latest ? String(latest.cursorPosition) : (dto.cursor ?? '0');

    return {
      acknowledgements,
      newCursor,
    };
  }

  async pull(dto: SyncPullRequest): Promise<SyncPullResponse> {
    const cursorBigInt = dto.cursor ? BigInt(dto.cursor) : BigInt(0);
    const limit = Math.min(dto.limit ?? 50, 100);

    const where: Prisma.SyncJournalWhereInput = {
      cursorPosition: { gt: cursorBigInt },
    };

    if (dto.entityTypes.length > 0) {
      where.entityType = { in: dto.entityTypes };
    }

    const records = await this.prisma.syncJournal.findMany({
      where,
      orderBy: { cursorPosition: 'asc' },
      take: limit + 1,
    });

    const hasMore = records.length > limit;
    const items = records.slice(0, limit);

    const events: SyncServerEvent[] = items.map((rec) => ({
      operationId: rec.operationId,
      entityType: rec.entityType,
      entityId: rec.entityId,
      operation: rec.operation as 'CREATE' | 'UPDATE' | 'DELETE',
      payload: rec.payload,
      serverTimestamp: rec.serverTimestamp.toISOString(),
      cursor: String(rec.cursorPosition),
    }));

    const lastItem = items[items.length - 1];
    const newCursor = lastItem ? String(lastItem.cursorPosition) : (dto.cursor ?? '0');

    return {
      events,
      newCursor,
      hasMore,
    };
  }
}
