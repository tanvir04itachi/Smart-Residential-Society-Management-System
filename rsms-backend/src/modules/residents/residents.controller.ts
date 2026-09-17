import {
  Body,
  Controller,
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
import { Role, ResidentType } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { ResidentsService } from './residents.service';
import {
  CreateResidentDto,
  CreateResidentSchema,
} from './dto/create-resident.dto';
import {
  UpdateResidentDto,
  UpdateResidentSchema,
} from './dto/update-resident.dto';

@ApiTags('residents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('residents')
export class ResidentsController {
  constructor(private residentsService: ResidentsService) {}

  @Get()
  @Roles(Role.MANAGER, Role.ACCOUNTANT)
  @ApiOperation({ summary: 'List all residents' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAll() {
    return this.residentsService.findAll();
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Onboard new resident + create user account' })
  @ApiBody({
    schema: {
      example: {
        fullName: 'Tanvir Ahmed',
        email: 'resident7@rsms.com',
        phone: '+8801710000011',
        password: 'Passw0rd!123',
        flatId: 'cbf26697-85f1-428f-93d3-39a3b54459ca',
        type: ResidentType.OWNER,
        emergencyContact: '+8801910000000',
        familyMembers: [{ name: 'Rina Ahmed', relation: 'Spouse' }],
        moveInDate: '2026-01-15',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Resident created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(
    @Body(new ZodValidationPipe(CreateResidentSchema))
    dto: CreateResidentDto,
  ) {
    return this.residentsService.create(dto);
  }

  @Get('flat/:flatId/history')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Occupancy history of a flat' })
  @ApiParam({
    name: 'flatId',
    example: 'cbf26697-85f1-428f-93d3-39a3b54459ca',
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  flatHistory(@Param('flatId') flatId: string) {
    return this.residentsService.flatHistory(flatId);
  }

  @Get(':id')
  @Roles(Role.MANAGER, Role.RESIDENT)
  @ApiOperation({ summary: 'Get resident profile' })
  @ApiParam({ name: 'id', example: 'f461022c-164b-49d2-8504-57047a3b9836' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.residentsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.MANAGER, Role.RESIDENT)
  @ApiOperation({ summary: 'Update profile' })
  @ApiParam({ name: 'id', example: 'f461022c-164b-49d2-8504-57047a3b9836' })
  @ApiBody({
    schema: {
      example: {
        emergencyContact: '+8801910000099',
        familyMembers: [{ name: 'Rina Ahmed', relation: 'Spouse' }],
        isActive: true,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateResidentSchema))
    dto: UpdateResidentDto,
    @CurrentUser() user: User,
  ) {
    return this.residentsService.update(id, dto, user);
  }
}
