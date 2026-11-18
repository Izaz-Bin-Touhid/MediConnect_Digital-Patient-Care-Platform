import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../patients/dtos/pagination.dto.js';
import { JwtGuards } from '../auth/jwtGuards.js';
import { PatientCasesService } from './patient-cases.service.js';
import { CreatePatientCaseDto } from './dtos/create-patient-case.dto.js';
import { UpdatePatientCaseDto } from './dtos/update-patient-case.dto.js';

@Controller('patient-cases')
export class PatientCasesController {
  constructor(private readonly patientCasesService: PatientCasesService) {}

  @UseGuards(JwtGuards)
  @Post()
  async createPatientCase(
    @Req() req: any,
    @Body() patientCase: CreatePatientCaseDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }

    return await this.patientCasesService.createPatientCase(
      req.user.id,
      patientCase,
    );
  }

  @UseGuards(JwtGuards)
  @Get()
  async getMyCases(@Req() req: any, @Query() pagination: PaginationDto) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }

    return await this.patientCasesService.getMyCases(req.user.id, pagination);
  }

  @UseGuards(JwtGuards)
  @Get(':id')
  async getMyCaseById(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }

    return await this.patientCasesService.getMyCaseById(req.user.id, id);
  }

  @UseGuards(JwtGuards)
  @Patch(':id')
  async updatePatientCase(
    @Req() req: any,
    @Param('id') id: string,
    @Body() patientCase: UpdatePatientCaseDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }

    return await this.patientCasesService.updatePatientCase(
      req.user.id,
      id,
      patientCase,
    );
  }

  @UseGuards(JwtGuards)
  @Delete(':id')
  async deletePatientCase(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }

    return await this.patientCasesService.deletePatientCase(req.user.id, id);
  }
}
