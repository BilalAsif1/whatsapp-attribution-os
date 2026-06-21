const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { ValidationPipe, VersioningType } = require('@nestjs/common');
require('reflect-metadata');

let app;

async function createApp() {
  if (app) return app;

  const { AppModule } = require('./dist/app.module');

  const server = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  nestApp.enableCors({
    origin: process.env.APP_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id', 'X-API-Key'],
  });

  nestApp.enableVersioning({ type: VersioningType.URI, defaultVersion: '1', prefix: 'v' });
  nestApp.setGlobalPrefix('api');

  nestApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await nestApp.init();
  app = server;
  return app;
}

module.exports = async (req, res) => {
  const server = await createApp();
  server(req, res);
};
