import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Doctors } from './entities/doctors.entity.js';
import { CreateDoctorDto } from './dtos/create-doctor.dto.js';
import { UpdateDoctorDto } from './dtos/update-doctor.dto.js';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctors)
    private readonly doctorRepo: Repository<Doctors>,
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

  async getAllDoctors(): Promise<Doctors[]> {
    return await this.doctorRepo.find();
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
    const result = await this.doctorRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException(
        `Doctor with id ${id} not found`,
      );
    }

    return {
      message: `Doctor with id ${id} deleted successfully`,
    };
  }
}
