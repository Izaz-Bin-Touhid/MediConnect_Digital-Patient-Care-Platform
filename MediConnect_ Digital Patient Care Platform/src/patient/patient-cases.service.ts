import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Doctors } from '../doctors/entities/doctors.entity.js';
import { PatientsService } from './patients.service.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { CreatePatientCaseDto } from './dtos/create-patient-case.dto.js';
import { UpdatePatientCaseDto } from './dtos/update-patient-case.dto.js';
import { PaginationDto } from '../common/dtos/pagination.dto.js';

@Injectable()
export class PatientCasesService {
  constructor(
    @InjectRepository(PatientCases)
    private readonly casesRepo: Repository<PatientCases>,
    @InjectRepository(Doctors)
    private readonly doctorsRepo: Repository<Doctors>,
    private readonly patientsService: PatientsService,
  ) {}

  async createPatientCase(
    patientId: string,
    patientCase: CreatePatientCaseDto,
  ): Promise<PatientCases> {
    const patient = await this.patientsService.getPatientById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const doctor = await this.doctorsRepo.findOne({
      where: { doctor_id: patientCase.doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const existingCase = await this.casesRepo.findOne({
      where: [
        { caseId: patientCase.caseId },
        { caseCode: patientCase.caseCode },
      ],
    });

    if (existingCase) {
      throw new ConflictException('Case ID or code already exists');
    }

    try {
      const caseEntity = await this.casesRepo.create({
        ...patientCase,
        patient: { patientId: patient.patientId },
        doctorId: doctor.doctor_id,
        coordinatorId: null,
        status: 'draft',
      });

      await this.casesRepo.save(caseEntity);
    } catch (error) {
      if (error instanceof QueryFailedError && 'code' in error.driverError) {
        if (error.driverError.code === '23505') {
          throw new ConflictException('Case ID or code already exists');
        }
        if (error.driverError.code === '23503') {
          throw new ConflictException(
            'The referenced patient or doctor changed; refresh and try again',
          );
        }
      }
      throw error;
    }

    return await this.getMyCaseById(patientId, patientCase.caseId);
  }

  async getMyCases(patientId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const [data, total] = await this.casesRepo.findAndCount({
      where: { patient: { patientId } },
      order: { createdAt: 'DESC', caseId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyCaseById(patientId: string, id: string): Promise<PatientCases> {
    const patientCase = await this.casesRepo.findOne({
      where: { caseId: id, patient: { patientId } },
    });

    if (!patientCase) {
      throw new NotFoundException('Case not found');
    }

    return patientCase;
  }

  async updatePatientCase(
    patientId: string,
    id: string,
    patientCase: UpdatePatientCaseDto,
  ): Promise<PatientCases> {
    const existingCase = await this.getMyCaseById(patientId, id);

    if (existingCase.status !== 'draft') {
      throw new ConflictException('Only draft cases can be updated');
    }

    if (
      patientCase.caseId !== undefined ||
      patientCase.caseCode !== undefined ||
      patientCase.doctorId !== undefined
    ) {
      throw new BadRequestException(
        'Case ID, case code and selected doctor cannot be changed',
      );
    }

    if (
      patientCase.symptoms === null ||
      patientCase.duration === null ||
      patientCase.age === null ||
      patientCase.gender === null
    ) {
      throw new BadRequestException('Required case fields cannot be null');
    }

    if (
      patientCase.symptoms === undefined &&
      patientCase.duration === undefined &&
      patientCase.age === undefined &&
      patientCase.gender === undefined &&
      patientCase.previousIllness === undefined &&
      patientCase.description === undefined
    ) {
      throw new BadRequestException('Provide a field to update');
    }

    const result = await this.casesRepo.update(
      { caseId: id, status: 'draft', patient: { patientId } },
      {
        symptoms: patientCase.symptoms,
        duration: patientCase.duration,
        age: patientCase.age,
        gender: patientCase.gender,
        previousIllness: patientCase.previousIllness,
        description: patientCase.description,
      },
    );

    if (!result.affected) {
      throw new ConflictException('Case changed. Please refresh and try again');
    }

    return await this.getMyCaseById(patientId, id);
  }

  async deletePatientCase(patientId: string, id: string): Promise<string> {
    const patientCase = await this.getMyCaseById(patientId, id);

    if (patientCase.status !== 'draft') {
      throw new ConflictException('Only draft cases can be deleted');
    }

    let result;

    try {
      result = await this.casesRepo.delete({
        caseId: id,
        status: 'draft',
        patient: { patientId },
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        'code' in error.driverError &&
        (error.driverError.code === '23503' ||
          error.driverError.code === '23001')
      ) {
        throw new ConflictException(
          'Case has related records and cannot be deleted',
        );
      }
      throw error;
    }

    if (!result.affected) {
      throw new ConflictException('Case changed. Please refresh and try again');
    }

    return 'Case deleted with id ' + id;
  }
}
