#!/bin/bash
set -e

# Build shared and api
pnpm --filter @wao/shared build
pnpm --filter @wao/api build

# Create Vercel Build Output v3
mkdir -p .vercel/output/functions/api.func

# Copy the serverless handler
cp api/index.js .vercel/output/functions/api.func/index.js

# Copy compiled API dist
cp -r apps/api/dist .vercel/output/functions/api.func/dist

# Copy .cjs loader that preserves native import() for ESM-only packages
cp apps/api/better-auth-loader.cjs .vercel/output/functions/api.func/better-auth-loader.cjs

# Install production dependencies directly in the function directory
cd .vercel/output/functions/api.func
cat > package.json << 'PKGJSON'
{
  "name": "wao-api-function",
  "private": true,
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/config": "^4.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/platform-express": "^11.0.0",
    "@nestjs/swagger": "^8.1.0",
    "@nestjs/throttler": "^6.4.0",
    "@nestjs/bullmq": "^11.0.0",
    "better-auth": "^1.2.0",
    "bullmq": "^5.34.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "compression": "^1.7.5",
    "drizzle-orm": "^0.38.0",
    "express": "^5.0.0",
    "helmet": "^8.0.0",
    "ioredis": "^5.4.2",
    "nestjs-pino": "^4.2.0",
    "pg": "^8.13.1",
    "pino-http": "^10.4.0",
    "reflect-metadata": "^0.2.2",
    "resend": "^4.1.0",
    "rxjs": "^7.8.1",
    "stripe": "^17.5.0",
    "uuid": "^11.0.5",
    "zod": "^3.24.1"
  }
}
PKGJSON

npm install --production --legacy-peer-deps 2>&1 | tail -5
cd ../../../..

# Copy compiled shared as a node_modules package (AFTER npm install so it doesn't get wiped)
mkdir -p .vercel/output/functions/api.func/node_modules/@wao/shared
cp -r packages/shared/dist .vercel/output/functions/api.func/node_modules/@wao/shared/dist
cp packages/shared/package.json .vercel/output/functions/api.func/node_modules/@wao/shared/package.json

# Create .vc-config.json for the function
cat > .vercel/output/functions/api.func/.vc-config.json << 'VCCONFIG'
{
  "runtime": "nodejs22.x",
  "handler": "index.js",
  "maxDuration": 10,
  "memory": 512,
  "launcherType": "Nodejs"
}
VCCONFIG

# Create config.json for routing
cat > .vercel/output/config.json << 'CONFIG'
{
  "version": 3,
  "routes": [
    { "src": "/(.*)", "dest": "/api" }
  ]
}
CONFIG

# Create static output dir (empty, we're API only)
mkdir -p .vercel/output/static

echo "Build complete! Function size:"
du -sh .vercel/output/functions/api.func/
