import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoordinatorService } from './coordinator.service.js';
import { ArrangeTestDto } from './dto/arrange-test.dto.js';
import { RecordDecisionDto } from './dto/record-decision.dto.js';
import { ReviewReportDto } from './dto/review-report.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { UpdateCoordinatorDto } from './dto/update-coordinator.dto.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto.js';
import { CreateFollowUpDto } from './dto/create-follow-up.dto.js';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto.js';
import { CreateReminderDto } from './dto/create-reminder.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { PaginationDto } from './dto/pagination.dto.js';
import {
  AssignCaseDto,
  RequestDiagnosticTestDto,
  SubmitReportDto,
} from './dto/workflow.dto.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import type { AuthActor } from '../auth/auth.types.js';
import {
  ApproveCoordinatorApplicationDto,
  CreateCoordinatorApplicationDto,
} from './dto/coordinator-application.dto.js';

@ApiTags('Coordinator Applications')
@Controller('coordinator/applications')
@ApiBearerAuth()
export class CoordinatorApplicationController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Post()
  @ApiOperation({ security: [] })
  async apply(@Body() dto: CreateCoordinatorApplicationDto) {
    return await this.coordinatorService.submitApplication(dto);
  }

  @Get()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('ADMIN')
  async listApplications(@Query() page: PaginationDto) {
    return await this.coordinatorService.listApplications(page);
  }

  @Post(':applicationId/approve')
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('ADMIN')
  async approve(
    @CurrentUser() actor: AuthActor,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ApproveCoordinatorApplicationDto,
  ) {
    return await this.coordinatorService.approveApplication(
      actor.sub,
      applicationId,
      dto,
    );
  }
}

@ApiTags('Admins')
@Controller('admins/coordinator-applications')
@ApiBearerAuth()
@UseGuards(JwtGuards, RolesGuard)
@Roles('ADMIN')
export class AdminCoordinatorApplicationsController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  @ApiOperation({ summary: 'List pending coordinator applications for Admin review' })
  async listApplications(@Query() page: PaginationDto) {
    return await this.coordinatorService.listApplications(page);
  }

  @Patch(':applicationId/approve')
  @ApiOperation({ summary: 'Approve a coordinator application and create the coordinator account' })
  async approve(
    @CurrentUser() actor: AuthActor,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ApproveCoordinatorApplicationDto,
  ) {
    return await this.coordinatorService.approveApplication(actor.sub, applicationId, dto);
  }
}

