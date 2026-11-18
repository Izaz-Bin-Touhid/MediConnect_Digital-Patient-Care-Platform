import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, MoreThanOrEqual, QueryFailedError, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { FollowUpSchedule } from '../coordinator/entities/follow-up-schedule.entity.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { Payments } from './entities/payments.entity.js';

import { Patients } from './entities/patients.entity.js';
import { CreatePatientDto } from './dtos/create-patient.dto.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patients)
    private readonly patientsRepo: Repository<Patients>,
    @InjectRepository(PatientCases)
    private readonly casesRepo: Repository<PatientCases>,
    @InjectRepository(Payments)
    private readonly paymentsRepo: Repository<Payments>,
    @InjectRepository(FollowUpSchedule)
    private readonly followUpRepo: Repository<FollowUpSchedule>,
  ) {}

  async getMyFollowUps(patientId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const [data, total] = await this.followUpRepo.findAndCount({
      where: { patientCase: { patient: { patientId } } },
      order: { followupDate: 'ASC', followupTime: 'ASC', followupId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyFollowUpById(patientId: string, followupId: string) {
    const followup = await this.followUpRepo.findOne({
      where: { followupId, patientCase: { patient: { patientId } } },
    });
    if (!followup) {
      throw new NotFoundException('Follow-up schedule not found');
    }
    return followup;
  }

  async getMyDashboard(patientId: string) {
    const totalCases = await this.casesRepo.count({
      where: { patient: { patientId } },
    });
    const draftCases = await this.casesRepo.count({
      where: { patient: { patientId }, status: 'draft' },
    });
    const submittedCases = await this.casesRepo.count({
      where: { patient: { patientId }, status: 'submitted' },
    });
    const adviceGivenCases = await this.casesRepo.count({
      where: { patient: { patientId }, status: 'ADVICE_GIVEN' },
    });
    const payments = await this.paymentsRepo.find({
      where: { patientCase: { patient: { patientId } }, paymentStatus: 'success' },
      select: { paymentId: true, amount: true },
    });
    let totalPaidInPaisa = 0;
    for (const payment of payments) {
      totalPaidInPaisa += Math.round(Number(payment.amount) * 100);
    }

    const localTime = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
    }).format(new Date());
    const [today, time] = localTime.split(' ');
    const upcomingFollowUps = await this.followUpRepo.count({
      where: [
        {
          patientCase: { patient: { patientId } },
          status: 'scheduled',
          followupDate: MoreThan(today),
        },
        {
          patientCase: { patient: { patientId } },
          status: 'scheduled',
          followupDate: today,
          followupTime: MoreThanOrEqual(time),
        },
      ],
    });
    return {
      totalCases,
      draftCases,
      submittedCases,
      adviceGivenCases,
      successfulPayments: payments.length,
      totalPaidAmount: (totalPaidInPaisa / 100).toFixed(2),
      upcomingFollowUps,
    };
  }

  async createPatient(patient: CreatePatientDto): Promise<Patients> {
    const existingPatient = await this.patientsRepo.findOne({
      where: { patientId: patient.patientId },
    });

    if (existingPatient) {
      throw new ConflictException('Patient ID already exists');
    }

    const existingEmail = await this.patientsRepo.findOne({
      where: { email: patient.email },
    });

    if (existingEmail) {
      throw new ConflictException('Patient email already exists');
    }

    try {
      const patientEntity = await this.patientsRepo.create({
        ...patient,
        role: 'patient',
      });
      return await this.patientsRepo.save(patientEntity);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException('Patient ID or email already exists');
      }
      throw error;
    }
  }

  async getPatientById(id: string): Promise<Patients | null> {
    return await this.patientsRepo.findOne({
      where: { patientId: id },
      select: {
        patientId: true,
        fullName: true,
        email: true,
        phone: true,
        password: true,
        role: true,
      },
    });
  }

  async updatePatient(
    id: string,
    patient: UpdatePatientDto,
  ): Promise<Patients> {
    const existingPatient = await this.getPatientById(id);
    if (!existingPatient) {
      throw new NotFoundException('Patient not found');
    }
    if (patient.patientId !== undefined || patient.password !== undefined) {
      throw new BadRequestException(
        'Update only fullName, email and phone here; use change-password for passwords',
      );
    }
    if (
      patient.fullName === null ||
      patient.email === null ||
      patient.phone === null
    ) {
      throw new BadRequestException('Profile fields cannot be null');
    }
    if (
      patient.fullName === undefined &&
      patient.email === undefined &&
      patient.phone === undefined
    ) {
      throw new BadRequestException('Provide a field to update');
    }
    if (patient.email !== undefined) {
      const duplicate = await this.patientsRepo.findOne({
        where: { email: patient.email },
      });
      if (duplicate && duplicate.patientId !== id) {
        throw new ConflictException('Patient email already exists');
      }
    }
    let result;
    try {
      result = await this.patientsRepo.update(id, {
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        error.driverError.code === '23505'
      ) {
        throw new ConflictException('Patient email already exists');
      }
      throw error;
    }
    if (!result.affected) {
      throw new NotFoundException('Patient not found');
    }
    const updatedPatient = await this.getPatientById(id);
    if (!updatedPatient) {
      throw new NotFoundException('Patient not found');
    }
    return updatedPatient;
  }

  async deletePatient(id: string): Promise<string> {
    let result;
    try {
      result = await this.patientsRepo.delete(id);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        (error.driverError.code === '23503' ||
          error.driverError.code === '23001')
      ) {
        throw new ConflictException(
          'Patient has related cases and cannot be deleted',
        );
      }
      throw error;
    }
    if (!result.affected) {
      throw new NotFoundException('Patient not found');
    }
    return `Patient deleted with id ${id}`;
  }

  async updatePassword(
    id: string,
    newPassword: string,
    oldHash: string,
  ): Promise<string> {
    const result = await this.patientsRepo.update(
      { patientId: id, password: oldHash },
      { password: newPassword },
    );
    if (result.affected != null && result.affected > 0) {
      return 'Password changed successfully';
    }
    throw new ConflictException('Account changed. Please log in and try again');
  }
}
