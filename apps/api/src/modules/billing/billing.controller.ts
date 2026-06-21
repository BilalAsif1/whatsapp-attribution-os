import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId, Roles, CurrentUser } from '@common/decorators';
import { BillingService } from './billing.service';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/billing')
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get subscription details' })
  getSubscription(@WorkspaceId() wsId: string) {
    return this.service.getSubscription(wsId);
  }

  @Post('checkout')
  @Roles('owner')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  checkout(@WorkspaceId() wsId: string, @Body() body: { planId: string }) {
    return this.service.createCheckout(wsId, body.planId);
  }

  @Post('portal')
  @Roles('owner')
  @ApiOperation({ summary: 'Create Stripe billing portal session' })
  portal(@WorkspaceId() wsId: string) {
    return this.service.createPortal(wsId);
  }
}
