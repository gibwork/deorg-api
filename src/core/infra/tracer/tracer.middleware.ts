import { Injectable, NestMiddleware } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RequestContext } from '@core/infra/tracer/request.context';

@Injectable()
export class TracerMiddleware implements NestMiddleware {
  // eslint-disable-next-line @typescript-eslint/ban-types
  use(req: any, res: Response, next: Function) {
    const tracerId = uuidv4();

    RequestContext.run(() => {
      RequestContext.setTracerId(tracerId);
      req.tracerId = tracerId;
      next();
    });
  }
}
