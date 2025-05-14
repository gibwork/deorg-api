import { ModuleMetadata } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

export const socketProvider: ModuleMetadata = {
  providers: [SocketGateway]
};
