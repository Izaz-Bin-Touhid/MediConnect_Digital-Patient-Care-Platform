import { ChangeAdminPasswordDto } from './dtos/change-admin-password.dto.js';
import { CreateAdminDto } from './dtos/create-admin.dto.js';
import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Post,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthActor } from '../auth/auth.types.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminsService } from './admins.service.js';
import { VerifyDoctorDto } from './dtos/verify-doctor.dto.js';
import { UpdateAdminDto } from './dtos/update-admin.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { CoordinatorService } from '../coordinator/coordinator.service.js';
import { ApproveCoordinatorApplicationDto } from '../coordinator/dto/coordinator-application.dto.js';
import { PaginationDto } from '../coordinator/dto/pagination.dto.js';
import { AssignCaseDto } from '../coordinator/dto/workflow.dto.js';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiTags('Admins')
@ApiBearerAuth()
export class AdminsController {
  constructor(
    private readonly adminsService: AdminsService,
    private readonly coordinatorService: CoordinatorService,
  ) {}

  @Post()
  async createAdmin(@Body() dto: CreateAdminDto) {
    return await this.adminsService.createAdmin(dto);
  }

  @Get('me')
  async getOwnProfile(@CurrentUser() actor: AuthActor) {
    return await this.adminsService.getOwnProfile(actor.sub);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() actor: AuthActor,
    @Body() dto: ChangeAdminPasswordDto,
  ) {
    return await this.adminsService.changePassword(actor.sub, dto);
  }

  @Patch('me')
  async updateOwnProfile(
    @CurrentUser() actor: AuthActor,
    @Body() dto: UpdateAdminDto,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('Provide an admin profile field to update');
    }
    return await this.adminsService.updateOwnProfile(actor.sub, dto);
  }

  @Get('doctor-profiles')
  async getDoctorProfiles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status', new DefaultValuePipe('PENDING')) status: string,
  ) {
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      limit < 1 ||
      limit > 100 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new BadRequestException(
        'page must be positive; limit must be between 1 and 100',
      );
    }
    return await this.adminsService.getDoctorProfiles(page, limit, status);
  }

  @Get('coordinator-applications')
  async listCoordinatorApplications(@Query() page: PaginationDto) {
    return await this.coordinatorService.listApplications(page);
  }

  @Post('coordinator-applications/:applicationId/approve')
  async approveCoordinatorApplication(
    @CurrentUser() actor: AuthActor,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() dto: ApproveCoordinatorApplicationDto,
  ) {
    return await this.coordinatorService.approveApplication(
      actor.sub,
      applicationId,
      dto,
    );
  }

  @Get('coordinators')
  async listCoordinators(@Query() page: PaginationDto) {
    return await this.coordinatorService.listCoordinators(page);
  }

  @Patch('cases/:caseId/coordinator')
  async assignCoordinator(
    @Param('caseId') caseId: string,
    @Body() dto: AssignCaseDto,
  ) {
    return await this.coordinatorService.assignCase(caseId, dto.coordinatorId);
  }

  @Get('doctor-profiles/:id')
  async getDoctorProfileById(@Param('id', ParseIntPipe) id: number) {
    return await this.adminsService.getDoctorProfileById(id);
  }

  @Patch('doctor-profiles/:id/verification')
  async verifyDoctor(
    @CurrentUser() actor: AuthActor,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyDoctorDto,
  ) {
    return await this.adminsService.verifyDoctor(id, actor.sub, dto);
  }
}
