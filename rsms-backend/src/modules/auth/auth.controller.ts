import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { AuthService } from './auth.service';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { RefreshTokenDto, RefreshTokenSchema } from './dto/refresh-token.dto';
import {
  ForgotPasswordDto,
  ForgotPasswordSchema,
} from './dto/forgot-password.dto';
import { VerifyOtpDto, VerifyOtpSchema } from './dto/verify-otp.dto';
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email+password' })
  @ApiBody({
    schema: {
      example: { email: 'manager@rsms.com', password: 'Passw0rd!123' },
    },
  })
  @ApiResponse({ status: 201, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked or deactivated' })
  login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiBody({
    schema: {
      example: { refreshToken: '5b2a6e2e-8c9a-4b6d-9b34-1a2b3c4d5e6f' },
    },
  })
  @ApiResponse({ status: 201, description: 'Logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.logout(dto.refreshToken);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Exchange refresh token for new access token' })
  @ApiBody({
    schema: {
      example: { refreshToken: '5b2a6e2e-8c9a-4b6d-9b34-1a2b3c4d5e6f' },
    },
  })
  @ApiResponse({ status: 201, description: 'New tokens issued' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(
    @Body(new ZodValidationPipe(RefreshTokenSchema)) dto: RefreshTokenDto,
  ) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send OTP to email' })
  @ApiBody({ schema: { example: { email: 'resident1@rsms.com' } } })
  @ApiResponse({ status: 201, description: 'OTP sent if account exists' })
  forgotPassword(
    @Body(new ZodValidationPipe(ForgotPasswordSchema))
    dto: ForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP token' })
  @ApiBody({
    schema: {
      example: { email: 'resident1@rsms.com', otp: '482913' },
    },
  })
  @ApiResponse({ status: 201, description: 'OTP valid' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  verifyOtp(@Body(new ZodValidationPipe(VerifyOtpSchema)) dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto.email, dto.otp);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Set new password after OTP verification' })
  @ApiBody({
    schema: {
      example: {
        email: 'resident1@rsms.com',
        otp: '482913',
        newPassword: 'NewPassw0rd!456',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  resetPassword(
    @Body(new ZodValidationPipe(ResetPasswordSchema))
    dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  me(@CurrentUser() user: User) {
    return this.authService.getMe(user.id);
  }
}
