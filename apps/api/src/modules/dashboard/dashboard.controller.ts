import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceId } from '@common/decorators';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview stats' })
  overview(@WorkspaceId() wsId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.service.getOverview(wsId, from, to);
  }

  @Get('funnel')
  @ApiOperation({ summary: 'Conversion funnel' })
  funnel(@WorkspaceId() wsId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.service.getFunnel(wsId, from, to);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Time series data for charts' })
  timeseries(
    @WorkspaceId() wsId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('granularity') granularity: 'hour' | 'day' | 'week' = 'day',
  ) {
    return this.service.getTimeseries(wsId, from, to, granularity);
  }
}
