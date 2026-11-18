import {
  ForbiddenException,
  NotFoundException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from './dtos/pagination.dto.js';
import { PatientsService } from './patients.service.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';
import { JwtGuards } from '../auth/jwtGuards.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @UseGuards(JwtGuards)
  @Get('diagnostic-centers')
  async getDiagnosticCenters(
    @Req() req: any,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientsService.getDiagnosticCenters(pagination);
  }

  @UseGuards(JwtGuards)
  @Get(':id')
  async getPatientById(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'patient' || req.user.id !== id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    const patient = await this.patientsService.getPatientById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      patientId: patient.patientId,
      fullName: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      role: patient.role,
    };
  }

  @UseGuards(JwtGuards)
  @Patch('updatePatientPartially/:id')
  async updatePatientPartially(
    @Param('id') id: string,
    @Body() patient: UpdatePatientDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'patient' || req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const updatedPatient = await this.patientsService.updatePatient(
      id,
      patient,
    );

    return {
      patientId: updatedPatient.patientId,
      fullName: updatedPatient.fullName,
      email: updatedPatient.email,
      phone: updatedPatient.phone,
      role: updatedPatient.role,
    };
  }

  @UseGuards(JwtGuards)
  @Delete(':id')
  async deletePatientById(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'patient' || req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return await this.patientsService.deletePatient(id);
  }
}
