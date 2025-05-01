import { BadRequestException } from '@nestjs/common';
import { ErrorCodes } from '@core/errors/errorCodes';

export class InsufficientFundsError extends BadRequestException {
  constructor() {
    super({
      message: 'insufficient funds',
      errorCode: ErrorCodes.InsufficientFunds
    });
  }
}
