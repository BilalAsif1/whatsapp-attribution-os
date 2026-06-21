import { Controller, Get, Post, Delete, Param, Query, Body, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { WorkspaceId, Roles, Public } from '@common/decorators';
import { GoogleAdsService } from './google-ads.service';

@ApiTags('Google Ads Integration')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/integrations/google-ads')
export class GoogleAdsController {
  constructor(private readonly service: GoogleAdsService) {}

  @Get('auth-url')
  @Roles('admin')
  @ApiOperation({ summary: 'Get Google Ads OAuth URL' })
  getAuthUrl(@WorkspaceId() wsId: string) {
    return this.service.getAuthUrl(wsId);
  }

  @Get('callback')
  @Public()
  @ApiOperation({ summary: 'Google Ads OAuth callback' })
  async callback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    await this.service.handleCallback(code, state);
    res.redirect(`${process.env.APP_URL}/settings/integrations?connected=google_ads`);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List connected Google Ads accounts' })
  getAccounts(@WorkspaceId() wsId: string) {
    return this.service.getAccounts(wsId);
  }

  @Delete(':connectionId')
  @Roles('admin')
  @ApiOperation({ summary: 'Disconnect Google Ads account' })
  disconnect(@WorkspaceId() wsId: string, @Param('connectionId', ParseUUIDPipe) id: string) {
    return this.service.disconnect(wsId, id);
  }
}
