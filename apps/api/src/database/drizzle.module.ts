import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

@Global()
@Module({
  providers: [
    {
      provide: DRIZZLE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DrizzleModule');
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');
        const isProduction = configService.get('NODE_ENV') === 'production';
        const pool = new Pool({
          connectionString,
          max: isProduction ? 10 : 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
          ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
        });

        pool.on('error', (err) => {
          logger.error('Unexpected PG pool error', err.message);
        });

        logger.log('PostgreSQL connection pool created');
        return drizzle(pool, { schema, logger: false });
      },
    },
  ],
  exports: [DRIZZLE],
})
export class DrizzleModule {}

export type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;
