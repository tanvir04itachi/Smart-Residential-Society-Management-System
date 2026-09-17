import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { AuditLog } from './database/entities';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ResidentsModule } from './modules/residents/residents.module';
import { BlocksModule } from './modules/blocks/blocks.module';
import { FlatsModule } from './modules/flats/flats.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { VisitorsModule } from './modules/visitors/visitors.module';
import { BillingModule } from './modules/billing/billing.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AmenitiesModule } from './modules/amenities/amenities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { MailModule } from './modules/mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database')!,
    }),
    TypeOrmModule.forFeature([AuditLog]),
    AuthModule,
    UsersModule,
    ResidentsModule,
    BlocksModule,
    FlatsModule,
    ComplaintsModule,
    VisitorsModule,
    BillingModule,
    AnnouncementsModule,
    AmenitiesModule,
    NotificationsModule,
    ReportsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
