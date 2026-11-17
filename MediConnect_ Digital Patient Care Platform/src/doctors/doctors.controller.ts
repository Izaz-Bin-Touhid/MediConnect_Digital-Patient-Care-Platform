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

  @Get(':id')
  async getDoctorById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.getDoctorById(id);
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

  @Delete(':id')
  async deleteDoctor(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.doctorsService.deleteDoctor(id);
  }
}