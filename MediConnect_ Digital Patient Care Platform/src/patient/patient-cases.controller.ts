import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { PatientCasesService } from './patient-cases.service.js';
import { CreatePatientCaseDto } from './dtos/create-patient-case.dto.js';
import { UpdatePatientCaseDto } from './dtos/update-patient-case.dto.js';

@Controller('patient-cases')
export class PatientCasesController {
  constructor(private readonly patientCasesService: PatientCasesService) {}

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Post()
  async createPatientCase(
    @Req() req: any,
    @Body() patientCase: CreatePatientCaseDto,
  ) {
    return await this.patientCasesService.createPatientCase(
      req.user.id,
      patientCase,
    );
  }

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Get()
  async getMyCases(@Req() req: any, @Query() pagination: PaginationDto) {
    return await this.patientCasesService.getMyCases(req.user.id, pagination);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Get(':id')
  async getMyCaseById(@Req() req: any, @Param('id') id: string) {
    return await this.patientCasesService.getMyCaseById(req.user.id, id);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Patch(':id')
  async updatePatientCase(
    @Req() req: any,
    @Param('id') id: string,
    @Body() patientCase: UpdatePatientCaseDto,
  ) {
    return await this.patientCasesService.updatePatientCase(
      req.user.id,
      id,
      patientCase,
    );
  }

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Delete(':id')
  async deletePatientCase(@Req() req: any, @Param('id') id: string) {
    return await this.patientCasesService.deletePatientCase(req.user.id, id);
  }
}
