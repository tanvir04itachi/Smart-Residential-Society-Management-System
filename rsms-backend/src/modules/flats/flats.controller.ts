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
import { Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { FlatsService } from './flats.service';
import { CreateFlatDto, CreateFlatSchema } from './dto/create-flat.dto';
import {
  AssignResidentDto,
  AssignResidentSchema,
} from './dto/assign-resident.dto';

@ApiTags('flats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('flats')
export class FlatsController {
  constructor(private flatsService: FlatsService) {}

  @Get()
  @Roles(Role.MANAGER, Role.GUARD)
  @ApiOperation({ summary: 'List all flats' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAll() {
    return this.flatsService.findAll();
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create flat' })
  @ApiBody({
    schema: {
      example: {
        blockId: '7d009fe7-21cd-405c-a886-99bee9f2ba5f',
        floorNumber: 4,
        flatNumber: 'A-401',
        area: 1350,
        flatType: '3BHK',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Flat created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(@Body(new ZodValidationPipe(CreateFlatSchema)) dto: CreateFlatDto) {
    return this.flatsService.create(dto);
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Flat detail + current resident' })
  @ApiParam({ name: 'id', example: 'cbf26697-85f1-428f-93d3-39a3b54459ca' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findOne(@Param('id') id: string) {
    return this.flatsService.findOne(id);
  }

  @Patch(':id/assign')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Assign resident to flat' })
  @ApiParam({ name: 'id', example: 'cbf26697-85f1-428f-93d3-39a3b54459ca' })
  @ApiBody({
    schema: {
      example: { residentId: 'f461022c-164b-49d2-8504-57047a3b9836' },
    },
  })
  @ApiResponse({ status: 200, description: 'Resident assigned' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AssignResidentSchema))
    dto: AssignResidentDto,
  ) {
    return this.flatsService.assignResident(id, dto);
  }

  @Patch(':id/vacate')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Mark flat as vacant' })
  @ApiParam({ name: 'id', example: 'cbf26697-85f1-428f-93d3-39a3b54459ca' })
  @ApiResponse({ status: 200, description: 'Flat vacated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  vacate(@Param('id') id: string) {
    return this.flatsService.vacate(id);
  }
}
