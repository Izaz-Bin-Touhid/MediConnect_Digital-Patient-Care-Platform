import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { AuthService } from './auth.service.js';
import { RegistrationDto } from './dtos/registration.dto.js';
import { LoginDto } from './dtos/login.dto.js';
import { ChangePasswordDto } from './dtos/change-password.dto.js';
import { JwtGuards } from '../common/guards/jwtGuards.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registration')
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
  async login(@Body() loginDto: LoginDto): Promise<string> {
    return await this.authService.login(loginDto);
  }

  @UseGuards(JwtGuards, RolesGuard)
  @SetMetadata('roles', ['patient'])
  @Patch('change-password')
  async changePassword(@Req() req: any, @Body() passwords: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.id, passwords);
  }
}
