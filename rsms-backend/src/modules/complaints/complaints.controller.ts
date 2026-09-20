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
import {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
  Role,
} from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { ComplaintsService } from './complaints.service';
import {
  CreateComplaintDto,
  CreateComplaintSchema,
} from './dto/create-complaint.dto';
import {
  AssignComplaintDto,
  AssignComplaintSchema,
} from './dto/assign-complaint.dto';
import {
  UpdateComplaintStatusDto,
  UpdateComplaintStatusSchema,
} from './dto/update-complaint-status.dto';
import { AddNotesDto, AddNotesSchema } from './dto/add-notes.dto';

@ApiTags('complaints')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('complaints')
export class ComplaintsController {
  constructor(private complaintsService: ComplaintsService) {}

  @Get()
  @Roles(Role.MANAGER, Role.MAINTENANCE)
  @ApiOperation({ summary: 'All complaints (paginated, filterable)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ComplaintStatus,
    example: ComplaintStatus.PENDING,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: ComplaintCategory,
    example: ComplaintCategory.PLUMBING,
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: ComplaintStatus,
    @Query('category') category?: string,
  ) {
    return this.complaintsService.findAll({ page, limit, status, category });
  }

  @Post()
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Submit a new complaint' })
  @ApiBody({
    schema: {
      example: {
        title: 'Leaking kitchen faucet',
        description: 'The kitchen faucet has been leaking for two days.',
        category: ComplaintCategory.PLUMBING,
        priority: ComplaintPriority.HIGH,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Complaint created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(
    @Body(new ZodValidationPipe(CreateComplaintSchema))
    dto: CreateComplaintDto,
    @CurrentUser() user: User,
  ) {
    return this.complaintsService.create(dto, user);
  }

  @Get('my')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'My complaints' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findMine(@CurrentUser() user: User) {
    return this.complaintsService.findMine(user);
  }

  @Get('assigned')
  @Roles(Role.MAINTENANCE)
  @ApiOperation({ summary: 'Complaints assigned to me' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAssigned(@CurrentUser() user: User) {
    return this.complaintsService.findAssigned(user);
  }

  @Get('report')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Weekly/monthly summary report' })
  @ApiQuery({ name: 'from', required: false, example: '2026-09-01' })
  @ApiQuery({ name: 'to', required: false, example: '2026-09-30' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  report(@Query('from') from?: string, @Query('to') to?: string) {
    return this.complaintsService.report(from, to);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.RESIDENT, Role.MAINTENANCE)
  @ApiOperation({ summary: 'Complaint detail' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.complaintsService.findOne(id, user);
  }

  @Patch(':id/assign')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Assign to maintenance staff' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiBody({
    schema: {
      example: { assignedToId: 'MNT-01' },
    },
  })
  @ApiResponse({ status: 200, description: 'Complaint assigned' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignComplaintSchema))
    dto: AssignComplaintDto,
  ) {
    return this.complaintsService.assign(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.MAINTENANCE, Role.MANAGER)
  @ApiOperation({ summary: 'Update status' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiBody({
    schema: { example: { status: ComplaintStatus.IN_PROGRESS } },
  })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateComplaintStatusSchema))
    dto: UpdateComplaintStatusDto,
  ) {
    return this.complaintsService.updateStatus(id, dto);
  }

  @Patch(':id/reopen')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Reopen resolved complaint' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 200, description: 'Complaint reopened' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  reopen(@Param('id') id: string, @CurrentUser() user: User) {
    return this.complaintsService.reopen(id, user);
  }

  @Patch(':id/notes')
  @Roles(Role.MAINTENANCE)
  @ApiOperation({ summary: 'Add work notes' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiBody({
    schema: {
      example: { staffNotes: 'Replaced the faucet washer, tested for leaks.' },
    },
  })
  @ApiResponse({ status: 200, description: 'Notes added' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  addNotes(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AddNotesSchema)) dto: AddNotesDto,
    @CurrentUser() user: User,
  ) {
    return this.complaintsService.addNotes(id, dto, user);
  }
}
