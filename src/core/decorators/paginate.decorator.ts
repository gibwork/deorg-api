import { AbstractValidationPipe } from '@core/infra/validators/abstract-validation-pipe';
import { PaginatedDto } from '@core/pagination/paginated.dto';

export function createPipe(dto) {
  return new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: dto },
  );
}

export function pageablePipe(paginate: typeof PaginatedDto) {
  return new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { query: paginate },
  );
}
