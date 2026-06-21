import { Controller, Get, Post, Body, Param, Query, Res, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Public } from '@common/decorators';
import { CollectorService } from './collector.service';

@ApiTags('Click Tracking')
@Controller()
export class CollectorController {
  private readonly logger = new Logger(CollectorController.name);

  constructor(private readonly service: CollectorService) {}

  @Public()
  @Get('t/:shortCode')
  @ApiOperation({ summary: 'Track click and redirect to WhatsApp (public, fast path)' })
  async trackRedirect(
    @Param('shortCode') shortCode: string,
    @Query() query: Record<string, string>,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.service.processClick({
      shortCode,
      clickIds: {
        gclid: query.gclid, fbclid: query.fbclid,
        ttclid: query.ttclid, msclkid: query.msclkid, li_fat_id: query.li_fat_id,
      },
      utm: {
        source: query.utm_source, medium: query.utm_medium,
        campaign: query.utm_campaign, content: query.utm_content, term: query.utm_term,
      },
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.socket.remoteAddress || '',
      referer: req.headers['referer'] || '',
    });

    res.redirect(302, redirectUrl);
  }

  @Public()
  @Post('v1/track/click')
  @ApiOperation({ summary: 'Record a click from the tracking script (AJAX)' })
  async trackClick(@Body() body: {
    workspaceId: string;
    uid: string;
    gclid?: string;
    fbclid?: string;
    ttclid?: string;
    msclkid?: string;
    li_fat_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    landingPage?: string;
    referer?: string;
  }, @Req() req: Request) {
    return this.service.recordClickFromScript({
      ...body,
      userAgent: req.headers['user-agent'] || '',
      ip: req.ip || req.socket.remoteAddress || '',
    });
  }
}
