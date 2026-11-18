import { DataSource } from 'typeorm';
import { CoordinatorProfile } from '../coordinator/entities/coordinator-profile.entity.js';
import { DiagnosticCenter } from '../coordinator/entities/diagnostic-center.entity.js';
import { DoctorsService } from '../doctors/doctors.service.js';
import { AdminsService } from '../admins/admins.service.js';
import { AccountLoginDto } from './dtos/account-login.dto.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PatientsService } from '../patient/patients.service.js';
import { Patients } from '../patient/entities/patients.entity.js';
import { RegistrationDto } from './dtos/registration.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ChangePasswordDto } from './dtos/change-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly doctorsService: DoctorsService,
    private readonly adminsService: AdminsService,
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

  async doctorLogin(dto: AccountLoginDto) {
    const doctor = await this.doctorsService.getDoctorForLogin(dto.email);

    if (!doctor || !(await bcrypt.compare(dto.password, doctor.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = await this.jwtService.signAsync(
      { sub: doctor.doctor_id, role: 'DOCTOR' },
      { secret: process.env.JWT_SECRET },
    );

    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }

  async adminLogin(dto: AccountLoginDto) {
    const admin = await this.adminsService.getAdminForLogin(dto.email);

    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = await this.jwtService.signAsync(
      { sub: admin.admin_id, role: 'ADMIN' },
      { secret: process.env.JWT_SECRET },
    );

    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }

  async hashPassword(password: string): Promise<string> {
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw new BadRequestException('Password must be at most 72 UTF-8 bytes');
    }
    return await bcrypt.hash(password, 10);
  }

  async coordinatorLogin(dto: AccountLoginDto) {
    const profile = await this.dataSource.getRepository(CoordinatorProfile).findOne({
      where: { email: dto.email.trim().toLowerCase() },
      select: { coordinatorId: true, password: true, tokenVersion: true },
    });
    if (!profile || Buffer.byteLength(dto.password, 'utf8') > 72 ||
        !(await bcrypt.compare(dto.password, profile.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = await this.jwtService.signAsync(
      { id: profile.coordinatorId, role: 'coordinator', tokenVersion: profile.tokenVersion },
      { secret: process.env.JWT_SECRET },
    );
    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }

  async diagnosticLogin(dto: AccountLoginDto) {
    const center = await this.dataSource.getRepository(DiagnosticCenter).findOne({
      where: { email: dto.email.trim().toLowerCase() },
      select: { centerId: true, password: true },
    });
    if (!center || Buffer.byteLength(dto.password, 'utf8') > 72 ||
        !(await bcrypt.compare(dto.password, center.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = await this.jwtService.signAsync(
      { id: center.centerId, role: 'diagnostic_center' },
      { secret: process.env.JWT_SECRET },
    );
    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }

  async changeCoordinatorPassword(id: string, dto: ChangePasswordDto) {
    const repo = this.dataSource.getRepository(CoordinatorProfile);
    const profile = await repo.findOne({
      where: { coordinatorId: id },
      select: { coordinatorId: true, password: true, tokenVersion: true },
    });
    if (!profile || !(await bcrypt.compare(dto.oldPassword, profile.password))) {
      throw new UnauthorizedException('Invalid current password');
    }
    const result = await repo.update(
      { coordinatorId: id, password: profile.password },
      { password: await this.hashPassword(dto.newPassword), tokenVersion: profile.tokenVersion + 1 },
    );
    if (!result.affected) {
      throw new BadRequestException('Account changed; log in and try again');
    }
    return 'Password changed successfully';
  }

  async coordinatorLogout(id: string) {
    await this.dataSource.getRepository(CoordinatorProfile).increment({ coordinatorId: id }, 'tokenVersion', 1);
    return 'Logged out successfully';
  }

}
