import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payments } from './entities/payments.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Payments])],
})
export class PaymentsModule {}
