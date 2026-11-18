import {
  ForbiddenException,
  NotFoundException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { PatientsService } from './patients.service.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Get(':id')
  async getPatientById(@Param('id') id: string, @Req() req: any) {
    if (req.user.id !== id) {
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

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Patch('updatePatientPartially/:id')
  async updatePatientPartially(
    @Param('id') id: string,
    @Body() patient: UpdatePatientDto,
    @Req() req: any,
  ) {
    if (req.user.id !== id) {
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

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Delete(':id')
  async deletePatientById(@Param('id') id: string, @Req() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return await this.patientsService.deletePatient(id);
  }
}
