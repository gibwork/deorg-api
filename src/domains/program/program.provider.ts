import { ModuleMetadata } from '@nestjs/common';
import { ProgramListener } from './program.listener';
import { ProgramHandleEventsUsecase } from './program-handle-events.usecase';

export const ProgramProvider: ModuleMetadata = {
  providers: [ProgramListener, ProgramHandleEventsUsecase]
};
