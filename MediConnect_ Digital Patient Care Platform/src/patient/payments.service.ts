import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { DoctorProfile } from '../doctors/entities/doctor-profile.entity.js';
import { DemoPaymentDto } from './dtos/demo-payment.dto.js';
import { PatientCases } from './entities/patient-cases.entity.js';
import { Payments } from './entities/payments.entity.js';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepo: Repository<Payments>,
    private readonly dataSource: DataSource,
  ) {}

  async demoPayment(patientId: string, dto: DemoPaymentDto): Promise<Payments> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const patientCase = await queryRunner.manager.findOne(PatientCases, {
        where: { caseId: dto.caseId },
        lock: { mode: 'pessimistic_write' },
      });
      const ownCase = await queryRunner.manager.findOne(PatientCases, {
        where: { caseId: dto.caseId, patient: { patientId } },
      });

      if (!patientCase || !ownCase) {
        throw new NotFoundException('Case not found');
      }
      if (patientCase.status !== 'draft') {
        throw new ConflictException('Only an unpaid draft case can receive payment');
      }

      const duplicate = await queryRunner.manager.findOne(Payments, {
        where: { paymentId: dto.paymentId },
      });
      if (duplicate) {
        throw new ConflictException('Payment ID already exists');
      }
      const paid = await queryRunner.manager.findOne(Payments, {
        where: {
          patientCase: { caseId: dto.caseId },
          paymentStatus: 'success',
        },
      });
      if (paid) {
        throw new ConflictException('This case is already paid');
      }

      const profile = await queryRunner.manager.findOne(DoctorProfile, {
        where: {
          doctor_id: patientCase.doctorId,
          verification_status: 'APPROVED',
        },
      });
      if (!profile) {
        throw new ConflictException('The selected doctor must have an approved profile');
      }
      const fee = Number(profile.consultation_fee);
      if (!Number.isFinite(fee) || fee < 0 || fee > 99999999.99) {
        throw new ConflictException('Doctor consultation fee is invalid');
      }
      const success = dto.result === 'success';
      const payment = queryRunner.manager.create(Payments, {
        paymentId: dto.paymentId,
        patientCase: { caseId: patientCase.caseId },
        amount: fee.toFixed(2),
        paymentMethod: 'demo',
        transactionId: `DEMO-${dto.paymentId}`,
        paymentStatus: dto.result,
        doctorPayableAmount: success ? fee.toFixed(2) : '0.00',
        paidAt: success ? new Date() : null,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      if (success) {
        patientCase.status = 'submitted';
        await queryRunner.manager.save(patientCase);
      }

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      if (error instanceof QueryFailedError &&
          (error.driverError as { code?: string }).code === '23505') {
        throw new ConflictException('Payment ID or transaction already exists');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyPayments(patientId: string, pagination: PaginationDto) {
    const { page, limit } = pagination;
    const [data, total] = await this.paymentsRepo.findAndCount({
      where: { patientCase: { patient: { patientId } } },
      relations: { patientCase: true },
      order: { paymentId: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getMyPaymentById(patientId: string, id: string): Promise<Payments> {
    const payment = await this.paymentsRepo.findOne({
      where: { paymentId: id, patientCase: { patient: { patientId } } },
      relations: { patientCase: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
