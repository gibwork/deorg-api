import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch(BadRequestException)
export class HttpBadRequestExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const method = request.method;
    const requestUrl = request.url;
    const requestBody = this.hideBodyPassword(request.body);
    const responseData: any = exception?.getResponse();
    const errors = exception.errors;

    Logger.log(
      `Bad request exception. Request: ${method} ${requestUrl} body: ${JSON.stringify(
        requestBody,
        null,
        2,
      )}. Response data: ${JSON.stringify(
        responseData,
        null,
        2,
      )} Errors: ${JSON.stringify(errors, null, 2)}`,
      'BadRequestException',
    );

    return super.catch(exception, host);
  }

  private hideBodyPassword(body: any) {
    if (body.password) body.password = '***';
    return body;
  }
}
