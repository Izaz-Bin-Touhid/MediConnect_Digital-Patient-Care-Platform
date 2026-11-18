import { AdminsService } from '../admins/admins.service.js';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DoctorsService } from '../doctors/doctors.service.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly doctorsService: DoctorsService,
    private readonly adminsService: AdminsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub?: number; role?: string }) {
    if (!Number.isInteger(payload.sub) || !payload.sub || payload.sub < 1) {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.role === 'DOCTOR') {
      const doctor = await this.doctorsService.getDoctorForToken(payload.sub);
      if (doctor) return { ...doctor, role: 'DOCTOR' };
    } else if (payload.role === 'ADMIN') {
      const admin = await this.adminsService.getAdminForToken(payload.sub);
      if (admin) return { ...admin, role: 'ADMIN' };
    }

    throw new UnauthorizedException('Invalid token or account no longer exists');
  }
}
