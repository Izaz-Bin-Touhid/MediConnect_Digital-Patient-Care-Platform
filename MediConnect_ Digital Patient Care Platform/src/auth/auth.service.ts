import { AdminsService } from '../admins/admins.service.js';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DoctorsService } from '../doctors/doctors.service.js';
import { LoginDto } from './dtos/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly jwtService: JwtService,
    private readonly adminsService: AdminsService,
  ) {}

  async login(dto: LoginDto) {
    const doctor = await this.doctorsService.getDoctorForLogin(dto.email);

    if (!doctor || !(await bcrypt.compare(dto.password, doctor.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const access_token = await this.jwtService.signAsync({
      sub: doctor.doctor_id,
      role: 'DOCTOR',
    });

    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }

  async adminLogin(dto: LoginDto) {
    const admin = await this.adminsService.getAdminForLogin(dto.email);
    if (!admin || !(await bcrypt.compare(dto.password, admin.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const access_token = await this.jwtService.signAsync({
      sub: admin.admin_id, role: 'ADMIN',
    });
    return { access_token, token_type: 'Bearer', expires_in: 3600 };
  }
}
