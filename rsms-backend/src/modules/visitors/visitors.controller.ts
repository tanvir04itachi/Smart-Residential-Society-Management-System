import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { Role, VisitorType } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { VisitorsService } from './visitors.service';
import {
  PreRegisterVisitorDto,
  PreRegisterVisitorSchema,
} from './dto/pre-register-visitor.dto';
import {
  WalkInVisitorDto,
  WalkInVisitorSchema,
} from './dto/walk-in-visitor.dto';
import { FlagVisitorDto, FlagVisitorSchema } from './dto/flag-visitor.dto';

@ApiTags('visitors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('visitors')
export class VisitorsController {
  constructor(private visitorsService: VisitorsService) {}

  @Post('pre-register')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Pre-register a visitor' })
  @ApiBody({
    schema: {
      example: {
        visitorName: 'Dr. Sharmin Akter',
        phone: '+8801912345678',
        purpose: 'Family visit',
        visitorType: VisitorType.REGULAR,
        expectedArrival: '2026-09-20T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Visitor pre-registered' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  preRegister(
    @Body(new ZodValidationPipe(PreRegisterVisitorSchema))
    dto: PreRegisterVisitorDto,
    @CurrentUser() user: User,
  ) {
    return this.visitorsService.preRegister(dto, user);
  }

  @Get('my')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'My visitor registrations' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findMine(@CurrentUser() user: User) {
    return this.visitorsService.findMine(user);
  }

  @Get('search')
  @Roles(Role.GUARD)
  @ApiOperation({ summary: 'Search by name or phone' })
  @ApiQuery({ name: 'q', required: true, example: 'Sharmin' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  search(@Query('q') q: string) {
    return this.visitorsService.search(q ?? '');
  }

  @Post('walk-in')
  @Roles(Role.GUARD)
  @ApiOperation({ summary: 'Walk-in visitor -> notify resident' })
  @ApiBody({
    schema: {
      example: {
        visitorName: 'Courier - Pathao',
        phone: '+8801812345678',
        purpose: 'Package delivery',
        visitorType: VisitorType.DELIVERY,
        flatId: 'cbf26697-85f1-428f-93d3-39a3b54459ca',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Walk-in visitor logged' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  walkIn(
    @Body(new ZodValidationPipe(WalkInVisitorSchema)) dto: WalkInVisitorDto,
    @CurrentUser() user: User,
  ) {
    return this.visitorsService.walkIn(dto, user);
  }

  @Get('log')
  @Roles(Role.MANAGER, Role.GUARD)
  @ApiOperation({ summary: 'Full visitor log' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  log() {
    return this.visitorsService.log();
  }

  @Get('deliveries')
  @Roles(Role.GUARD, Role.MANAGER)
  @ApiOperation({ summary: 'Delivery-only log' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  deliveries() {
    return this.visitorsService.deliveries();
  }

  @Post(':id/entry')
  @Roles(Role.GUARD)
  @ApiOperation({ summary: 'Log visitor entry' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 201, description: 'Entry logged' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  entry(@Param('id') id: string, @CurrentUser() user: User) {
    return this.visitorsService.logEntry(id, user);
  }

  @Post(':id/exit')
  @Roles(Role.GUARD)
  @ApiOperation({ summary: 'Log visitor exit' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 201, description: 'Exit logged' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  exit(@Param('id') id: string) {
    return this.visitorsService.logExit(id);
  }

  @Post(':id/approve')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Approve walk-in visitor' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 201, description: 'Visitor approved' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.visitorsService.approve(id, user);
  }

  @Post(':id/deny')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Deny walk-in visitor' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 201, description: 'Visitor denied' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  deny(@Param('id') id: string, @CurrentUser() user: User) {
    return this.visitorsService.deny(id, user);
  }

  @Patch(':id/flag')
  @Roles(Role.GUARD)
  @ApiOperation({ summary: 'Flag as suspicious + escalate' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiBody({
    schema: {
      example: { reason: 'Could not verify identity at the gate' },
    },
  })
  @ApiResponse({ status: 200, description: 'Visitor flagged' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  flag(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(FlagVisitorSchema)) dto: FlagVisitorDto,
  ) {
    return this.visitorsService.flag(id, dto);
  }
}
