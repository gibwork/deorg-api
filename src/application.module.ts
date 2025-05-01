import { Module } from '@nestjs/common';
import { CoreModule } from '@core/core.module';
import { DomainModule } from '@domains/domain.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    CoreModule,
    DomainModule,
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot()
  ]
})
export class ApplicationModule {}
