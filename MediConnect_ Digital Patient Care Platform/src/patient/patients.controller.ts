import {
  ForbiddenException,
  NotFoundException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { PatientsService } from './patients.service.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth('JWT')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get('dashboard')
  @ApiOperation({ summary: 'View the logged-in patient case, payment and follow-up counts' })
  @ApiResponse({ status: 200, description: 'Patient dashboard returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMyDashboard(@Req() req: any) {
    return await this.patientsService.getMyDashboard(req.user.id);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get('follow-ups')
  @ApiOperation({ summary: 'List the logged-in patient follow-up schedules with pagination' })
  @ApiResponse({ status: 200, description: 'Own follow-up schedules returned' })
  @ApiResponse({ status: 400, description: 'Invalid pagination' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMyFollowUps(@Req() req: any, @Query() pagination: PaginationDto) {
    return await this.patientsService.getMyFollowUps(req.user.id, pagination);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get('follow-ups/:id')
  @ApiOperation({ summary: 'View one of the logged-in patient follow-up schedules' })
  @ApiResponse({ status: 200, description: 'Own follow-up schedule returned' })
  @ApiResponse({ status: 400, description: 'Invalid follow-up UUID' })
  @ApiResponse({ status: 404, description: 'Schedule not found or not owned by patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMyFollowUpById(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return await this.patientsService.getMyFollowUpById(req.user.id, id);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get(':id')
  @ApiOperation({ summary: 'Get the logged-in patient own profile' })
  @ApiResponse({ status: 200, description: 'Patient profile returned' })
  @ApiResponse({ status: 403, description: 'Trying to access another patient' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
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
  @Roles('patient')
  @Patch('updatePatientPartially/:id')
  @ApiOperation({ summary: 'Partially update the logged-in patient profile' })
  @ApiResponse({ status: 200, description: 'Patient profile updated' })
  @ApiResponse({ status: 400, description: 'Invalid or protected field in update body' })
  @ApiResponse({ status: 409, description: 'Email already exists or account changed' })
  @ApiResponse({ status: 403, description: 'Trying to update another patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
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
  @Roles('patient')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete the logged-in patient account' })
  @ApiResponse({ status: 200, description: 'Patient deleted' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 409, description: 'Patient has related records' })
  @ApiResponse({ status: 403, description: 'Trying to delete another patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async deletePatientById(@Param('id') id: string, @Req() req: any) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    return await this.patientsService.deletePatient(id);
  }
}
