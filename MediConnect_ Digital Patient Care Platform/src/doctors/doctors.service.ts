import { PatientCases } from '../patient-cases/entities/patient-cases.entity.js';
import { randomUUID } from 'node:crypto';
import { TestRequest } from './entities/test-request.entity.js';
import { CreateTestRequestDto } from './dtos/create-test-request.dto.js';
import { UpdateTestRequestDto } from './dtos/update-test-request.dto.js';
import { DoctorAdvice } from './entities/doctor-advice.entity.js';
import { CreateDoctorAdviceDto } from './dtos/create-doctor-advice.dto.js';
import { UpdateDoctorAdviceDto } from './dtos/update-doctor-advice.dto.js';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Doctors } from './entities/doctors.entity.js';
import { DoctorProfile } from './entities/doctor-profile.entity.js';
import { CreateDoctorProfileDto } from './dtos/create-doctor-profile.dto.js';
import { CreateDoctorDto } from './dtos/create-doctor.dto.js';
import { UpdateDoctorDto } from './dtos/update-doctor.dto.js';
import { UpdateDoctorProfileDto } from './dtos/update-doctor-profile.dto.js';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Doctors)
    private readonly doctorRepo: Repository<Doctors>,

    @InjectRepository(DoctorProfile)
    private readonly profileRepo: Repository<DoctorProfile>,

    @InjectRepository(DoctorAdvice)
    private readonly adviceRepo: Repository<DoctorAdvice>,

    @InjectRepository(TestRequest)
    private readonly testRequestRepo: Repository<TestRequest>,

    @InjectRepository(PatientCases)
    private readonly caseRepo: Repository<PatientCases>,
  ) {}

  async createDoctor(dto: CreateDoctorDto) {
    const hashedPassword = await bcrypt.hash(
      dto.password,
      10,
    );

    try {
      const doctor = this.doctorRepo.create({
        ...dto,
        password: hashedPassword,
      });

      const savedDoctor = await this.doctorRepo.save(doctor);

      return {
        doctor_id: savedDoctor.doctor_id,
        full_name: savedDoctor.full_name,
        email: savedDoctor.email,
        phone: savedDoctor.phone,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const databaseError = error.driverError as {
          code?: string;
        };

        if (databaseError.code === '23505') {
          throw new ConflictException(
            'This email is already registered',
          );
        }
      }

      throw error;
    }
  }

  async getAllDoctors(page: number, limit: number, doctorId: number) {
    const [data, total] = await this.doctorRepo.findAndCount({
      where: { doctor_id: doctorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { doctor_id: 'ASC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDoctorById(id: number): Promise<Doctors> {
    const doctor = await this.doctorRepo.findOne({
      where: {
        doctor_id: id,
      },
    });

    if (!doctor) {
      throw new NotFoundException(
        `Doctor with id ${id} not found`,
      );
    }

    return doctor;
  }

  async updateDoctor(id: number, dto: UpdateDoctorDto) {
    await this.getDoctorById(id);

    try {
      const result = await this.doctorRepo.update(id, dto);

      if (!result.affected) {
        throw new NotFoundException(
          `Doctor with id ${id} not found`,
        );
      }
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const databaseError = error.driverError as {
          code?: string;
        };

        if (databaseError.code === '23505') {
          throw new ConflictException(
            'This email is already registered',
          );
        }
      }

      throw error;
    }

    return await this.getDoctorById(id);
  }

  async deleteDoctor(id: number) {
    const profileCount = await this.profileRepo.count({ where: { doctor_id: id } });
    const caseCount = await this.caseRepo.count({ where: { doctorId: id } });
    if (profileCount || caseCount) {
      throw new ConflictException(
        'Doctor has a profile or patient cases and cannot be deleted',
      );
    }

    try {
      const result = await this.doctorRepo.delete(id);
      if (!result.affected) {
        throw new NotFoundException(`Doctor with id ${id} not found`);
      }
      return { message: `Doctor with id ${id} deleted successfully` };
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { code?: string }).code === '23503') {
        throw new ConflictException(
          'Doctor has a profile or patient cases and cannot be deleted',
        );
      }
      throw error;
    }
  }

  async createDoctorProfile(dto: CreateDoctorProfileDto, doctorId: number) {
    const doctor = await this.getDoctorById(doctorId);

    try {
      const profile = this.profileRepo.create({
        ...dto,
        doctor_id: doctorId,
        doctor,
        consultation_fee: dto.consultation_fee.toFixed(2),
      });

      return await this.profileRepo.save(profile);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const databaseError = error.driverError as {
          code?: string;
        };

        if (databaseError.code === '23505') {
          throw new ConflictException(
            'Doctor profile or registration number already exists',
          );
        }
      }

      throw error;
    }
  }

  async getAllDoctorProfiles(page: number, limit: number, doctorId: number) {
    const [data, total] = await this.profileRepo.findAndCount({
      where: { doctor_id: doctorId },
      skip: (page - 1) * limit,
      take: limit,
      order: { profile_id: 'ASC' },
      relations: { doctor: true },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDoctorProfileById(id: number): Promise<DoctorProfile> {
    const profile = await this.profileRepo.findOne({
      where: {
        profile_id: id,
      },
      relations: {
        doctor: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        `Doctor profile with id ${id} not found`,
      );
    }

    return profile;
  }

  async updateDoctorProfile(id: number, dto: UpdateDoctorProfileDto) {
    const profile = await this.getDoctorProfileById(id);

    if (!['DRAFT', 'REJECTED'].includes(profile.verification_status)) {
      throw new ConflictException(
        'Only DRAFT or REJECTED profiles can be updated',
      );
    }

    const { consultation_fee, ...fields } = dto;
    const changes = {
      ...fields,
      ...(consultation_fee !== undefined
        ? { consultation_fee: consultation_fee.toFixed(2) }
        : {}),
    };

    try {
      const result = await this.profileRepo.update(
        {
          profile_id: id,
          verification_status: profile.verification_status,
        },
        changes,
      );

      if (!result.affected) {
        throw new ConflictException(
          'Profile changed during update; reload and try again',
        );
      }
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const databaseError = error.driverError as {
          code?: string;
        };

        if (databaseError.code === '23505') {
          throw new ConflictException(
            'Doctor registration number already exists',
          );
        }
      }

      throw error;
    }

    return await this.getDoctorProfileById(id);
  }

  async deleteDoctorProfile(id: number) {
    const profile = await this.getDoctorProfileById(id);

    if (!['DRAFT', 'REJECTED'].includes(profile.verification_status)) {
      throw new ConflictException(
        'Only DRAFT or REJECTED profiles can be deleted',
      );
    }

    const result = await this.profileRepo.delete({
      profile_id: id,
      verification_status: profile.verification_status,
    });

    if (!result.affected) {
      throw new ConflictException(
        'Profile changed during deletion; reload and try again',
      );
    }

    return {
      message: `Doctor profile with id ${id} deleted successfully`,
    };
  }

  async createDoctorAdvice(dto: CreateDoctorAdviceDto, doctorId: number) {
    await this.checkCaseOwner(dto.case_id, doctorId);
    const advice = this.adviceRepo.create(dto);
    return await this.adviceRepo.save(advice);
  }

  async getAllDoctorAdvice(page: number, limit: number, doctorId: number) {
    const caseIds = await this.getAssignedCaseIds(doctorId);
    const [data, total] = await this.adviceRepo.findAndCount({
      where: { case_id: In(caseIds) },
      skip: (page - 1) * limit,
      take: limit,
      order: { advice_id: 'ASC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDoctorAdviceById(id: number, doctorId: number): Promise<DoctorAdvice> {
    const advice = await this.adviceRepo.findOne({
      where: { advice_id: id },
    });

    if (!advice) {
      throw new NotFoundException(
        `Doctor advice with id ${id} not found`,
      );
    }

    await this.checkCaseOwner(advice.case_id, doctorId);
    return advice;
  }

  async updateDoctorAdvice(id: number, dto: UpdateDoctorAdviceDto, doctorId: number) {
    const advice = await this.getDoctorAdviceById(id, doctorId);

    if (advice.status !== 'DRAFT') {
      throw new ConflictException('Only DRAFT advice can be updated');
    }

    const result = await this.adviceRepo.update(
      { advice_id: id, status: 'DRAFT' },
      dto,
    );

    if (!result.affected) {
      throw new ConflictException('Advice changed; reload and try again');
    }

    return await this.getDoctorAdviceById(id, doctorId);
  }

  async deleteDoctorAdvice(id: number, doctorId: number) {
    const advice = await this.getDoctorAdviceById(id, doctorId);

    if (advice.status !== 'DRAFT') {
      throw new ConflictException('Only DRAFT advice can be deleted');
    }

    const result = await this.adviceRepo.delete({
      advice_id: id,
      status: 'DRAFT',
    });

    if (!result.affected) {
      throw new ConflictException('Advice changed; reload and try again');
    }

    return {
      message: `Doctor advice with id ${id} deleted successfully`,
    };
  }

  // Diagnostic center integration is still pending.
  async createTestRequest(dto: CreateTestRequestDto, doctorId: number) {
    await this.checkCaseOwner(dto.case_id, doctorId);
    const request = this.testRequestRepo.create({
      ...dto,
      request_code: `TR-${randomUUID()}`,
    });

    return await this.testRequestRepo.save(request);
  }

  async getAllTestRequests(page: number, limit: number, doctorId: number) {
    const caseIds = await this.getAssignedCaseIds(doctorId);
    const [data, total] = await this.testRequestRepo.findAndCount({
      where: { case_id: In(caseIds) },
      skip: (page - 1) * limit,
      take: limit,
      order: { request_id: 'ASC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTestRequestById(id: number, doctorId: number): Promise<TestRequest> {
    const request = await this.testRequestRepo.findOne({
      where: { request_id: id },
    });

    if (!request) {
      throw new NotFoundException(
        `Test request with id ${id} not found`,
      );
    }

    await this.checkCaseOwner(request.case_id, doctorId);
    return request;
  }

  async updateTestRequest(id: number, dto: UpdateTestRequestDto, doctorId: number) {
    const request = await this.getTestRequestById(id, doctorId);

    if (request.status !== 'DRAFT') {
      throw new ConflictException('Only DRAFT test requests can be updated');
    }

    const result = await this.testRequestRepo.update(
      { request_id: id, status: 'DRAFT' },
      dto,
    );

    if (!result.affected) {
      throw new ConflictException('Test request changed; reload and try again');
    }

    return await this.getTestRequestById(id, doctorId);
  }

  async deleteTestRequest(id: number, doctorId: number) {
    const request = await this.getTestRequestById(id, doctorId);

    if (request.status !== 'DRAFT') {
      throw new ConflictException('Only DRAFT test requests can be deleted');
    }

    const result = await this.testRequestRepo.delete({
      request_id: id,
      status: 'DRAFT',
    });

    if (!result.affected) {
      throw new ConflictException('Test request changed; reload and try again');
    }

    return {
      message: `Test request with id ${id} deleted successfully`,
    };
  }

  // Only authentication may load the password hash.
  async getDoctorForLogin(email: string): Promise<Doctors | null> {
    return await this.doctorRepo.findOne({
      where: { email },
      select: {
        doctor_id: true,
        password: true,
      },
    });
  }

  async getDoctorForToken(id: number): Promise<Doctors | null> {
    return await this.doctorRepo.findOne({
      where: { doctor_id: id },
    });
  }

  async submitDoctorProfile(id: number) {
    const profile = await this.getDoctorProfileById(id);

    if (!['DRAFT', 'REJECTED'].includes(profile.verification_status)) {
      throw new ConflictException(
        'Only DRAFT or REJECTED profiles can be submitted',
      );
    }

    if (
      !profile.qualification.trim() ||
      !profile.specialization.trim() ||
      !profile.registration_no.trim() ||
      !profile.supporting_documents?.length ||
      profile.supporting_documents.some((document) => !document.trim())
    ) {
      throw new BadRequestException(
        'Complete the profile and add supporting documents before submitting',
      );
    }

    const result = await this.profileRepo.update(
      { profile_id: id, verification_status: profile.verification_status },
      {
        verification_status: 'PENDING',
        admin_id: null,
        verified_at: null,
      },
    );

    if (!result.affected) {
      throw new ConflictException('Profile changed; reload and try again');
    }

    return await this.getDoctorProfileById(id);
  }

  async getVerifiedDoctors(page: number, limit: number) {
    const [data, total] = await this.profileRepo.findAndCount({
      where: { verification_status: 'APPROVED' },
      relations: { doctor: true },
      select: {
        profile_id: true,
        doctor_id: true,
        qualification: true,
        specialization: true,
        experience_years: true,
        consultation_fee: true,
        verification_status: true,
        verified_at: true,
        doctor: { doctor_id: true, full_name: true },
      },
      order: { profile_id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async checkCaseOwner(caseId: string, doctorId: number) {
    const patientCase = await this.caseRepo.findOne({
      where: { caseId },
    });
    if (!patientCase) {
      throw new NotFoundException('Patient case not found');
    }
    if (patientCase.doctorId !== doctorId) {
      throw new ForbiddenException('This patient case is assigned to another doctor');
    }
    return patientCase;
  }

  private async getAssignedCaseIds(doctorId: number) {
    const cases = await this.caseRepo.find({
      where: { doctorId },
      select: { caseId: true },
    });
    return cases.map((patientCase) => patientCase.caseId);
  }

  async publishDoctorAdvice(id: number, doctorId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const advice = await queryRunner.manager.findOne(DoctorAdvice, {
        where: { advice_id: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!advice) {
        throw new NotFoundException('Doctor advice not found');
      }

      const patientCase = await queryRunner.manager.findOne(PatientCases, {
        where: { caseId: advice.case_id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!patientCase) {
        throw new NotFoundException('Patient case not found');
      }
      if (patientCase.doctorId !== doctorId) {
        throw new ForbiddenException('This patient case is assigned to another doctor');
      }
      if (advice.status !== 'DRAFT') {
        throw new ConflictException('Only DRAFT advice can be published');
      }
      if (['closed', 'cancelled', 'canceled'].includes(patientCase.status.toLowerCase())) {
        throw new ConflictException('Cannot publish advice for a closed or cancelled case');
      }

      advice.status = 'PUBLISHED';
      await queryRunner.manager.save(advice);

      patientCase.status = 'ADVICE_GIVEN';
      await queryRunner.manager.save(patientCase);

      await queryRunner.commitTransaction();
      return {
        message: 'Advice published successfully',
        advice,
        patient_case: {
          case_id: patientCase.caseId,
          status: patientCase.status,
        },
      };
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
