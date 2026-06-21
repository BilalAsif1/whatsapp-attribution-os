import { Controller, Get, Put, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId, Roles, CurrentUser } from '@common/decorators';
import { ConversationService } from './conversation.service';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/conversations')
export class ConversationController {
  constructor(private readonly service: ConversationService) {}

  @Get()
  @ApiOperation({ summary: 'List conversations' })
  findAll(
    @WorkspaceId() wsId: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.service.findAll(wsId, { status, from, to, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation with attribution details' })
  findOne(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(wsId, id);
  }

  @Put(':id')
  @Roles('editor')
  @ApiOperation({ summary: 'Update conversation status/revenue/tags' })
  update(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string, @Body() body: {
    status?: string; revenue?: number; currency?: string; tags?: string[];
  }) {
    return this.service.update(wsId, id, body);
  }

  @Post(':id/events')
  @Roles('editor')
  @ApiOperation({ summary: 'Create conversion event' })
  createEvent(
    @WorkspaceId() wsId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { eventType: string; eventValue?: number; currency?: string; metadata?: Record<string, unknown> },
  ) {
    return this.service.createEvent(wsId, id, userId, body);
  }
}
