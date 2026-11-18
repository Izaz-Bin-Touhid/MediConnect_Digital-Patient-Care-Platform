import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthActor } from './auth.types.js';
import { AuthService } from './auth.service.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { LoginDto } from './dto/login.dto.js';

@Controller(['auth', 'coordinator'])
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ security: [] })
  @HttpCode(200)
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ accessToken: string; role: AuthActor['role'] }> {
    return await this.authService.login(dto);
  }

  @Patch('profile/password')
  @Roles('coordinator')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() actor: AuthActor,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return await this.authService.changePassword(actor.sub, dto);
  }

  @Post('logout')
  @Roles('coordinator')
  @HttpCode(204)
  async logout(@CurrentUser() actor: AuthActor): Promise<void> {
    return await this.authService.logout(actor.sub);
  }
}
