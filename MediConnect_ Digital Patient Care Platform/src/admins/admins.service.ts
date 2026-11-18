import { ChangeAdminPasswordDto } from './dtos/change-admin-password.dto.js';
import { randomBytes } from 'node:crypto';
import { compare } from 'bcryptjs';
import { AuthService } from '../auth/auth.service.js';
import { CreateAdminDto } from './dtos/create-admin.dto.js';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CoordinationAdmin } from '../coordinator/entities/coordination-admin.entity.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { VerifyDoctorDto } from './dtos/verify-doctor.dto.js';
import { UpdateAdminDto } from './dtos/update-admin.dto.js';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(CoordinationAdmin)
    private readonly adminRepo: Repository<CoordinationAdmin>,
    @InjectRepository(DoctorProfile)
    private readonly profileRepo: Repository<DoctorProfile>,
    private readonly authService: AuthService,
  ) {}

  async getOwnProfile(adminId: string) {
    const admin = await this.adminRepo.findOneBy({ adminId });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return this.adminProfile(admin);
  }

  async updateOwnProfile(id: string, dto: UpdateAdminDto) {
    try {
      const result = await this.adminRepo.update(
        { adminId: id },
        {
          fullName: dto.full_name,
          email: dto.email?.toLowerCase(),
          phone: dto.phone,
        },
      );
      if (!result.affected) throw new NotFoundException('Admin not found');
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('This admin email is already registered');
      }
      throw error;
    }
    return await this.getOwnProfile(id);
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
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDoctorProfileById(id: number) {
    const profile = await this.profileRepo.findOne({
      where: { profile_id: id },
      relations: { doctor: true },
    });
    if (!profile) throw new NotFoundException('Doctor profile not found');
    return profile;
  }

  async verifyDoctor(id: number, adminId: string, dto: VerifyDoctorDto) {
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
      throw new ConflictException(
        'Profile was already reviewed; reload and try again',
      );
    }
    return await this.getDoctorProfileById(id);
  }

  async createAdmin(dto: CreateAdminDto) {
    const password = await this.authService.hashPassword(dto.password);
    try {
      const admin = this.adminRepo.create({
        adminId: randomBytes(7).toString('base64url'),
        fullName: dto.full_name,
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password,
      });
      return this.adminProfile(await this.adminRepo.save(admin));
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException('This admin email is already registered');
      }
      throw error;
    }
  }

  async changePassword(id: string, dto: ChangeAdminPasswordDto) {
    const admin = await this.adminRepo.findOne({
      where: { adminId: id },
      select: { adminId: true, password: true },
    });

    if (
      !admin ||
      Buffer.byteLength(dto.current_password, 'utf8') > 72 ||
      !(await compare(dto.current_password, admin.password))
    ) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (await compare(dto.new_password, admin.password)) {
      throw new BadRequestException(
        'New password must differ from the current password',
      );
    }

    const hashedPassword = await this.authService.hashPassword(
      dto.new_password,
    );
    const result = await this.adminRepo.update(
      { adminId: id, password: admin.password },
      { password: hashedPassword },
    );

    if (!result.affected) {
      throw new ConflictException(
        'Password changed during this request; try again',
      );
    }

    return { message: 'Password changed successfully' };
  }

  private adminProfile(admin: CoordinationAdmin) {
    return {
      admin_id: admin.adminId,
      full_name: admin.fullName,
      email: admin.email,
      phone: admin.phone,
    };
  }
}
