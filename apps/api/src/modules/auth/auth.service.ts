import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const betterAuthLoader = require('../../../better-auth-loader.cjs');

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private auth: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const { betterAuth, organization, twoFactor } = await betterAuthLoader.load();

    this.auth = betterAuth({
      database: { type: 'postgres', url: this.configService.getOrThrow('DATABASE_URL') },
      secret: this.configService.getOrThrow('BETTER_AUTH_SECRET'),
      baseURL: this.configService.getOrThrow('API_URL'),
      basePath: '/api/auth',
      emailAndPassword: { enabled: true, requireEmailVerification: false, minPasswordLength: 8 },
      socialProviders: {
        google: {
          clientId: this.configService.get('GOOGLE_CLIENT_ID') || '',
          clientSecret: this.configService.get('GOOGLE_CLIENT_SECRET') || '',
          enabled: !!this.configService.get('GOOGLE_CLIENT_ID'),
        },
      },
      session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
      plugins: [
        organization({ allowUserToCreateOrganization: true }),
        twoFactor({ issuer: 'WhatsApp Attribution OS' }),
      ],
      trustedOrigins: [this.configService.getOrThrow('APP_URL')],
    });

    this.logger.log('Better Auth initialized');
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }

    const init: RequestInit = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = JSON.stringify(req.body);
    }

    const webResponse = await this.auth.handler(new globalThis.Request(url, init));

    res.status(webResponse.status);
    webResponse.headers.forEach((v: string, k: string) => res.setHeader(k, v));
    const body = await webResponse.text();
    res.send(body);
  }

  getAuth() {
    return this.auth;
  }
}
