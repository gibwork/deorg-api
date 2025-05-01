import { SwaggerResponseType } from '@core/swagger/types';

export const SwaggerResponse: SwaggerResponseType = {
  default: {
    400: {
      status: 400,
      description: 'Bad request.',
      schema: {
        example: {
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        },
      },
    },
    401: {
      status: 401,
      description: 'Unauthorized.',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          error: 'Unauthorized',
        },
      },
    },
    500: {
      status: 500,
      description: 'Internal Server Error.',
      schema: {
        example: {
          statusCode: 500,
          message: 'Internal Server Error',
          error: 'Internal Server Error',
        },
      },
    },
  },
};
