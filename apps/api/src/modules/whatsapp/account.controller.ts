import { Controller, Get, Post, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId, Roles } from '@common/decorators';
import { AccountService } from './account.service';

@ApiTags('WhatsApp Accounts')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/whatsapp-accounts')
export class AccountController {
  constructor(private readonly service: AccountService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Connect WhatsApp Business number' })
  create(@WorkspaceId() wsId: string, @Body() body: {
    phoneNumberId: string;
    phoneNumber: string;
    wabaId: string;
    accessToken: string;
  }) {
    return this.service.create(wsId, body);
  }

  @Get()
  @ApiOperation({ summary: 'List connected WhatsApp numbers' })
  findAll(@WorkspaceId() wsId: string) {
    return this.service.findAll(wsId);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Disconnect WhatsApp number' })
  remove(@WorkspaceId() wsId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(wsId, id);
  }
}
