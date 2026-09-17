import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { AnnouncementScope, Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  CreateAnnouncementSchema,
} from './dto/create-announcement.dto';
import {
  UpdateAnnouncementDto,
  UpdateAnnouncementSchema,
} from './dto/update-announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'List announcements (resident sees own scope)' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@CurrentUser() user: User) {
    return this.announcementsService.findAll(user);
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create announcement' })
  @ApiBody({
    schema: {
      example: {
        title: 'Block A lift servicing',
        body: 'The lift in Block A will be under maintenance tomorrow from 9am-1pm.',
        scope: AnnouncementScope.BLOCK,
        attachmentUrl: 'https://example.com/notices/lift-servicing.pdf',
        targets: [{ blockId: '7d009fe7-21cd-405c-a886-99bee9f2ba5f' }],
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(
    @Body(new ZodValidationPipe(CreateAnnouncementSchema))
    dto: CreateAnnouncementDto,
    @CurrentUser() user: User,
  ) {
    return this.announcementsService.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get announcement detail' })
  @ApiParam({ name: 'id', example: 'ad1d0119-671a-45f7-bc64-1229319520b1' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.announcementsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update announcement' })
  @ApiParam({ name: 'id', example: 'ad1d0119-671a-45f7-bc64-1229319520b1' })
  @ApiBody({
    schema: {
      example: {
        title: 'Water supply maintenance (rescheduled)',
        body: 'Water supply interruption moved to Saturday 10am-2pm.',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAnnouncementSchema))
    dto: UpdateAnnouncementDto,
  ) {
    return this.announcementsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Delete announcement' })
  @ApiParam({ name: 'id', example: 'ad1d0119-671a-45f7-bc64-1229319520b1' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  remove(@Param('id') id: string) {
    return this.announcementsService.remove(id);
  }
}
