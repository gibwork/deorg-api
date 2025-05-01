import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export class SwaggerResponseType {
  [action: string]: { [status: number]: ApiResponseOptions };
}
