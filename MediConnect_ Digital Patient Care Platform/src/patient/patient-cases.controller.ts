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
} from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { PatientCasesService } from './patient-cases.service.js';
import { CreatePatientCaseDto } from './dtos/create-patient-case.dto.js';
import { UpdatePatientCaseDto } from './dtos/update-patient-case.dto.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Patient Cases')
@ApiBearerAuth('JWT')
@Controller('patient-cases')
export class PatientCasesController {
  constructor(private readonly patientCasesService: PatientCasesService) {}

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Post()
  @ApiOperation({ summary: 'Create a patient consultation case' })
  @ApiResponse({ status: 201, description: 'Patient case created in draft status' })
  @ApiResponse({ status: 400, description: 'Invalid case body' })
  @ApiResponse({ status: 404, description: 'Patient or doctor not found' })
  @ApiResponse({ status: 409, description: 'Case ID or code already exists' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
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
  @Roles('patient')
  @Get()
  @ApiOperation({ summary: 'List the logged-in patient own cases with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated patient cases returned' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMyCases(@Req() req: any, @Query() pagination: PaginationDto) {
    return await this.patientCasesService.getMyCases(req.user.id, pagination);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get(':id/advice')
  @ApiOperation({ summary: 'View published doctor advice for an own patient case' })
  @ApiResponse({ status: 200, description: 'Published advice returned with pagination' })
  @ApiResponse({ status: 404, description: 'Case not found or not owned by patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getPublishedAdvice(
    @Req() req: any,
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    return await this.patientCasesService.getPublishedAdvice(req.user.id, id, pagination);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Get(':id')
  @ApiOperation({ summary: 'Get one of the logged-in patient own cases' })
  @ApiResponse({ status: 200, description: 'Patient case returned' })
  @ApiResponse({ status: 404, description: 'Case not found or not owned by patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMyCaseById(@Req() req: any, @Param('id') id: string) {
    return await this.patientCasesService.getMyCaseById(req.user.id, id);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Patch(':id')
  @ApiOperation({ summary: 'Update a draft patient case' })
  @ApiResponse({ status: 200, description: 'Draft patient case updated' })
  @ApiResponse({ status: 400, description: 'Invalid or protected field in update body' })
  @ApiResponse({ status: 409, description: 'Case is not draft or changed' })
  @ApiResponse({ status: 404, description: 'Case not found or not owned by patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
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
  @Roles('patient')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a draft patient case' })
  @ApiResponse({ status: 200, description: 'Draft patient case deleted' })
  @ApiResponse({ status: 409, description: 'Case is not draft or has related records' })
  @ApiResponse({ status: 404, description: 'Case not found or not owned by patient' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async deletePatientCase(@Req() req: any, @Param('id') id: string) {
    return await this.patientCasesService.deletePatientCase(req.user.id, id);
  }
}
