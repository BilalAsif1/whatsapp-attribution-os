import { Controller, Post, Req, Headers, RawBodyRequest, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@common/decorators';
import { BillingService } from './billing.service';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly billingService: BillingService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    await this.billingService.handleWebhookEvent(req.rawBody!, signature);
    return { received: true };
  }
}
