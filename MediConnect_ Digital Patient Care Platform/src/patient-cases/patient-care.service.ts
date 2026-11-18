import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { TestRequests } from '../doctors/entities/test-request.entity.js';
import { DoctorAdvice } from '../doctors/entities/doctor-advice.entity.js';
import { DiagnosticCenters } from '../diagnostic-centers/entities/diagnostic-centers.entity.js';
import { DiagnosticReports } from '../diagnostic-centers/entities/diagnostic-reports.entity.js';
import { FollowupSchedules } from '../followups/entities/followup-schedule.entity.js';
import { Reminders } from '../followups/entities/reminders.entity.js';
import { PaginationDto } from '../patients/dtos/pagination.dto.js';
import { PatientCasesService } from './patient-cases.service.js';
import { TestDecisionDto } from './dtos/test-decision.dto.js';
import { SelectCenterDto } from './dtos/select-center.dto.js';

@Injectable()
export class PatientCareService {
  constructor(
    private readonly patientCasesService: PatientCasesService,
    @InjectRepository(TestRequests)
    private readonly requestsRepo: Repository<TestRequests>,
    @InjectRepository(DoctorAdvice)
    private readonly adviceRepo: Repository<DoctorAdvice>,
    @InjectRepository(DiagnosticCenters)
    private readonly centersRepo: Repository<DiagnosticCenters>,
    @InjectRepository(DiagnosticReports)
    private readonly reportsRepo: Repository<DiagnosticReports>,
    @InjectRepository(FollowupSchedules)
    private readonly followupsRepo: Repository<FollowupSchedules>,
    @InjectRepository(Reminders)
    private readonly remindersRepo: Repository<Reminders>,
  ) {}

  async getTestRequest(patientId: string, caseId: string, requestId: string) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const testRequest = await this.requestsRepo.findOne({
      where: { requestId, patientCase: { caseId } },
      relations: { center: true },
    });
    if (!testRequest) {
      throw new NotFoundException('Test request not found');
    }
    return testRequest;
  }

  async recordTestDecision(
    patientId: string,
    caseId: string,
    requestId: string,
    decision: TestDecisionDto,
  ) {
    const testRequest = await this.getTestRequest(patientId, caseId, requestId);
    if (testRequest.patientDecision !== 'pending') {
      if (testRequest.patientDecision === decision.patientDecision) {
        return testRequest;
      }
      throw new ConflictException(
        'Decision already recorded; contact the coordinator to change it',
      );
    }
    if (testRequest.centerId !== null) {
      throw new ConflictException(
        'Test already assigned to a center; contact the coordinator',
      );
    }
    const result = await this.requestsRepo.update(
      {
        requestId,
        patientCase: { caseId },
        patientDecision: 'pending',
        centerId: IsNull(),
        status: testRequest.status,
      },
      { patientDecision: decision.patientDecision, decisionDate: new Date() },
    );
    if (!result.affected) {
      throw new ConflictException(
        'Test request changed; refresh and try again',
      );
    }
    return await this.getTestRequest(patientId, caseId, requestId);
  }

  async selectCenter(
    patientId: string,
    caseId: string,
    requestId: string,
    selection: SelectCenterDto,
  ) {
    const testRequest = await this.getTestRequest(patientId, caseId, requestId);
    if (testRequest.patientDecision !== 'accepted') {
      throw new ConflictException(
        'Accept the test request before selecting a center',
      );
    }
    if (testRequest.centerId !== null) {
      if (testRequest.centerId === selection.centerId) {
        return testRequest;
      }
      throw new ConflictException(
        'Center already selected; contact the coordinator to change it',
      );
    }
    const center = await this.centersRepo.findOne({
      where: { centerId: selection.centerId },
    });
    if (!center) {
      throw new NotFoundException('Diagnostic center not found');
    }
    const result = await this.requestsRepo.update(
      {
        requestId,
        patientCase: { caseId },
        patientDecision: 'accepted',
        centerId: IsNull(),
        status: testRequest.status,
      },
      { centerId: center.centerId },
    );
    if (!result.affected) {
      throw new ConflictException(
        'Test request changed; refresh and try again',
      );
    }
    return await this.getTestRequest(patientId, caseId, requestId);
  }

  async getTestRequests(
    patientId: string,
    caseId: string,
    pagination: PaginationDto,
  ) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const { page, limit } = pagination;
    const [data, total] = await this.requestsRepo.findAndCount({
      where: { patientCase: { caseId } },
      order: { requestDate: 'DESC', requestId: 'ASC' },
      relations: { center: true },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAdvice(
    patientId: string,
    caseId: string,
    pagination: PaginationDto,
  ) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const { page, limit } = pagination;
    const [data, total] = await this.adviceRepo.findAndCount({
      where: { patientCase: { caseId }, status: 'sent' },
      order: { adviceDate: 'DESC', adviceId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getReports(
    patientId: string,
    caseId: string,
    pagination: PaginationDto,
  ) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const { page, limit } = pagination;
    const [data, total] = await this.reportsRepo.findAndCount({
      where: {
        testRequest: { patientCase: { caseId } },
        checkStatus: 'verified',
        forwardedAt: Not(IsNull()),
      },
      order: { updatedAt: 'DESC', reportId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getFollowups(
    patientId: string,
    caseId: string,
    pagination: PaginationDto,
  ) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const { page, limit } = pagination;
    const [data, total] = await this.followupsRepo.findAndCount({
      where: { patientCase: { caseId } },
      order: { followupDate: 'ASC', followupTime: 'ASC', followupId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAdviceById(patientId: string, caseId: string, adviceId: string) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const record = await this.adviceRepo.findOne({
      where: { adviceId, patientCase: { caseId }, status: 'sent' },
    });
    if (!record) {
      throw new NotFoundException('Advice not found');
    }
    return record;
  }

  async getReportById(patientId: string, caseId: string, reportId: string) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const record = await this.reportsRepo.findOne({
      where: {
        reportId,
        testRequest: { patientCase: { caseId } },
        checkStatus: 'verified',
        forwardedAt: Not(IsNull()),
      },
    });
    if (!record) {
      throw new NotFoundException('Report not found');
    }
    return record;
  }

  async getFollowupById(patientId: string, caseId: string, followupId: string) {
    await this.patientCasesService.getMyCaseById(patientId, caseId);
    const record = await this.followupsRepo.findOne({
      where: { followupId, patientCase: { caseId } },
    });
    if (!record) {
      throw new NotFoundException('Follow-up not found');
    }
    return record;
  }

  async getReminders(
    patientId: string,
    caseId: string,
    followupId: string,
    pagination: PaginationDto,
  ) {
    await this.getFollowupById(patientId, caseId, followupId);
    const { page, limit } = pagination;
    const [data, total] = await this.remindersRepo.findAndCount({
      where: { followupSchedule: { followupId }, sentDate: Not(IsNull()) },
      order: { sentDate: 'DESC', reminderId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