@ApiTags('Coordinator')
@Controller('coordinator')
@ApiBearerAuth()
@UseGuards(JwtGuards, RolesGuard)
@Roles('coordinator')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Post('accounts')
  @Roles('ADMIN')
  async createCoordinator(
    @CurrentUser() actor: AuthActor,
    @Body() dto: CreateCoordinatorDto,
  ) {
    return await this.coordinatorService.createCoordinator(actor.sub, dto);
  }

  @Get('accounts')
  @Roles('ADMIN')
  async listCoordinators(@Query() page: PaginationDto) {
    return await this.coordinatorService.listCoordinators(page);
  }

  @Get('accounts/:coordinatorId')
  @Roles('ADMIN')
  async getCoordinator(@Param('coordinatorId') coordinatorId: string) {
    return await this.coordinatorService.getCoordinator(coordinatorId);
  }

  @Patch('accounts/:coordinatorId')
  @Roles('ADMIN')
  async updateCoordinator(
    @Param('coordinatorId') coordinatorId: string,
    @Body() dto: UpdateCoordinatorDto,
  ) {
    return await this.coordinatorService.updateCoordinator(
      coordinatorId,
      dto,
      true,
    );
  }

  @Delete('accounts/:coordinatorId')
  @Roles('ADMIN')
  @HttpCode(204)
  async deleteCoordinator(@Param('coordinatorId') coordinatorId: string) {
    return await this.coordinatorService.deleteCoordinator(coordinatorId);
  }

  @Get('profile')
  async getCoordinatorProfile(@CurrentUser() actor: AuthActor) {
    return await this.coordinatorService.getCoordinator(actor.sub);
  }

  @Patch('profile')
  async updateCoordinatorProfile(
    @CurrentUser() actor: AuthActor,
    @Body() dto: UpdateCoordinatorDto,
  ) {
    return await this.coordinatorService.updateCoordinator(
      actor.sub,
      dto,
      false,
    );
  }

  @Get('cases')
  async listCases(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listCases(actor.sub, page);
  }

  @Get('cases/:caseId')
  async getCase(
    @CurrentUser() actor: AuthActor,
    @Param('caseId') caseId: string,
  ) {
    return await this.coordinatorService.getCase(actor.sub, caseId);
  }

  @Patch('cases/:caseId/assignment')
  @Roles('ADMIN')
  async assignCase(
    @Param('caseId') caseId: string,
    @Body() dto: AssignCaseDto,
  ) {
    return await this.coordinatorService.assignCase(caseId, dto.coordinatorId);
  }

  @Post('cases/:caseId/test-requests')
  @Roles('DOCTOR')
  async createTestRequest(
    @CurrentUser() actor: AuthActor,
    @Param('caseId') caseId: string,
    @Body() dto: RequestDiagnosticTestDto,
  ) {
    return await this.coordinatorService.createTestRequest(
      actor.sub,
      caseId,
      dto,
    );
  }

  @Get('test-requests/:requestId')
  @Roles('DOCTOR')
  async getDoctorTestRequest(
    @CurrentUser() actor: AuthActor,
    @Param('requestId', ParseIntPipe) requestId: number,
  ) {
    return await this.coordinatorService.getDoctorTestRequest(
      actor.sub,
      requestId,
    );
  }

  @Post('test-requests/:requestId/report')
  @Roles('diagnostic_center')
  async submitReport(
    @CurrentUser() actor: AuthActor,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: SubmitReportDto,
  ) {
    return await this.coordinatorService.submitReport(
      actor.sub,
      requestId,
      dto,
    );
  }

  @Post('tasks')
  @Roles('ADMIN')
  async createTask(@Body() dto: CreateTaskDto) {
    return await this.coordinatorService.createTask(dto);
  }

  @Get('tasks')
  async listTasks(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listTasks(actor.sub, page);
  }

  @Get('tasks/:taskId')
  async getTask(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return await this.coordinatorService.getTask(actor.sub, taskId);
  }

  @Patch('tasks/:taskId')
  async updateTask(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return await this.coordinatorService.updateTask(
      actor.sub,
      taskId,
      dto.note,
    );
  }

  @Delete('tasks/:taskId')
  @HttpCode(204)
  async deleteTask(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return await this.coordinatorService.deleteTask(actor.sub, taskId);
  }

  @Post('tasks/:taskId/activities')
  async recordContact(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return await this.coordinatorService.recordContact(
      actor.sub,
      taskId,
      dto.note,
    );
  }

  @Get('tasks/:taskId/activities')
  async listActivities(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listActivities(
      actor.sub,
      taskId,
      page,
    );
  }

  @Patch('tasks/:taskId/decision')
  async recordDecision(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: RecordDecisionDto,
  ) {
    return await this.coordinatorService.recordDecision(
      actor.sub,
      taskId,
      dto.decision,
    );
  }

  @Patch('tasks/:taskId/arrange')
  async arrangeTest(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return await this.coordinatorService.arrangeTest(actor.sub, taskId);
  }

  @Get('diagnostic-centers')
  @Roles('patient', 'coordinator')
  async listCenters(@Query() page: PaginationDto) {
    return await this.coordinatorService.listCenters(page);
  }

  @Get('patient/test-requests')
  @Roles('patient')
  async listPatientRequests(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listPatientRequests(actor.sub, page);
  }

  @Patch('test-requests/:requestId/center')
  @Roles('patient')
  async selectCenter(
    @CurrentUser() actor: AuthActor,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: ArrangeTestDto,
  ) {
    return await this.coordinatorService.selectCenter(
      actor.sub,
      requestId,
      dto.centerId,
    );
  }

  @Get('center/test-requests')
  @Roles('diagnostic_center')
  async listCenterRequests(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listCenterRequests(actor.sub, page);
  }

  @Get('tasks/:taskId/report')
  async getReport(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return await this.coordinatorService.getReport(actor.sub, taskId);
  }

  @Patch('tasks/:taskId/report')
  async reviewReport(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: ReviewReportDto,
  ) {
    return await this.coordinatorService.reviewReport(
      actor.sub,
      taskId,
      dto.checkStatus,
    );
  }

  @Patch('tasks/:taskId/report/forward')
  async forwardReport(
    @CurrentUser() actor: AuthActor,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return await this.coordinatorService.forwardReport(actor.sub, taskId);
  }

  @Post('follow-ups')
  async createFollowUp(
    @CurrentUser() actor: AuthActor,
    @Body() dto: CreateFollowUpDto,
  ) {
    return await this.coordinatorService.createFollowUp(actor.sub, dto);
  }

  @Get('follow-ups')
  async listFollowUps(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listFollowUps(actor.sub, page);
  }

  @Get('follow-ups/:followupId')
  async getFollowUp(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
  ) {
    return await this.coordinatorService.getFollowUp(actor.sub, followupId);
  }

  @Patch('follow-ups/:followupId')
  async updateFollowUp(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Body() dto: UpdateFollowUpDto,
  ) {
    return await this.coordinatorService.updateFollowUp(
      actor.sub,
      followupId,
      dto,
    );
  }

  @Delete('follow-ups/:followupId')
  @HttpCode(204)
  async deleteFollowUp(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
  ) {
    return await this.coordinatorService.deleteFollowUp(actor.sub, followupId);
  }

  @Post('follow-ups/:followupId/reminders')
  async createReminder(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Body() dto: CreateReminderDto,
  ) {
    return await this.coordinatorService.createReminder(
      actor.sub,
      followupId,
      dto.message,
    );
  }

  @Get('follow-ups/:followupId/reminders')
  async listReminders(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listReminders(
      actor.sub,
      followupId,
      page,
    );
  }

  @Get('follow-ups/:followupId/reminders/:reminderId')
  async getReminder(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    return await this.coordinatorService.getReminder(
      actor.sub,
      followupId,
      reminderId,
    );
  }

  @Patch('follow-ups/:followupId/reminders/:reminderId')
  async updateReminder(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return await this.coordinatorService.updateReminder(
      actor.sub,
      followupId,
      reminderId,
      dto,
    );
  }

  @Delete('follow-ups/:followupId/reminders/:reminderId')
  @HttpCode(204)
  async deleteReminder(
    @CurrentUser() actor: AuthActor,
    @Param('followupId', ParseUUIDPipe) followupId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    return await this.coordinatorService.deleteReminder(
      actor.sub,
      followupId,
      reminderId,
    );
  }

  @Get('patient/reminders')
  @Roles('patient')
  async listPatientReminders(
    @CurrentUser() actor: AuthActor,
    @Query() page: PaginationDto,
  ) {
    return await this.coordinatorService.listPatientReminders(actor.sub, page);
  }
}
