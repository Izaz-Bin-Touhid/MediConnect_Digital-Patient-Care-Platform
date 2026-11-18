import { randomBytes } from 'node:crypto';
import { AuditService } from '../audit/audit.service.js';
import { MailService } from '../mail/mail.service.js';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { TestRequest } from '../doctors/entities/test-request.entity.js';
import { PatientCases } from '../patient/entities/patient-cases.entity.js';
import { Payments } from '../patient/entities/payments.entity.js';
import { UpdateCoordinatorDto } from './dto/update-coordinator.dto.js';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto.js';
import { CreateFollowUpDto } from './dto/create-follow-up.dto.js';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { PaginationDto } from './dto/pagination.dto.js';
import {
  RequestDiagnosticTestDto,
  SubmitReportDto,
} from './dto/workflow.dto.js';
import { UpdateReminderDto } from './dto/update-reminder.dto.js';
import { CoordinationActivity } from './entities/coordination-activity.entity.js';
import { CoordinatorProfile } from './entities/coordinator-profile.entity.js';
import { CoordinationTask } from './entities/coordination-task.entity.js';
import { DiagnosticCenter } from './entities/diagnostic-center.entity.js';
import { DiagnosticReport } from './entities/diagnostic-report.entity.js';
import { FollowUpSchedule } from './entities/follow-up-schedule.entity.js';
import { Reminder } from './entities/reminder.entity.js';
import { AuthService } from '../auth/auth.service.js';
import {
  ApproveCoordinatorApplicationDto,
  CreateCoordinatorApplicationDto,
} from './dto/coordinator-application.dto.js';
import { CoordinatorApplication } from './entities/coordinator-application.entity.js';

@Injectable()
export class CoordinatorService {
  constructor(
    @InjectRepository(CoordinatorProfile)
    private readonly coordinatorRepo: Repository<CoordinatorProfile>,
    @InjectRepository(CoordinatorApplication)
    private readonly applicationRepo: Repository<CoordinatorApplication>,
    @InjectRepository(PatientCases)
    private readonly caseRepo: Repository<PatientCases>,
    @InjectRepository(CoordinationTask)
    private readonly taskRepo: Repository<CoordinationTask>,
    @InjectRepository(CoordinationActivity)
    private readonly activityRepo: Repository<CoordinationActivity>,
    @InjectRepository(DiagnosticCenter)
    private readonly centerRepo: Repository<DiagnosticCenter>,
    @InjectRepository(DiagnosticReport)
    private readonly reportRepo: Repository<DiagnosticReport>,
    @InjectRepository(TestRequest)
    private readonly testRequestRepo: Repository<TestRequest>,
    @InjectRepository(FollowUpSchedule)
    private readonly followUpRepo: Repository<FollowUpSchedule>,
    @InjectRepository(Reminder)
    private readonly reminderRepo: Repository<Reminder>,
    private readonly dataSource: DataSource,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    private readonly authService: AuthService,
  ) {}

