import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChangeAdminPasswordDto } from './dtos/change-admin-password.dto.js';
import { CreateAdminDto } from './dtos/create-admin.dto.js';
import {
  BadRequestException, Body, Controller, DefaultValuePipe, Get, Post,
  Param, ParseIntPipe, Patch, Query, Req, UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Admins } from './entities/admins.entity.js';
import { AdminsService } from './admins.service.js';
import { VerifyDoctorDto } from './dtos/verify-doctor.dto.js';
import { UpdateAdminDto } from './dtos/update-admin.dto.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';

type AdminRequest = Request & { user: Admins & { role: 'ADMIN' } };

@ApiTags('Admins')
@Controller('admins')
@UseGuards(JwtGuards, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return await this.adminsService.createAdmin(dto);
  }

  @Get('me')
  getOwnProfile(@Req() req: AdminRequest) {
    return req.user;
  }

  @Patch('me/password')
  async changePassword(
    @Req() req: AdminRequest,
    @Body() dto: ChangeAdminPasswordDto,
  ) {
    return await this.adminsService.changePassword(req.user.admin_id, dto);
  }

  @Patch('me')
  async updateOwnProfile(@Req() req: AdminRequest, @Body() dto: UpdateAdminDto) {
    if (!Object.keys(dto).length) {
      throw new BadRequestException('Provide an admin profile field to update');
    }
    return await this.adminsService.updateOwnProfile(req.user.admin_id, dto);
  }

  @Get('doctor-profiles')
  async getDoctorProfiles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new DefaultValuePipe('PENDING')) status: string,
  ) {
    if (!Number.isSafeInteger(page) || page < 1 || limit < 1 || limit > 100 ||
        !Number.isSafeInteger((page - 1) * limit)) {
      throw new BadRequestException('page must be positive; limit must be between 1 and 100');
    }
    return await this.adminsService.getDoctorProfiles(page, limit, status);
  }

  @Get('doctor-profiles/:id')
  async getDoctorProfileById(@Param('id', ParseIntPipe) id: number) {
    return await this.adminsService.getDoctorProfileById(id);
  }

  @Patch('doctor-profiles/:id/verification')
  async verifyDoctor(
    @Req() req: AdminRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyDoctorDto,
  ) {
    return await this.adminsService.verifyDoctor(id, req.user.admin_id, dto);
  }
}
