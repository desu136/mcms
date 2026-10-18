import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SyncService } from './sync.service';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionSlug } from '@mcms/domain';
import type {
  SyncPushRequest,
  SyncPushResponse,
  SyncPullRequest,
  SyncPullResponse,
} from '@mcms/sync-core';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.SYNC_PUSH)
  async push(@Body() body: SyncPushRequest): Promise<SyncPushResponse> {
    return this.syncService.push(body);
  }

  @Post('pull')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PermissionSlug.SYNC_PULL)
  async pull(@Body() body: SyncPullRequest): Promise<SyncPullResponse> {
    return this.syncService.pull(body);
  }
}
