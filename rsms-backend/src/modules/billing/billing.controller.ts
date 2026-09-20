import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
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
import { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators';
import { BillStatus, PaymentMethod, Role } from '../../common/enums';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { User } from '../../database/entities';
import { BillingService } from './billing.service';
import {
  ConfigureBillingDto,
  ConfigureBillingSchema,
} from './dto/configure-billing.dto';
import {
  GenerateBillsDto,
  GenerateBillsSchema,
} from './dto/generate-bills.dto';
import {
  ProcessPaymentDto,
  ProcessPaymentSchema,
} from './dto/process-payment.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('config')
  @Roles(Role.ACCOUNTANT, Role.MANAGER)
  @ApiOperation({ summary: 'Get billing config' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  getConfig() {
    return this.billingService.getConfig();
  }

  @Post('config')
  @Roles(Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Create/update billing config' })
  @ApiBody({
    schema: {
      example: {
        flatType: '2BHK',
        baseAmount: 5000,
        extraVehicleCharge: 500,
        commercialSurcharge: 0,
        latePenaltyPercent: 2,
        billingDay: 1,
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Config saved' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  upsertConfig(
    @Body(new ZodValidationPipe(ConfigureBillingSchema))
    dto: ConfigureBillingDto,
    @CurrentUser() user: User,
  ) {
    return this.billingService.upsertConfig(dto, user);
  }

  @Post('generate')
  @Roles(Role.ACCOUNTANT, Role.MANAGER)
  @ApiOperation({ summary: 'Generate monthly bills for all residents' })
  @ApiBody({ schema: { example: { month: 9, year: 2026 } } })
  @ApiResponse({ status: 201, description: 'Bills generated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  generate(
    @Body(new ZodValidationPipe(GenerateBillsSchema)) dto: GenerateBillsDto,
  ) {
    return this.billingService.generateBills(dto);
  }

  @Post('bills/resident/:residentId')
  @Roles(Role.ACCOUNTANT, Role.MANAGER)
  @ApiOperation({ summary: 'Generate a bill for one resident using their flat billing config' })
  @ApiParam({ name: 'residentId', example: 'RES-01' })
  @ApiBody({ schema: { example: { month: 9, year: 2026 } } })
  @ApiResponse({ status: 201, description: 'Resident bill generated' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  generateForResident(
    @Param('residentId') residentId: string,
    @Body(new ZodValidationPipe(GenerateBillsSchema)) dto: GenerateBillsDto,
  ) {
    return this.billingService.generateBillForResident(residentId, dto);
  }

  @Get('bills')
  @Roles(Role.ACCOUNTANT)
  @ApiOperation({ summary: 'All bills (filterable)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BillStatus,
    example: BillStatus.PENDING,
  })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findAllBills(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: BillStatus,
  ) {
    return this.billingService.findAllBills({ page, limit, status });
  }

  @Get('bills/my')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'My bills' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findMyBills(@CurrentUser() user: User) {
    return this.billingService.findMyBills(user);
  }

  @Get('defaulters')
  @Roles(Role.ACCOUNTANT, Role.MANAGER)
  @ApiOperation({ summary: 'Defaulter list' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  defaulters() {
    return this.billingService.defaulters();
  }

  @Post('reminders')
  @Roles(Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Trigger payment reminder emails' })
  @ApiResponse({ status: 201, description: 'Reminders sent' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  sendReminders() {
    return this.billingService.sendReminders();
  }

  @Get('dashboard')
  @Roles(Role.ACCOUNTANT)
  @ApiOperation({ summary: 'Financial summary dashboard' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  dashboard() {
    return this.billingService.dashboard();
  }

  @Get('bills/:id')
  @Roles(Role.ACCOUNTANT, Role.RESIDENT)
  @ApiOperation({ summary: 'Bill detail' })
  @ApiParam({ name: 'id', example: 'cd6f464d-a890-4cde-86c8-0d8328729722' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  findBillById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.billingService.findBillById(id, user);
  }

  @Post('bills/:id/pay')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Simulate payment (dummy)' })
  @ApiParam({ name: 'id', example: 'cd6f464d-a890-4cde-86c8-0d8328729722' })
  @ApiBody({
    schema: {
      example: {
        method: PaymentMethod.BKASH,
        transactionRef: 'DEMO-TXN-0002',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payment processed' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  pay(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ProcessPaymentSchema))
    dto: ProcessPaymentDto,
    @CurrentUser() user: User,
  ) {
    return this.billingService.processPayment(id, dto, user);
  }

  @Get('bills/:id/receipt')
  @Roles(Role.RESIDENT)
  @ApiOperation({ summary: 'Download receipt PDF' })
  @ApiParam({ name: 'id', example: 'e4690af7-0af7-4918-af13-faf4f5b4a74d' })
  @ApiResponse({ status: 200, description: 'PDF receipt' })
  @ApiResponse({ status: 403, description: 'Forbidden - wrong role' })
  async receipt(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.billingService.generateReceipt(id, user);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${id}.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
