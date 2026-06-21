import { Controller, Get, Post, Query, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId, Roles } from '@common/decorators';
import { AttributionService } from './attribution.service';

@ApiTags('Attribution')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/attribution')
export class AttributionController {
  constructor(private readonly service: AttributionService) {}

  @Get()
  @ApiOperation({ summary: 'List attribution records' })
  findAll(
    @WorkspaceId() wsId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('platform') platform?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.service.findAll(wsId, { from, to, platform, page, limit });
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Campaign-level attribution' })
  campaigns(@WorkspaceId() wsId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.service.getCampaignStats(wsId, from, to);
  }

  @Get('keywords')
  @ApiOperation({ summary: 'Keyword-level attribution' })
  keywords(@WorkspaceId() wsId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.service.getKeywordStats(wsId, from, to);
  }

  @Post('upload')
  @Roles('editor')
  @ApiOperation({ summary: 'Trigger offline conversion upload' })
  triggerUpload(@WorkspaceId() wsId: string, @Body() body: { platform: string }) {
    return this.service.triggerOfflineUpload(wsId, body.platform);
  }
}
