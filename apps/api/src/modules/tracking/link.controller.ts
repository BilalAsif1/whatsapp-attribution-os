import {
  Controller, Get, Post, Put, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId, Roles } from '@common/decorators';
import { LinkService } from './link.service';
import { CreateTrackingLinkDto, UpdateTrackingLinkDto } from './dto';

@ApiTags('Tracking Links')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/tracking-links')
export class LinkController {
  constructor(private readonly service: LinkService) {}

  @Post()
  @Roles('editor')
  @ApiOperation({ summary: 'Create tracking link' })
  create(@WorkspaceId() wsId: string, @Body() dto: CreateTrackingLinkDto) {
    return this.service.create(wsId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tracking links' })
  findAll(@WorkspaceId() wsId: string) {
    return this.service.findAll(wsId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tracking link' })
  findOne(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(wsId, id);
  }

  @Put(':id')
  @Roles('editor')
  @ApiOperation({ summary: 'Update tracking link' })
  update(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTrackingLinkDto) {
    return this.service.update(wsId, id, dto);
  }

  @Delete(':id')
  @Roles('editor')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tracking link' })
  remove(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(wsId, id);
  }
}
