import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import {
  ChangePasswordDto,
  ChangePasswordSchema,
} from './dto/change-password.dto';
import { avatarUploadOptions } from './avatar-upload.config';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'List all users with pagination/filter' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: Role,
    example: Role.RESIDENT,
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: Role,
  ) {
    return this.usersService.findAll({ page, limit, role });
  }

  @Post()
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Create user (any role)' })
  @ApiBody({
    schema: {
      example: {
        fullName: 'Nasrin Sultana',
        email: 'guard3@rsms.com',
        role: Role.GUARD,
        phone: '+8801710000009',
        password: 'Passw0rd!123',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  create(@Body(new ZodValidationPipe(CreateUserSchema)) dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Change own password' })
  @ApiBody({
    schema: {
      example: {
        currentPassword: 'Passw0rd!123',
        newPassword: 'NewPassw0rd!456',
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  changeOwnPassword(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(ChangePasswordSchema))
    dto: ChangePasswordDto,
  ) {
    return this.usersService.changeOwnPassword(user.id, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', avatarUploadOptions))
  @ApiOperation({ summary: 'Upload/replace own profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiResponse({ status: 200, description: 'Profile picture updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  uploadOwnAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.usersService.updateAvatar(user.id, file.filename);
  }

  @Delete('me/avatar')
  @ApiOperation({ summary: 'Remove own profile picture' })
  @ApiResponse({ status: 200, description: 'Profile picture removed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeOwnAvatar(@CurrentUser() user: User) {
    return this.usersService.removeAvatar(user.id);
  }

  @Get(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Get user detail' })
  @ApiParam({ name: 'id', example: 'RES-01' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', example: 'RES-01' })
  @ApiBody({
    schema: {
      example: { fullName: 'Nasrin Sultana Rimi', phone: '+8801710000010' },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiParam({ name: 'id', example: 'RES-01' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles(Role.MANAGER)
  @ApiOperation({ summary: 'Re-activate user account' })
  @ApiParam({ name: 'id', example: 'RES-01' })
  @ApiResponse({ status: 200, description: 'User activated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}
