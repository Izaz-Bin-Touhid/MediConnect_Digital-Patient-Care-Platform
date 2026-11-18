import { Doctors } from '../doctors/entities/doctors.entity.js';
import { Patients } from '../patient/entities/patients.entity.js';
import { PatientCases } from '../patient/entities/patient-cases.entity.js';
import { Payments } from '../patient/entities/payments.entity.js';
import { CoordinatorProfile } from '../coordinator/entities/coordinator-profile.entity.js';
import { MailService } from '../mail/mail.service.js';
import { ChangeAdminPasswordDto } from './dtos/change-admin-password.dto.js';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dtos/create-admin.dto.js';
import { BadRequestException, ConflictException, UnauthorizedException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Admins } from './entities/admins.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { VerifyDoctorDto } from './dtos/verify-doctor.dto.js';
import { UpdateAdminDto } from './dtos/update-admin.dto.js';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admins)
    private readonly adminRepo: Repository<Admins>,
    @InjectRepository(DoctorProfile)
    private readonly profileRepo: Repository<DoctorProfile>,
    private readonly mailService: MailService,
    @InjectRepository(Doctors)
    private readonly doctorRepo: Repository<Doctors>,
    @InjectRepository(Patients)
    private readonly patientRepo: Repository<Patients>,
    @InjectRepository(PatientCases)
    private readonly caseRepo: Repository<PatientCases>,
    @InjectRepository(Payments)
    private readonly paymentRepo: Repository<Payments>,
    @InjectRepository(CoordinatorProfile)
    private readonly coordinatorRepo: Repository<CoordinatorProfile>,
  ) {}

  async getSummary() {
    const [patients, doctors, coordinators, admins, draftProfiles, pendingProfiles,
      approvedProfiles, rejectedProfiles, caseStatuses, paymentStatuses, paidTotals] = await Promise.all([
      this.patientRepo.count(),
      this.doctorRepo.count(),
      this.coordinatorRepo.count(),
      this.adminRepo.count(),
      this.profileRepo.count({ where: { verification_status: 'DRAFT' } }),
      this.profileRepo.count({ where: { verification_status: 'PENDING' } }),
      this.profileRepo.count({ where: { verification_status: 'APPROVED' } }),
      this.profileRepo.count({ where: { verification_status: 'REJECTED' } }),
      this.caseRepo.createQueryBuilder('patientCase')
        .select('patientCase.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('patientCase.status')
        .orderBy('patientCase.status', 'ASC')
        .getRawMany<{ status: string; count: string }>(),
      this.paymentRepo.createQueryBuilder('payment')
        .select('payment.paymentStatus', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('payment.paymentStatus')
        .orderBy('payment.paymentStatus', 'ASC')
        .getRawMany<{ status: string; count: string }>(),
      this.paymentRepo.createQueryBuilder('payment')
        .select('COALESCE(SUM(payment.amount), 0)', 'amount')
        .addSelect('COALESCE(SUM(payment.doctorPayableAmount), 0)', 'doctorPayableAmount')
        .where('payment.paymentStatus = :status', { status: 'success' })
        .getRawOne<{ amount: string; doctorPayableAmount: string }>(),
    ]);

    return {
      users: { patients, doctors, coordinators, admins },
      doctor_profiles: {
        draft: draftProfiles, pending: pendingProfiles,
        approved: approvedProfiles, rejected: rejectedProfiles,
      },
      cases: {
        total: caseStatuses.reduce((total, row) => total + Number(row.count), 0),
        by_status: caseStatuses.map(row => ({ status: row.status, count: Number(row.count) })),
      },
      payments: {
        mode: 'demo',
        total: paymentStatuses.reduce((total, row) => total + Number(row.count), 0),
        by_status: paymentStatuses.map(row => ({ status: row.status, count: Number(row.count) })),
        successful_amount: paidTotals?.amount ?? '0',
        doctor_payable_amount: paidTotals?.doctorPayableAmount ?? '0',
      },
    };
  }

  async getAdminForLogin(email: string) {
    return await this.adminRepo.findOne({
      where: { email },
      select: { admin_id: true, password: true },
    });
  }

  async getAdminForToken(id: number) {
    return await this.adminRepo.findOne({ where: { admin_id: id } });
  }

  async updateOwnProfile(id: number, dto: UpdateAdminDto) {
    try {
      const result = await this.adminRepo.update(id, dto);
      if (!result.affected) throw new NotFoundException('Admin not found');
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('This admin email is already registered');
      }
      throw error;
    }
    return await this.getAdminForToken(id);
  }

  async getDoctorProfiles(page: number, limit: number, status: string) {
    if (!['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid verification status');
    }
    const [data, total] = await this.profileRepo.findAndCount({
      where: { verification_status: status },
      relations: { doctor: true },
      order: { profile_id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getDoctorProfileById(id: number) {
    const profile = await this.profileRepo.findOne({
      where: { profile_id: id },
      relations: { doctor: true },
    });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }

  async verifyDoctor(id: number, adminId: number, dto: VerifyDoctorDto) {
    const profile = await this.getDoctorProfileById(id);
    if (profile.verification_status !== 'PENDING') {
      throw new ConflictException('Only PENDING profiles can be reviewed');
    }
    const result = await this.profileRepo.update(
      { profile_id: id, verification_status: 'PENDING' },
      {
        verification_status: dto.verification_status,
        admin_id: adminId,
        verified_at: dto.verification_status === 'APPROVED' ? new Date() : null,
      },
    );
    if (!result.affected) {
      throw new ConflictException('Profile was already reviewed; reload and try again');
    }
    await this.mailService.sendDoctorVerification(
      profile.doctor.email, profile.doctor.full_name, dto.verification_status,
    );
    return await this.getDoctorProfileById(id);
  }

  async createAdmin(dto: CreateAdminDto) {
    return await this.saveAdmin(dto, this.adminRepo);
  }

  private async saveAdmin(dto: CreateAdminDto, repository: Repository<Admins>) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const admin = repository.create({ ...dto, password: hashedPassword });
      const savedAdmin = await repository.save(admin);
      return {
        admin_id: savedAdmin.admin_id,
        full_name: savedAdmin.full_name,
        email: savedAdmin.email,
        phone: savedAdmin.phone,
      };
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('This admin email is already registered');
      }
      throw error;
    }
  }

  async changePassword(id: number, dto: ChangeAdminPasswordDto) {
    const admin = await this.adminRepo.findOne({
      where: { admin_id: id },
      select: { admin_id: true, password: true },
    });

    if (!admin || !(await bcrypt.compare(dto.current_password, admin.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await bcrypt.compare(dto.new_password, admin.password)) {
      throw new BadRequestException('New password must differ from the current password');
    }

    const hashedPassword = await bcrypt.hash(dto.new_password, 10);
    const result = await this.adminRepo.update(
      { admin_id: id, password: admin.password },
      { password: hashedPassword },
    );

    if (!result.affected) {
      throw new ConflictException('Password changed during this request; try again');
    }

    return { message: 'Password changed successfully' };
  }
}
