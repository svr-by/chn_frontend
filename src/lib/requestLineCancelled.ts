/** Soft-cancelled request lines use `cancelledAt` (ISO datetime); there is no `isCancelled` flag. */
export function isRequestLineCancelled(
  cancelledAt: string | null | undefined,
): boolean {
  return cancelledAt != null;
}
