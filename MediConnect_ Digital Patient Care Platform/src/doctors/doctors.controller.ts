import { CreateTestRequestDto } from './dtos/create-test-request.dto.js';
import { UpdateTestRequestDto } from './dtos/update-test-request.dto.js';
import { CreateDoctorAdviceDto } from './dtos/create-doctor-advice.dto.js';
import { UpdateDoctorAdviceDto } from './dtos/update-doctor-advice.dto.js';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { DoctorsService } from './doctors.service.js';
import { CreateDoctorDto } from './dtos/create-doctor.dto.js';
import { UpdateDoctorDto } from './dtos/update-doctor.dto.js';
import { CreateDoctorProfileDto } from './dtos/create-doctor-profile.dto.js';
import { UpdateDoctorProfileDto } from './dtos/update-doctor-profile.dto.js';

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
  async getAllDoctors() {
    return await this.doctorsService.getAllDoctors();
  }

  @Get('profiles')
  async getAllDoctorProfiles() {
    return await this.doctorsService.getAllDoctorProfiles();
  }

  @Get('profiles/:id')
  async getDoctorProfileById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.getDoctorProfileById(id);
  }

  @Post('advice')
  async createDoctorAdvice(@Body() dto: CreateDoctorAdviceDto) {
    return await this.doctorsService.createDoctorAdvice(dto);
  }

  @Get('advice')
  async getAllDoctorAdvice() {
    return await this.doctorsService.getAllDoctorAdvice();
  }

  @Get('advice/:id')
  async getDoctorAdviceById(@Param('id', ParseIntPipe) id: number) {
    return await this.doctorsService.getDoctorAdviceById(id);
  }

  @Patch('advice/:id')
  async updateDoctorAdvice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorAdviceDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide an advice field to update');
    }

    return await this.doctorsService.updateDoctorAdvice(id, dto);
  }

  @Delete('advice/:id')
  async deleteDoctorAdvice(@Param('id', ParseIntPipe) id: number) {
    return await this.doctorsService.deleteDoctorAdvice(id);
  }

  @Post('test-requests')
  async createTestRequest(@Body() dto: CreateTestRequestDto) {
    return await this.doctorsService.createTestRequest(dto);
  }

  @Get('test-requests')
  async getAllTestRequests() {
    return await this.doctorsService.getAllTestRequests();
  }

  @Get('test-requests/:id')
  async getTestRequestById(@Param('id', ParseIntPipe) id: number) {
    return await this.doctorsService.getTestRequestById(id);
  }

  @Patch('test-requests/:id')
  async updateTestRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestRequestDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('Provide a test request field to update');
    }

    return await this.doctorsService.updateTestRequest(id, dto);
  }

  @Delete('test-requests/:id')
  async deleteTestRequest(@Param('id', ParseIntPipe) id: number) {
    return await this.doctorsService.deleteTestRequest(id);
  }

  @Get(':id')
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.getDoctorById(id);
  }

  @Patch('profiles/:id')
  async updateDoctorProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Provide at least one profile field to update',
      );
    }

    return await this.doctorsService.updateDoctorProfile(id, dto);
  }

  @Patch(':id')
  async updateDoctor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDoctorDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Provide at least one field to update',
      );
    }

    return await this.doctorsService.updateDoctor(id, dto);
  }

  @Delete('profiles/:id')
  async deleteDoctorProfile(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.deleteDoctorProfile(id);
  }

  @Delete(':id')
  async deleteDoctor(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.deleteDoctor(id);
  }

  @Post('profiles')
  async createDoctorProfile(@Body() dto: CreateDoctorProfileDto) {
    return await this.doctorsService.createDoctorProfile(dto);
  }
}