import { AccountLoginDto } from './dtos/account-login.dto.js';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthService } from './auth.service.js';
import { RegistrationDto } from './dtos/registration.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ChangePasswordDto } from './dtos/change-password.dto.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
  @ApiOperation({ summary: 'Register a patient account' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid registration body' })
  @ApiResponse({ status: 409, description: 'Patient ID or email already exists' })
  async registration(@Body() patient: RegistrationDto) {
    const registeredPatient = await this.authService.registration(patient);

    return {
      patientId: registeredPatient.patientId,
      fullName: registeredPatient.fullName,
      email: registeredPatient.email,
      phone: registeredPatient.phone,
      role: registeredPatient.role,
    };
  }

  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Log in as a patient and receive a JWT' })
  @ApiResponse({
    status: 200,
    description: 'Login response containing the JWT access token',
    schema: {
      type: 'object',
      required: ['success', 'message', 'data', 'meta'],
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Request completed successfully',
        },
        data: { type: 'string', description: 'JWT access token' },
        meta: { type: 'object', nullable: true, example: null },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid patient ID or password' })
  async login(@Body() loginDto: LoginDto): Promise<string> {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @Roles('patient')
  @Patch('change-password')
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Change the logged-in patient password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Old password is incorrect or body is invalid' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 403, description: 'Patient role required' })
  async changePassword(@Req() req: any, @Body() passwords: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.id, passwords);
  }

  @HttpCode(200)
  @Post('doctor/login')
  @ApiOperation({ summary: 'Log in as a doctor' })
  async doctorLogin(@Body() dto: AccountLoginDto) {
    return await this.authService.doctorLogin(dto);
  }

  @HttpCode(200)
  @Post('admin/login')
  @ApiOperation({ summary: 'Log in as an admin' })
  async adminLogin(@Body() dto: AccountLoginDto) {
    return await this.authService.adminLogin(dto);
  }

  @Get('me')
  @UseGuards(JwtGuards)
  @ApiBearerAuth('JWT')
  getProfile(@Req() req: any) {
    return req.user;
  }

}
