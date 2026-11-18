import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Patients } from './entities/patients.entity.js';
import { DiagnosticCenters } from '../diagnostic-centers/entities/diagnostic-centers.entity.js';
import { CreatePatientDto } from './dtos/create-patient.dto.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';
import { PaginationDto } from './dtos/pagination.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patients)
    private readonly patientsRepo: Repository<Patients>,
    @InjectRepository(DiagnosticCenters)
    private readonly centersRepo: Repository<DiagnosticCenters>,
  ) {}

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

  async getAllPatients(): Promise<Patients[]> {
    return await this.patientsRepo.find({
      select: {
        patientId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
      },
    });
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

  async getDiagnosticCenters(pagination: PaginationDto) {
    const { page, limit } = pagination;
    const [data, total] = await this.centersRepo.findAndCount({
      select: {
        centerId: true,
        centerName: true,
        email: true,
        phone: true,
        location: true,
      },
      order: { centerName: 'ASC', centerId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
