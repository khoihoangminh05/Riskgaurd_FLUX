import { ValueTransformer } from 'typeorm';
import Decimal from 'decimal.js';

export class ColumnNumericTransformer implements ValueTransformer {
  to(data: number | Decimal | null): string | null {
    if (data === null || data === undefined) {
      return null;
    }
    return data.toString();
  }

  from(data: string | null): Decimal | null {
    if (data === null || data === undefined) {
      return null;
    }
    return new Decimal(data);
  }
}
