export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'RMB',
  'RUB',
  'BYN',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function isSupportedCurrency(
  value: string | null | undefined,
): value is SupportedCurrency {
  return (
    value != null &&
    (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
  );
}

/** Options for a Select: known list plus any unexpected current value. */
export function currencySelectOptions(
  current?: string | null,
): string[] {
  if (current && !isSupportedCurrency(current)) {
    return [current, ...SUPPORTED_CURRENCIES];
  }
  return [...SUPPORTED_CURRENCIES];
}
