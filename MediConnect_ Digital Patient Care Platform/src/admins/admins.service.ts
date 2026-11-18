import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}

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
    return await this.getDoctorProfileById(id);
  }
}
