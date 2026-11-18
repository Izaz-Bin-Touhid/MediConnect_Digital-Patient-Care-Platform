import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuards } from '../auth/jwtGuards.js';
import { PaginationDto } from '../patients/dtos/pagination.dto.js';
import { PatientCareService } from './patient-care.service.js';
import { TestDecisionDto } from './dtos/test-decision.dto.js';
import { SelectCenterDto } from './dtos/select-center.dto.js';

@Controller('patient-cases/:caseId')
export class PatientCareController {
  constructor(private readonly patientCareService: PatientCareService) {}

  @UseGuards(JwtGuards)
  @Get('test-requests')
  async getTestRequests(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getTestRequests(
      req.user.id,
      caseId,
      pagination,
    );
  }

  @UseGuards(JwtGuards)
  @Get('test-requests/:requestId')
  async getTestRequest(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('requestId') requestId: string,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getTestRequest(
      req.user.id,
      caseId,
      requestId,
    );
  }

  @UseGuards(JwtGuards)
  @Patch('test-requests/:requestId/decision')
  async recordTestDecision(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('requestId') requestId: string,
    @Body() decision: TestDecisionDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.recordTestDecision(
      req.user.id,
      caseId,
      requestId,
      decision,
    );
  }

  @UseGuards(JwtGuards)
  @Patch('test-requests/:requestId/center')
  async selectCenter(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('requestId') requestId: string,
    @Body() selection: SelectCenterDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.selectCenter(
      req.user.id,
      caseId,
      requestId,
      selection,
    );
  }

  @UseGuards(JwtGuards)
  @Get('advice')
  async getAdvice(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getAdvice(
      req.user.id,
      caseId,
      pagination,
    );
  }

  @UseGuards(JwtGuards)
  @Get('advice/:adviceId')
  async getAdviceById(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('adviceId') adviceId: string,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getAdviceById(
      req.user.id,
      caseId,
      adviceId,
    );
  }

  @UseGuards(JwtGuards)
  @Get('reports')
  async getReports(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getReports(
      req.user.id,
      caseId,
      pagination,
    );
  }

  @UseGuards(JwtGuards)
  @Get('reports/:reportId')
  async getReportById(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('reportId') reportId: string,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getReportById(
      req.user.id,
      caseId,
      reportId,
    );
  }

  @UseGuards(JwtGuards)
  @Get('followups')
  async getFollowups(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getFollowups(
      req.user.id,
      caseId,
      pagination,
    );
  }

  @UseGuards(JwtGuards)
  @Get('followups/:followupId')
  async getFollowupById(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('followupId') followupId: string,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getFollowupById(
      req.user.id,
      caseId,
      followupId,
    );
  }

  @UseGuards(JwtGuards)
  @Get('followups/:followupId/reminders')
  async getReminders(
    @Req() req: any,
    @Param('caseId') caseId: string,
    @Param('followupId') followupId: string,
    @Query() pagination: PaginationDto,
  ) {
    if (req.user.role !== 'patient') {
      throw new ForbiddenException('Only patients can use this route');
    }
    return await this.patientCareService.getReminders(
      req.user.id,
      caseId,
      followupId,
      pagination,
    );
  }
}
