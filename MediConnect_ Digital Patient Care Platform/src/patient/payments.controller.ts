import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PaginationDto } from '../common/dtos/pagination.dto.js';
import { DemoPaymentDto } from './dtos/demo-payment.dto.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Payments (Demo)')
@ApiBearerAuth('JWT')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('demo')
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @ApiOperation({
    summary: 'Simulate consultation payment; no gateway or money transfer',
    description: 'Use success or failed to demonstrate the local payment flow. The approved doctor consultation fee is read from the database.',
  })
  @ApiResponse({ status: 201, description: 'Demo payment recorded' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Patient role required' })
  @ApiResponse({ status: 404, description: 'Case not found or not owned by patient' })
  @ApiResponse({ status: 409, description: 'Already paid, duplicate ID, non-draft case or unapproved doctor' })
  async demoPayment(@Req() req: any, @Body() payment: DemoPaymentDto) {
    return await this.paymentsService.demoPayment(req.user.id, payment);
  }

  @Get()
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @ApiOperation({ summary: 'List the logged-in patient payments with pagination' })
  async getMyPayments(@Req() req: any, @Query() pagination: PaginationDto) {
    return await this.paymentsService.getMyPayments(req.user.id, pagination);
  }

  @Get(':id')
  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @ApiOperation({ summary: 'View one of the logged-in patient payments' })
  async getMyPaymentById(@Req() req: any, @Param('id') id: string) {
    return await this.paymentsService.getMyPaymentById(req.user.id, id);
  }
}
