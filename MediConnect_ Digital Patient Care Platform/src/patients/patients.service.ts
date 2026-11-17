import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patients } from './entities/patients.entity.js';
import { UpdatePatientDto } from './dtos/update-patient.dto.js';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patients)
    private readonly patientsRepo: Repository<Patients>,
  ) {}

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

  async getPatientById(id: string): Promise<Patients> {
    const patient = await this.patientsRepo.findOne({
      where: {
        patientId: id,
      },
      select: {
        patientId: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    if (!patient) {
      throw new BadRequestException('Patient not found');
    }

    return patient;
  }

  async updatePatient(
    id: string,
    patient: UpdatePatientDto,
  ): Promise<Patients> {
    try {
      await this.patientsRepo.update(id, {
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
      });
    } catch {
      throw new BadRequestException('Patient update failed');
    }

    return await this.getPatientById(id);
  }

  async deletePatient(id: string): Promise<string> {
    try {
      const result = (await this.patientsRepo.delete(id)).affected;

      if (result != null && result > 0) {
        return `Patient deleted with id ${id}`;
      }
    } catch {
      throw new BadRequestException(
        'Patient deletion failed. The patient may have related cases',
      );
    }

    throw new BadRequestException('Patient not found');
  }
}
