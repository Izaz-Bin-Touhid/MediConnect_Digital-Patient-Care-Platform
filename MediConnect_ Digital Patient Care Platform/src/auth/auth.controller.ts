import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dtos/login.dto.js';
import { JwtGuards } from '../common/guards/jwt-auth.guard.js';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Doctor login ? returns a DOCTOR token' })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Admin login ? returns an ADMIN token' })
  @Post('admin/login')
  @HttpCode(200)
  async adminLogin(@Body() dto: LoginDto) {
    return await this.authService.adminLogin(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtGuards)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