  async submitApplication(
    dto: CreateCoordinatorApplicationDto,
  ): Promise<Pick<CoordinatorApplication, 'applicationId'>> {
    try {
      const application = await this.auditService.transaction((manager) =>
        manager.save(this.applicationRepo.create(dto)),
      );
      return { applicationId: application.applicationId };
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listApplications(
    page: PaginationDto,
  ): Promise<CoordinatorApplication[]> {
    try {
      return await this.applicationRepo.find({
        where: { approvedAt: IsNull() },
        order: { createdAt: 'ASC', applicationId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async approveApplication(
    adminId: string,
    applicationId: string,
    dto: ApproveCoordinatorApplicationDto,
  ): Promise<Omit<CoordinatorProfile, 'password'>> {
    try {
      const password = await this.authService.hashPassword(dto.password);
      const coordinator = await this.auditService.transaction(
        async (manager) => {
          const application = await manager.findOne(CoordinatorApplication, {
            where: { applicationId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!application) {
            throw new NotFoundException('Coordinator application not found');
          }
          if (application.approvedAt) {
            throw new ConflictException(
              'Coordinator application has already been approved',
            );
          }

          const { password: _password, ...profile } =
            await this.saveCoordinator(
              manager.getRepository(CoordinatorProfile),
              adminId,
              {
                email: dto.email,
                password: dto.password,
                staffId: dto.staffId,
                fullName: application.fullName,
                phone: application.phone,
              },
              password,
            );
          application.approvedAt = new Date();
          await manager.save(application);
          return profile;
        },
      );
      await this.mailService.notifyCoordinatorApproval(coordinator.email);
      return coordinator;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async createCoordinator(
    adminId: string,
    dto: CreateCoordinatorDto,
  ): Promise<Omit<CoordinatorProfile, 'password'>> {
    try {
      const password = await this.authService.hashPassword(dto.password);
      const { password: _password, ...saved } =
        await this.auditService.transaction((manager) =>
          this.saveCoordinator(
            manager.getRepository(CoordinatorProfile),
            adminId,
            dto,
            password,
          ),
        );
      return saved;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listCoordinators(page: PaginationDto): Promise<CoordinatorProfile[]> {
    try {
      return await this.coordinatorRepo.find({
        order: { coordinatorId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getCoordinator(coordinatorId: string): Promise<CoordinatorProfile> {
    try {
      const profile = await this.coordinatorRepo.findOneBy({ coordinatorId });
      if (!profile) {
        throw new NotFoundException('Coordinator not found');
      }
      return profile;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async updateCoordinator(
    coordinatorId: string,
    dto: UpdateCoordinatorDto,
    isAdmin: boolean,
  ): Promise<CoordinatorProfile> {
    try {
      if (!isAdmin && dto.staffId !== undefined) {
        throw new BadRequestException(
          'Staff ID is managed by an administrator',
        );
      }

      return await this.auditService.transaction(async (manager) => {
        const profile = await manager.findOne(CoordinatorProfile, {
          where: { coordinatorId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!profile) {
          throw new NotFoundException('Coordinator not found');
        }
        profile.fullName = dto.fullName ?? profile.fullName;
        profile.phone = dto.phone ?? profile.phone;
        profile.staffId = dto.staffId ?? profile.staffId;
        profile.email = dto.email?.toLowerCase() ?? profile.email;
        return manager.save(profile);
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteCoordinator(coordinatorId: string): Promise<void> {
    try {
      const result = await this.auditService.transaction((manager) =>
        manager.delete(CoordinatorProfile, { coordinatorId }),
      );
      if (!result.affected) {
        throw new NotFoundException('Coordinator not found');
      }
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listCases(
    coordinatorId: string,
    page: PaginationDto,
  ): Promise<PatientCases[]> {
    try {
      return await this.caseRepo.find({
        where: { coordinatorId },
        order: { caseId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getCase(coordinatorId: string, caseId: string): Promise<PatientCases> {
    try {
      const patientCase = await this.caseRepo.findOne({
        where: { caseId, coordinatorId },
        relations: { patient: true },
        select: {
          caseId: true, caseCode: true, doctorId: true, coordinatorId: true,
          symptoms: true, duration: true, age: true, gender: true,
          previousIllness: true, description: true, status: true, createdAt: true,
          patient: { patientId: true, fullName: true, email: true, phone: true },
        },
      });
      if (!patientCase) {
        throw new NotFoundException('Assigned case not found');
      }
      return patientCase;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async assignCase(
    caseId: string,
    coordinatorId: string,
  ): Promise<PatientCases> {
    try {
      return await this.auditService.transaction(async (manager) => {
        const patientCase = await this.lockCase(manager, caseId);
        await this.assignPaidCase(manager, patientCase, coordinatorId);
        const requests = await manager.findBy(TestRequest, { case_id: caseId });
        for (const request of requests) {
          if (
            !(await manager.existsBy(CoordinationTask, {
              requestId: request.request_id,
            }))
          ) {
            await this.saveTask(
              manager,
              request.request_id,
              coordinatorId,
              'Diagnostic test coordination assigned',
            );
          }
        }
        return patientCase;
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async createTestRequest(
    doctorId: string,
    caseId: string,
    dto: RequestDiagnosticTestDto,
  ): Promise<TestRequest> {
    try {
      return await this.auditService.transaction(async (manager) => {
        const patientCase = await this.lockCase(manager, caseId);
        if (patientCase.doctorId !== Number(doctorId)) {
          throw new NotFoundException('Case not found');
        }
        await this.requirePaidCase(manager, caseId);
        const request = await manager.save(
          manager.create(TestRequest, {
            test_type: dto.testType,
            notes: dto.notes,
            case_id: caseId,
            request_code: `TEST-${this.shortId()}`,
            status: 'requested',
          }),
        );

        if (patientCase.coordinatorId) {
          await this.saveTask(
            manager,
            request.request_id,
            patientCase.coordinatorId,
            'Doctor requested a diagnostic test',
          );
        }
        return request;
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async createTask(dto: CreateTaskDto): Promise<CoordinationTask> {
    try {
      return await this.auditService.transaction(async (manager) => {
        const request = await manager.findOneBy(TestRequest, {
          request_id: dto.requestId,
        });
        if (!request) {
          throw new NotFoundException('Test request not found');
        }
        const patientCase = await this.lockCase(manager, request.case_id);
        await this.assignPaidCase(manager, patientCase, dto.coordinatorId);
        return this.saveTask(
          manager,
          request.request_id,
          dto.coordinatorId,
          dto.note,
        );
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listTasks(
    coordinatorId: string,
    page: PaginationDto,
  ): Promise<CoordinationTask[]> {
    try {
      return await this.taskRepo.find({
        where: { testRequest: { patientCase: { coordinatorId } } },
        relations: { testRequest: true },
        order: { createdAt: 'DESC', taskId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getTask(
    coordinatorId: string,
    taskId: string,
  ): Promise<CoordinationTask> {
    try {
      const task = await this.taskRepo.findOne({
        where: { taskId, testRequest: { patientCase: { coordinatorId } } },
        relations: { testRequest: true },
      });
      if (!task) {
        throw new NotFoundException('Coordination task not found');
      }
      return task;
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async updateTask(
    coordinatorId: string,
    taskId: string,
    note: string,
  ): Promise<CoordinationTask> {
    try {
      return await this.withTask(
        coordinatorId,
        taskId,
        async (manager, task) => {
          task.note = note;
          return manager.save(task);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteTask(coordinatorId: string, taskId: string): Promise<void> {
    try {
      await this.withTask(
        coordinatorId,
        taskId,
        async (manager, task, request) => {
          if (
            request.status !== 'requested' ||
            (await manager.existsBy(CoordinationActivity, {
              taskId,
              action: 'patient_contacted',
            }))
          ) {
            throw new ConflictException('Coordination has already started');
          }
          await manager.delete(CoordinationActivity, { taskId });
          await manager.delete(CoordinationTask, { taskId: task.taskId });
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async recordContact(
    coordinatorId: string,
    taskId: string,
    note: string,
  ): Promise<CoordinationActivity> {
    try {
      return await this.withTask(coordinatorId, taskId, (manager) =>
        this.activity(
          manager,
          taskId,
          coordinatorId,
          'patient_contacted',
          note,
        ),
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listActivities(
    coordinatorId: string,
    taskId: string,
    page: PaginationDto,
  ): Promise<CoordinationActivity[]> {
    try {
      await this.getTask(coordinatorId, taskId);
      return await this.activityRepo.find({
        where: { taskId },
        order: { createdAt: 'DESC', activityId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async recordDecision(
    coordinatorId: string,
    taskId: string,
    decision: 'accepted' | 'declined',
  ): Promise<TestRequest> {
    try {
      return await this.withTask(
        coordinatorId,
        taskId,
        async (manager, _task, request) => {
          if (request.status !== 'requested') {
            throw new ConflictException(
              'The patient decision has already been recorded',
            );
          }
          request.patient_decision = decision;
          request.decision_date = new Date();
          request.status = decision;
          await this.activity(
            manager,
            taskId,
            coordinatorId,
            `patient_${decision}`,
          );
          return manager.save(request);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async selectCenter(
    patientId: string,
    requestId: number,
    centerId: string,
  ): Promise<TestRequest> {
    try {
      return await this.auditService.transaction(async (manager) => {
        const request = await this.lockRequest(manager, requestId);
        const ownsCase = await manager.existsBy(PatientCases, {
          caseId: request.case_id,
          patient: { patientId },
        });
        if (!ownsCase) {
          throw new NotFoundException('Test request not found');
        }
        if (request.status !== 'accepted') {
          throw new ConflictException(
            'A center can only be selected for an accepted test awaiting arrangement',
          );
        }
        if (!(await manager.existsBy(DiagnosticCenter, { centerId }))) {
          throw new NotFoundException('Diagnostic center not found');
        }
        request.center_id = centerId;
        return manager.save(request);
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listCenters(page: PaginationDto): Promise<DiagnosticCenter[]> {
    try {
      return await this.centerRepo.find({
        select: {
          centerId: true,
          centerName: true,
          location: true,
          phone: true,
        },
        order: { centerName: 'ASC', centerId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listPatientRequests(
    patientId: string,
    page: PaginationDto,
  ): Promise<TestRequest[]> {
    try {
      return await this.testRequestRepo.find({
        where: { patientCase: { patient: { patientId } } },
        order: { request_date: 'DESC', request_id: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listCenterRequests(
    centerId: string,
    page: PaginationDto,
  ): Promise<TestRequest[]> {
    try {
      return await this.testRequestRepo.find({
        where: {
          center_id: centerId,
          status: In([
            'arranged',
            'report_rejected',
            'report_submitted',
            'report_verified',
            'report_forwarded',
          ]),
        },
        order: { request_date: 'DESC', request_id: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async arrangeTest(
    coordinatorId: string,
    taskId: string,
  ): Promise<TestRequest> {
    try {
      return await this.withTask(
        coordinatorId,
        taskId,
        async (manager, _task, request) => {
          if (request.status !== 'accepted' || !request.center_id) {
            throw new ConflictException(
              'The patient must accept the test and select a diagnostic center first',
            );
          }
          request.status = 'arranged';
          await this.activity(manager, taskId, coordinatorId, 'test_arranged');
          return manager.save(request);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async submitReport(
    centerId: string,
    requestId: number,
    dto: SubmitReportDto,
  ): Promise<DiagnosticReport> {
    try {
      return await this.auditService.transaction(async (manager) => {
        const request = await this.lockRequest(manager, requestId);
        if (request.center_id !== centerId) {
          throw new NotFoundException('Test request not found');
        }
        if (
          request.status !== 'arranged' &&
          request.status !== 'report_rejected'
        ) {
          throw new ConflictException(
            'This test request is not accepting a report',
          );
        }
        const existing = await manager.findOneBy(DiagnosticReport, {
          requestId,
        });
        const report =
          existing ?? manager.create(DiagnosticReport, { requestId });
        report.result = dto.result;
        report.reportFile = dto.reportFile;
        report.checkStatus = 'pending';
        report.status = 'submitted';
        request.status = 'report_submitted';
        await manager.save(request);
        return manager.save(report);
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getReport(
    coordinatorId: string,
    taskId: string,
  ): Promise<DiagnosticReport> {
    try {
      const task = await this.getTask(coordinatorId, taskId);
      return await this.findReport(this.dataSource.manager, task.requestId);
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async reviewReport(
    coordinatorId: string,
    taskId: string,
    checkStatus: 'verified' | 'rejected',
  ): Promise<DiagnosticReport> {
    try {
      return await this.withTask(
        coordinatorId,
        taskId,
        async (manager, _task, request) => {
          const report = await this.findReport(manager, request.request_id);
          if (
            request.status !== 'report_submitted' ||
            report.checkStatus !== 'pending'
          ) {
            throw new ConflictException(
              'Only a pending report can be reviewed',
            );
          }
          report.checkStatus = checkStatus;
          report.status = checkStatus;
          request.status = `report_${checkStatus}`;
          await this.activity(
            manager,
            taskId,
            coordinatorId,
            `report_${checkStatus}`,
          );
          await manager.save(request);
          return manager.save(report);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async forwardReport(
    coordinatorId: string,
    taskId: string,
  ): Promise<DiagnosticReport> {
    try {
      return await this.withTask(
        coordinatorId,
        taskId,
        async (manager, _task, request) => {
          const report = await this.findReport(manager, request.request_id);
          if (report.checkStatus !== 'verified' || report.forwardedAt) {
            throw new ConflictException(
              'Only a verified report can be forwarded once',
            );
          }
          report.forwardedAt = new Date();
          report.status = 'forwarded';
          request.status = 'report_forwarded';
          await this.activity(
            manager,
            taskId,
            coordinatorId,
            'report_forwarded',
          );
          await manager.save(request);
          return manager.save(report);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getDoctorTestRequest(
    doctorId: string,
    requestId: number,
  ): Promise<{ request: TestRequest; report: DiagnosticReport | null }> {
    try {
      const request = await this.testRequestRepo.findOne({
        where: { request_id: requestId, patientCase: { doctorId: Number(doctorId) } },
      });
      if (!request) {
        throw new NotFoundException('Test request not found');
      }
      const report = await this.reportRepo.findOneBy({
        requestId,
        status: 'forwarded',
      });
      return { request, report };
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async createFollowUp(
    coordinatorId: string,
    dto: CreateFollowUpDto,
  ): Promise<FollowUpSchedule> {
    try {
      return await this.auditService.transaction(async (manager) => {
        await this.assignedCase(manager, coordinatorId, dto.caseId);
        const followup = manager.create(FollowUpSchedule, {
          caseId: dto.caseId,
          followupDate: dto.followupDate,
          followupTime: dto.followupTime,
          note: dto.note,
          followupCode: `FU-${this.shortId()}`,
        });
        return await manager.save(followup);
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listFollowUps(
    coordinatorId: string,
    page: PaginationDto,
  ): Promise<FollowUpSchedule[]> {
    try {
      return await this.followUpRepo.find({
        where: { patientCase: { coordinatorId } },
        order: { followupDate: 'ASC', followupTime: 'ASC', followupId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getFollowUp(
    coordinatorId: string,
    followupId: string,
  ): Promise<FollowUpSchedule> {
    try {
      return await this.findFollowUp(
        this.dataSource.manager,
        coordinatorId,
        followupId,
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async updateFollowUp(
    coordinatorId: string,
    followupId: string,
    dto: UpdateFollowUpDto,
  ): Promise<FollowUpSchedule> {
    try {
      return await this.withFollowUp(
        coordinatorId,
        followupId,
        async (manager, followup) => {
          const status = dto.status ?? followup.status;
          const outcome = dto.outcome ?? followup.outcome;
          if (status === 'completed' && !outcome?.trim()) {
            throw new BadRequestException(
              'An outcome is required to complete the follow-up',
            );
          }
          followup.followupDate = dto.followupDate ?? followup.followupDate;
          followup.followupTime = dto.followupTime ?? followup.followupTime;
          followup.note = dto.note ?? followup.note;
          followup.status = status;
          followup.outcome = outcome;
          return manager.save(followup);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteFollowUp(
    coordinatorId: string,
    followupId: string,
  ): Promise<void> {
    try {
      await this.withFollowUp(coordinatorId, followupId, (manager) =>
        manager.delete(FollowUpSchedule, { followupId }),
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async createReminder(
    coordinatorId: string,
    followupId: string,
    message: string,
  ): Promise<Reminder> {
    try {
      return await this.withFollowUp(
        coordinatorId,
        followupId,
        async (manager, followup) => {
          if (followup.status !== 'scheduled') {
            throw new ConflictException(
              'Only a scheduled follow-up can receive reminders',
            );
          }
          return manager.save(
            manager.create(Reminder, {
              followupId,
              message,
              reminderCode: `REM-${this.shortId()}`,
            }),
          );
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listReminders(
    coordinatorId: string,
    followupId: string,
    page: PaginationDto,
  ): Promise<Reminder[]> {
    try {
      await this.getFollowUp(coordinatorId, followupId);
      return await this.reminderRepo.find({
        where: { followupId },
        order: { reminderId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async getReminder(
    coordinatorId: string,
    followupId: string,
    reminderId: string,
  ): Promise<Reminder> {
    try {
      await this.getFollowUp(coordinatorId, followupId);
      return await this.findReminder(
        this.dataSource.manager,
        followupId,
        reminderId,
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async updateReminder(
    coordinatorId: string,
    followupId: string,
    reminderId: string,
    dto: UpdateReminderDto,
  ): Promise<Reminder> {
    try {
      return await this.withFollowUp(
        coordinatorId,
        followupId,
        async (manager, followup) => {
          const reminder = await this.findReminder(
            manager,
            followupId,
            reminderId,
          );
          if (reminder.sentDate && dto.message !== undefined) {
            throw new ConflictException('A sent reminder cannot be edited');
          }
          const status = dto.responseStatus;
          if (status === 'sent' && followup.status !== 'scheduled') {
            throw new ConflictException(
              'Only a scheduled follow-up can receive reminders',
            );
          }
          if (
            (status === 'acknowledged' && !reminder.sentDate) ||
            (status === 'failed' && reminder.sentDate) ||
            (reminder.responseStatus === 'acknowledged' &&
              status &&
              status !== 'acknowledged')
          ) {
            throw new ConflictException('Invalid reminder status transition');
          }
          if (status === 'sent') {
            reminder.sentDate ??= new Date();
          }
          reminder.message = dto.message ?? reminder.message;
          reminder.responseStatus = status ?? reminder.responseStatus;
          return manager.save(reminder);
        },
      );
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async deleteReminder(
    coordinatorId: string,
    followupId: string,
    reminderId: string,
  ): Promise<void> {
    try {
      await this.withFollowUp(coordinatorId, followupId, async (manager) => {
        const reminder = await this.findReminder(
          manager,
          followupId,
          reminderId,
        );
        if (reminder.sentDate) {
          throw new ConflictException('A sent reminder cannot be deleted');
        }
        await manager.delete(Reminder, { reminderId });
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  async listPatientReminders(
    patientId: string,
    page: PaginationDto,
  ): Promise<Reminder[]> {
    try {
      return await this.reminderRepo.find({
        where: {
          responseStatus: In(['sent', 'acknowledged']),
          followup: { patientCase: { patient: { patientId } } },
        },
        order: { sentDate: 'DESC', reminderId: 'ASC' },
        skip: page.skip,
        take: page.limit,
      });
    } catch (error) {
      return this.handleDatabaseError(error);
    }
  }

  private async saveCoordinator(
    repo: Repository<CoordinatorProfile>,
    adminId: string,
    dto: CreateCoordinatorDto,
    password: string,
  ): Promise<CoordinatorProfile> {
    const profile = repo.create({
      fullName: dto.fullName,
      phone: dto.phone,
      staffId: dto.staffId,
      coordinatorId: this.shortId(),
      adminId: Number(adminId),
      role: 'coordinator',
      email: dto.email.toLowerCase(),
      password,
    });
    return await repo.save(profile);
  }

  private shortId() {
    return randomBytes(7).toString('base64url');
  }

  private async assignedCase(
    manager: EntityManager,
    coordinatorId: string,
    caseId: string,
  ) {
    const patientCase = await manager.findOneBy(PatientCases, {
      caseId,
      coordinatorId,
    });
    if (!patientCase) {
      throw new NotFoundException('Assigned case not found');
    }
    return patientCase;
  }

  private async lockCase(manager: EntityManager, caseId: string) {
    const patientCase = await manager.findOne(PatientCases, {
      where: { caseId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!patientCase) {
      throw new NotFoundException('Case not found');
    }
    return patientCase;
  }

  private async requirePaidCase(manager: EntityManager, caseId: string) {
    if (
      !(await manager.existsBy(Payments, {
        patientCase: { caseId },
        paymentStatus: In(['success', 'paid']),
      }))
    ) {
      throw new ConflictException('The case does not have a confirmed payment');
    }
  }

  private async assignPaidCase(
    manager: EntityManager,
    patientCase: PatientCases,
    coordinatorId: string,
  ) {
    await this.requirePaidCase(manager, patientCase.caseId);
    if (
      patientCase.coordinatorId &&
      patientCase.coordinatorId !== coordinatorId
    ) {
      throw new ConflictException('Case is assigned to another coordinator');
    }
    if (!(await manager.existsBy(CoordinatorProfile, { coordinatorId }))) {
      throw new NotFoundException('Coordinator not found');
    }
    patientCase.coordinatorId = coordinatorId;
    await manager.save(patientCase);
  }

  private async saveTask(
    manager: EntityManager,
    requestId: number,
    coordinatorId: string,
    note: string,
  ) {
    const request = await this.lockRequest(manager, requestId);
    if (request.status === 'DRAFT') {
      request.status = 'requested';
      await manager.save(request);
    }
    const task = await manager.save(
      manager.create(CoordinationTask, { requestId, note }),
    );
    await this.activity(manager, task.taskId, coordinatorId, 'task_created');
    return task;
  }

  private activity(
    manager: EntityManager,
    taskId: string,
    coordinatorId: string,
    action: string,
    note?: string,
  ) {
    return manager.save(
      manager.create(CoordinationActivity, {
        taskId,
        coordinatorId,
        action,
        note,
      }),
    );
  }

  private async lockRequest(manager: EntityManager, requestId: number) {
    const request = await manager.findOne(TestRequest, {
      where: { request_id: requestId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!request) {
      throw new NotFoundException('Test request not found');
    }
    return request;
  }

  private withTask<T>(
    coordinatorId: string,
    taskId: string,
    action: (
      manager: EntityManager,
      task: CoordinationTask,
      request: TestRequest,
    ) => Promise<T>,
  ) {
    return this.auditService.transaction(async (manager) => {
      const task = await manager.findOne(CoordinationTask, {
        where: { taskId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!task) {
        throw new NotFoundException('Coordination task not found');
      }
      const request = await this.lockRequest(manager, task.requestId);
      await this.assignedCase(manager, coordinatorId, request.case_id);
      return action(manager, task, request);
    });
  }

  private async findReport(manager: EntityManager, requestId: number) {
    const report = await manager.findOneBy(DiagnosticReport, { requestId });
    if (!report) {
      throw new NotFoundException('Diagnostic report not found');
    }
    return report;
  }

  private async findFollowUp(
    manager: EntityManager,
    coordinatorId: string,
    followupId: string,
    lock = false,
  ) {
    const followup = await manager.findOne(FollowUpSchedule, {
      where: { followupId },
      lock: lock ? { mode: 'pessimistic_write' } : undefined,
    });
    if (!followup) {
      throw new NotFoundException('Follow-up schedule not found');
    }
    await this.assignedCase(manager, coordinatorId, followup.caseId);
    return followup;
  }

  private withFollowUp<T>(
    coordinatorId: string,
    followupId: string,
    action: (manager: EntityManager, followup: FollowUpSchedule) => Promise<T>,
  ) {
    return this.auditService.transaction(async (manager) =>
      action(
        manager,
        await this.findFollowUp(manager, coordinatorId, followupId, true),
      ),
    );
  }

  private async findReminder(
    manager: EntityManager,
    followupId: string,
    reminderId: string,
  ) {
    const reminder = await manager.findOneBy(Reminder, {
      followupId,
      reminderId,
    });
    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }
    return reminder;
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const { code } = error.driverError as { code?: string };
      if (code === '23505') {
        throw new ConflictException(
          'A record with the same unique value already exists',
        );
      }
      if (code === '23503' || code === '23001') {
        throw new ConflictException(
          'The operation conflicts with a related record',
        );
      }
    }
    throw error;
  }
}
