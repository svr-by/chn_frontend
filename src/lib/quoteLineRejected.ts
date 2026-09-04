/** Soft-rejected quote lines use `rejectedAt` (ISO datetime); there is no `isRejected` flag. */
export function isQuoteLineRejected(
  rejectedAt: string | null | undefined,
): boolean {
  return rejectedAt != null;
}
