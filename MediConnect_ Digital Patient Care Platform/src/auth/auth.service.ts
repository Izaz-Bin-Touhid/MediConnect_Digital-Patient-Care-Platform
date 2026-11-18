import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PatientsService } from '../patients/patients.service.js';
import { Patients } from '../patients/entities/patients.entity.js';
import { RegistrationDto } from './dtos/registration.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ChangePasswordDto } from './dtos/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly jwtService: JwtService,
  ) {}

  async registration(patient: RegistrationDto): Promise<Patients> {
    const newPass = await bcrypt.hash(patient.password, 10);
    patient.password = newPass;

    return await this.patientsService.createPatient({ ...patient });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const patient = await this.patientsService.getPatientById(
      loginDto.patientId,
    );
    if (!patient) {
      throw new UnauthorizedException('Invalid patient ID or password');
    }
    const passMatch = await bcrypt.compare(loginDto.password, patient.password);
    if (!passMatch) {
      throw new UnauthorizedException('Invalid patient ID or password');
    }
    const payloads = {
      id: patient.patientId,
      email: patient.email,
      role: patient.role,
    };
    return await this.jwtService.sign(payloads, {
      secret: process.env.JWT_SECRET,
    });
  }

  async changePassword(
    id: string,
    passwords: ChangePasswordDto,
  ): Promise<string> {
    const patient = await this.patientsService.getPatientById(id);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const passMatch = await bcrypt.compare(
      passwords.oldPassword,
      patient.password,
    );

    if (!passMatch) {
      throw new BadRequestException('Old password is incorrect');
    }

    const newPass = await bcrypt.hash(passwords.newPassword, 10);

    return await this.patientsService.updatePassword(
      id,
      newPass,
      patient.password,
    );
  }
}
