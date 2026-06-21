import { Module } from '@nestjs/common';
import { CollectorController } from './collector.controller';
import { CollectorService } from './collector.service';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { ScriptController } from './script.controller';

@Module({
  controllers: [CollectorController, LinkController, ScriptController],
  providers: [CollectorService, LinkService],
  exports: [CollectorService, LinkService],
})
export class TrackingModule {}
