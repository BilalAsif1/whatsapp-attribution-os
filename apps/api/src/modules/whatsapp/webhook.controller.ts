import { Controller, Get, Post, Body, Query, Req, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@common/decorators';
import { ConfigService } from '@nestjs/config';
import { WebhookService } from './webhook.service';

@ApiTags('WhatsApp Webhooks')
@Controller('v1/webhooks/whatsapp')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly service: WebhookService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'WhatsApp webhook verification (GET)' })
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const verifyToken = this.configService.getOrThrow('whatsapp.verifyToken');
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('WhatsApp webhook verified');
      return challenge;
    }
    this.logger.warn('WhatsApp webhook verification failed');
    return 'Verification failed';
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async handleWebhook(@Body() body: unknown, @Req() req: Request) {
    // Always return 200 immediately — process async
    // WhatsApp will retry if we don't respond in 5s
    this.service.processWebhook(body, req.headers['x-hub-signature-256'] as string)
      .catch((err) => this.logger.error('Webhook processing error', err));
    return 'EVENT_RECEIVED';
  }
}
