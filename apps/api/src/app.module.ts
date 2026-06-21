import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { DrizzleModule } from '@database/drizzle.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from '@modules/auth/auth.module';
import { WorkspaceModule } from '@modules/workspace/workspace.module';
import { TrackingModule } from '@modules/tracking/tracking.module';
import { WhatsappModule } from '@modules/whatsapp/whatsapp.module';
import { AttributionModule } from '@modules/attribution/attribution.module';
import { ConversationModule } from '@modules/conversation/conversation.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { IntegrationModule } from '@modules/integration/integration.module';
import { BillingModule } from '@modules/billing/billing.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { HealthModule } from '@modules/health/health.module';
import { appConfig, stripeConfig, whatsappConfig } from '@config/index';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, stripeConfig, whatsappConfig],
      envFilePath: ['.env.local', '.env'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        redact: ['req.headers.authorization', 'req.headers["x-api-key"]'],
      },
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 200 },
    ]),
    DrizzleModule,
    RedisModule,
    AuthModule,
    WorkspaceModule,
    TrackingModule,
    WhatsappModule,
    AttributionModule,
    ConversationModule,
    DashboardModule,
    IntegrationModule,
    BillingModule,
    NotificationModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
