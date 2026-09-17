import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Observable, tap } from 'rxjs';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const { method, url, ip, headers } = request;

    if (method === 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const entity = url.split('/').filter(Boolean)[2] ?? url;

        this.auditLogRepository
          .insert({
            userId: request.user?.id ?? null,
            action: method,
            entity,
            entityId: (request.params as Record<string, string>)?.id ?? null,
            ipAddress: ip,
            userAgent: headers['user-agent'] ?? null,
          })
          .catch(() => undefined);
      }),
    );
  }
}
