import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { AuthActor } from '../auth/auth.types.js';
import { CoordinationAdmin } from '../coordinator/entities/coordination-admin.entity.js';
import { CoordinatorProfile } from '../coordinator/entities/coordinator-profile.entity.js';
import { DiagnosticCenter } from '../coordinator/entities/diagnostic-center.entity.js';
import { Doctors } from '../doctors/entities/doctors.entity.js';
import { Patients } from '../patients/entities/patients.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly dataSource: DataSource) {}

  async findCredentials(email: string, role: AuthActor['role']) {
    const manager = this.dataSource.manager;
    switch (role) {
      case 'admin': {
        const account = await manager.findOne(CoordinationAdmin, {
          where: { email },
          select: { adminId: true, password: true },
        });
        return (
          account && {
            password: account.password,
            actor: { sub: account.adminId, role },
          }
        );
      }
      case 'doctor': {
        const account = await manager.findOne(Doctors, {
          where: { email },
          select: { doctor_id: true, password: true },
        });
        return (
          account && {
            password: account.password,
            actor: { sub: String(account.doctor_id), role },
          }
        );
      }
      case 'diagnostic_center': {
        const account = await manager.findOne(DiagnosticCenter, {
          where: { email },
          select: { centerId: true, password: true },
        });
        return (
          account && {
            password: account.password,
            actor: { sub: account.centerId, role },
          }
        );
      }
      case 'patient': {
        const account = await manager.findOne(Patients, {
          where: { email, role: 'patient' },
          select: { patientId: true, password: true },
        });
        return (
          account && {
            password: account.password,
            actor: { sub: account.patientId, role },
          }
        );
      }
      case 'coordinator': {
        const account = await manager.findOne(CoordinatorProfile, {
          where: { email },
          select: { coordinatorId: true, password: true, tokenVersion: true },
        });
        return (
          account && {
            password: account.password,
            actor: {
              sub: account.coordinatorId,
              role,
              tokenVersion: account.tokenVersion,
            },
          }
        );
      }
    }
  }
}
