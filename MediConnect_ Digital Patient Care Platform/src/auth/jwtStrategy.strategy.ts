import { DoctorsService } from '../doctors/doctors.service.js';
import { AdminsService } from '../admins/admins.service.js';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PatientsService } from '../patient/patients.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
      algorithms: ['HS256'],
    });
  }

  async validate(payloads: any) {
    if (!payloads || typeof payloads.role !== 'string') {
      throw new UnauthorizedException('Invalid token');
    }

    if (payloads.role === 'patient') {
      if (typeof payloads.id !== 'string') {
        throw new UnauthorizedException('Invalid token');
      }

      const patient = await this.patientsService.getPatientById(payloads.id);

      if (!patient || patient.role !== 'patient') {
        throw new UnauthorizedException('Patient account not found');
      }

      return {
        id: patient.patientId,
        email: patient.email,
        role: patient.role,
      };
    }

    if (!Number.isInteger(payloads.sub) || payloads.sub < 1) {
      throw new UnauthorizedException('Invalid token');
    }

    if (payloads.role === 'DOCTOR') {
      const doctor = await this.doctorsService.getDoctorForToken(payloads.sub);
      if (doctor) {
        return { ...doctor, role: 'DOCTOR' };
      }
    } else if (payloads.role === 'ADMIN') {
      const admin = await this.adminsService.getAdminForToken(payloads.sub);
      if (admin) {
        return { ...admin, role: 'ADMIN' };
      }
    }

    throw new UnauthorizedException('Invalid token or account no longer exists');
  }
}
