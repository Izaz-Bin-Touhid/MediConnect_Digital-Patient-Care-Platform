import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dtos/login.dto.js';
import { JwtGuards } from './jwtGuards.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @Post('admin/login')
  @HttpCode(200)
  async adminLogin(@Body() dto: LoginDto) {
    return await this.authService.adminLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtGuards)
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
