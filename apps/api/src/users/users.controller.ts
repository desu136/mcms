import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { PermissionSlug } from '@mcms/domain';
import type { AuthenticatedUserEntity } from '../auth/types/authenticated-user.type';
import type { CreateUserRequest, UpdateUserRequest, UserSummaryDTO } from '@mcms/contracts';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(PermissionSlug.USERS_READ)
  async findAll(): Promise<UserSummaryDTO[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PermissionSlug.USERS_READ)
  async findOne(@Param('id') id: string): Promise<UserSummaryDTO> {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PermissionSlug.USERS_CREATE)
  async create(
    @Body() body: CreateUserRequest,
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<UserSummaryDTO> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.usersService.create(body, actor, ip);
  }

  @Patch(':id')
  @RequirePermissions(PermissionSlug.USERS_UPDATE)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserRequest,
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<UserSummaryDTO> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.usersService.update(id, body, actor, ip);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionSlug.USERS_DEACTIVATE)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<void> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.usersService.deactivate(id, actor, ip);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(PermissionSlug.USERS_ACTIVATE)
  async activate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUserEntity,
    @Req() req: Request,
  ): Promise<void> {
    const ip = (req.headers['x-forwarded-for'] as string) ?? req.ip;
    return this.usersService.activate(id, actor, ip);
  }
}
