import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { Request } from 'express';
import type { Doctors } from './entities/doctors.entity.js';
import { JwtGuards } from '../common/guards/jwt-auth.guard.js';
import { CreateTestRequestDto } from './dtos/create-test-request.dto.js';
import { UpdateTestRequestDto } from './dtos/update-test-request.dto.js';
import { CreateDoctorAdviceDto } from './dtos/create-doctor-advice.dto.js';
import { UpdateDoctorAdviceDto } from './dtos/update-doctor-advice.dto.js';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dtos/create-doctor.dto.js';
import { UpdateDoctorDto } from './dtos/update-doctor.dto.js';
import { CreateDoctorProfileDto } from './dtos/create-doctor-profile.dto.js';
import { UpdateDoctorProfileDto } from './dtos/update-doctor-profile.dto.js';

type DoctorRequest = Request & { user: Doctors };

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
  ) {}

  @Post()
  async createDoctor(@Body() doctor: CreateDoctorDto) {
    return await this.doctorsService.createDoctor(doctor);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getAllDoctors(
    @Req() req: DoctorRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 || limit < 1 || limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new BadRequestException(
        'page must be a positive integer; limit must be between 1 and 100',
      );
    }

    return await this.doctorsService.getAllDoctors(page, limit, req.user.doctor_id);
  }

  @Get('profiles')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getAllDoctorProfiles(
    @Req() req: DoctorRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 || limit < 1 || limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new BadRequestException(
        'page must be a positive integer; limit must be between 1 and 100',
      );
    }

    return await this.doctorsService.getAllDoctorProfiles(page, limit, req.user.doctor_id);
  }

  @Get('profiles/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getDoctorProfileById(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.checkProfileOwner(req.user.doctor_id, id);
    return await this.doctorsService.getDoctorProfileById(id);
  }

  @Post('advice')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async createDoctorAdvice(
    @Req() req: DoctorRequest,
    @Body() dto: CreateDoctorAdviceDto,
  ) {
    return await this.doctorsService.createDoctorAdvice(dto, req.user.doctor_id);
  }

  @Get('advice')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getAllDoctorAdvice(
    @Req() req: DoctorRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 || limit < 1 || limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new BadRequestException(
        'page must be a positive integer; limit must be between 1 and 100',
      );
    }

    return await this.doctorsService.getAllDoctorAdvice(page, limit, req.user.doctor_id);
  }

  @Get('advice/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getDoctorAdviceById(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.getDoctorAdviceById(id, req.user.doctor_id);
  }

  @Post('advice/:id/publish')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async publishDoctorAdvice(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.publishDoctorAdvice(id, req.user.doctor_id);
  }

  @Patch('advice/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async updateDoctorAdvice(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorAdviceDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide an advice field to update');
    }

    return await this.doctorsService.updateDoctorAdvice(id, dto, req.user.doctor_id);
  }

  @Delete('advice/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async deleteDoctorAdvice(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.deleteDoctorAdvice(id, req.user.doctor_id);
  }

  @Post('test-requests')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async createTestRequest(
    @Req() req: DoctorRequest,
    @Body() dto: CreateTestRequestDto,
  ) {
    return await this.doctorsService.createTestRequest(dto, req.user.doctor_id);
  }

  @Get('test-requests')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getAllTestRequests(
    @Req() req: DoctorRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (
      !Number.isSafeInteger(page) ||
      !Number.isSafeInteger(limit) ||
      page < 1 || limit < 1 || limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new BadRequestException(
        'page must be a positive integer; limit must be between 1 and 100',
      );
    }

    return await this.doctorsService.getAllTestRequests(page, limit, req.user.doctor_id);
  }

  @Get('test-requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getTestRequestById(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.getTestRequestById(id, req.user.doctor_id);
  }

  @Patch('test-requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async updateTestRequest(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestRequestDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide a test request field to update');
    }

    return await this.doctorsService.updateTestRequest(id, dto, req.user.doctor_id);
  }

  @Delete('test-requests/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async deleteTestRequest(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.deleteTestRequest(id, req.user.doctor_id);
  }

  @Get('verified')
  async getVerifiedDoctors(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    if (!Number.isSafeInteger(page) || page < 1 || limit < 1 || limit > 100 ||
        !Number.isSafeInteger((page - 1) * limit)) {
      throw new BadRequestException('page must be positive; limit must be between 1 and 100');
    }
    return await this.doctorsService.getVerifiedDoctors(page, limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async getDoctorById(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.checkDoctorOwner(req.user.doctor_id, id);
    return await this.doctorsService.getDoctorById(id);
  }

  @Patch('profiles/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async updateDoctorProfile(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Provide at least one profile field to update',
      );
    }

    await this.checkProfileOwner(req.user.doctor_id, id);
    return await this.doctorsService.updateDoctorProfile(id, dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async updateDoctor(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Provide at least one field to update',
      );
    }

    this.checkDoctorOwner(req.user.doctor_id, id);
    return await this.doctorsService.updateDoctor(id, dto);
  }

  @Delete('profiles/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async deleteDoctorProfile(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.checkProfileOwner(req.user.doctor_id, id);
    return await this.doctorsService.deleteDoctorProfile(id);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async deleteDoctor(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.checkDoctorOwner(req.user.doctor_id, id);
    return await this.doctorsService.deleteDoctor(id);
  }

  @Post('profiles')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async createDoctorProfile(
    @Req() req: DoctorRequest,
    @Body() dto: CreateDoctorProfileDto,
  ) {
    return await this.doctorsService.createDoctorProfile(dto, req.user.doctor_id);
  }

  @Post('profiles/:id/submit')
  @ApiBearerAuth()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('DOCTOR')
  async submitDoctorProfile(
    @Req() req: DoctorRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.checkProfileOwner(req.user.doctor_id, id);
    return await this.doctorsService.submitDoctorProfile(id);
  }

  private checkDoctorOwner(loggedInDoctorId: number, recordDoctorId: number) {
    if (loggedInDoctorId !== recordDoctorId) {
      throw new ForbiddenException('You cannot access another doctor account');
    }
  }

  private async checkProfileOwner(loggedInDoctorId: number, profileId: number) {
    const profile = await this.doctorsService.getDoctorProfileById(profileId);
    if (loggedInDoctorId !== profile.doctor_id) {
      throw new ForbiddenException('You cannot access another doctor profile');
    }
  }
}