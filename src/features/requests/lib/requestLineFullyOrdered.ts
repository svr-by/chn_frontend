import { isDecimalGte, isValidDecimal } from '@/lib/decimal';

/** Line is fully ordered when selected qty covers (or exceeds) requested qty. */
export function isRequestLineFullyOrdered(line: {
  quantity: string;
  selectedQuantity?: string | null;
}): boolean {
  const selected = line.selectedQuantity?.trim();
  if (selected == null || selected === '' || !isValidDecimal(selected)) {
    return false;
  }
  if (!isValidDecimal(line.quantity)) {
    return false;
  }
  return isDecimalGte(selected, line.quantity);
}
