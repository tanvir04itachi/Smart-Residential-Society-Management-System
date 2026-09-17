import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { StringValue } from 'ms';
import { MoreThan, Repository } from 'typeorm';
import { OtpToken, RefreshToken, User } from '../../database/entities';
import { APP_CONSTANTS } from '../../common/constants/app.constants';
import { OtpPurpose, Role } from '../../common/enums';
import { hoursFromNow, minutesFromNow } from '../../common/utils/date.util';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
    @InjectRepository(OtpToken)
    private otpTokensRepository: Repository<OtpToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  private async issueTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiry',
      ) as StringValue,
    });

    const refreshTokenValue = uuidv4();
    const refreshExpiry = this.configService.get<string>('jwt.refreshExpiry')!;
    const days = parseInt(refreshExpiry, 10) || 7;
    const refreshToken = this.refreshTokensRepository.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: hoursFromNow(days * 24),
      isRevoked: false,
    });
    await this.refreshTokensRepository.save(refreshToken);

    return { accessToken, refreshToken: refreshTokenValue };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Account is deactivated');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new ForbiddenException({
        message: 'Account is locked due to multiple failed login attempts',
        lockedUntil: user.lockedUntil,
      });
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= APP_CONSTANTS.ACCOUNT_LOCKOUT_ATTEMPTS) {
        user.lockedUntil = hoursFromNow(
          APP_CONSTANTS.ACCOUNT_LOCKOUT_DURATION_HOURS,
        );
      }
      await this.usersRepository.save(user);
      throw new UnauthorizedException('Invalid email or password');
    }

    user.loginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await this.usersRepository.save(user);

    const tokens = await this.issueTokens(user);
    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async refresh(refreshTokenValue: string) {
    const existing = await this.refreshTokensRepository.findOne({
      where: { token: refreshTokenValue },
      relations: { user: true },
    });

    if (!existing || existing.isRevoked || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    existing.isRevoked = true;
    await this.refreshTokensRepository.save(existing);

    const tokens = await this.issueTokens(existing.user);
    return tokens;
  }

  async logout(refreshTokenValue: string) {
    await this.refreshTokensRepository.update(
      { token: refreshTokenValue },
      { isRevoked: true },
    );
    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user || user.role !== Role.RESIDENT || !user.isActive) {
      throw new BadRequestException(
        'Password reset is available only for registered resident accounts',
      );
    }

    const otp = randomInt(100000, 999999).toString();
    const otpToken = this.otpTokensRepository.create({
      userId: user.id,
      token: otp,
      purpose: OtpPurpose.PASSWORD_RESET,
      expiresAt: minutesFromNow(APP_CONSTANTS.OTP_EXPIRY_MINUTES),
    });
    await this.otpTokensRepository.save(otpToken);

    const otpRecipient =
      this.configService.get<string>('mail.otpRecipient') || user.email;
    await this.mailService.sendOtpEmail(
      otpRecipient,
      otp,
      APP_CONSTANTS.OTP_EXPIRY_MINUTES,
    );

    return { success: true };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user || user.role !== Role.RESIDENT || !user.isActive) {
      throw new BadRequestException('Invalid OTP');
    }

    const otpToken = await this.otpTokensRepository.findOne({
      where: {
        userId: user.id,
        token: otp,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpToken || otpToken.usedAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    return { valid: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (!user || user.role !== Role.RESIDENT || !user.isActive) {
      throw new BadRequestException('Invalid OTP');
    }

    const otpToken = await this.otpTokensRepository.findOne({
      where: {
        userId: user.id,
        token: dto.otp,
        purpose: OtpPurpose.PASSWORD_RESET,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!otpToken || otpToken.usedAt) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.passwordHash = await bcrypt.hash(
      dto.newPassword,
      APP_CONSTANTS.BCRYPT_COST_FACTOR,
    );
    user.loginAttempts = 0;
    user.lockedUntil = null;
    await this.usersRepository.save(user);

    otpToken.usedAt = new Date();
    await this.otpTokensRepository.save(otpToken);

    await this.refreshTokensRepository.update(
      { userId: user.id },
      { isRevoked: true },
    );

    return { success: true };
  }

  async getMe(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profilePicture: user.profilePicture,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
