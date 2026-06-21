import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [WebhookController, AccountController],
  providers: [WebhookService, AccountService],
  exports: [WebhookService, AccountService],
})
export class WhatsappModule {}
