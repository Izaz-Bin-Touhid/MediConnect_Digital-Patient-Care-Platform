import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PatientsService } from '../patient/patients.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly patientsService: PatientsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || '',
    });
  }

  async validate(payloads: any) {
    if (!payloads || !payloads.id || typeof payloads.role !== 'string') {
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

    return {
      id: payloads.id,
      email: payloads.email,
      role: payloads.role,
    };
  }
}
