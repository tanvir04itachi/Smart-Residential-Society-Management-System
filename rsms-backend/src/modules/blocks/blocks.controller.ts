import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { BlocksService } from './blocks.service';
import { CreateBlockDto, CreateBlockSchema } from './dto/create-block.dto';

@ApiTags('blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('blocks')
export class BlocksController {
  constructor(private blocksService: BlocksService) {}

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'List all blocks' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAll() {
    return this.blocksService.findAll();
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create block' })
  @ApiBody({
    schema: { example: { name: 'D', description: 'Block D - new wing' } },
  })
  @ApiResponse({ status: 201, description: 'Block created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(@Body(new ZodValidationPipe(CreateBlockSchema)) dto: CreateBlockDto) {
    return this.blocksService.create(dto);
  }
}
