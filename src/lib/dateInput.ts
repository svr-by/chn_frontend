export function isoToDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateInputValue(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Local calendar date → ISO at start of that local day. */
export function dateInputToIsoStartOfDay(dateInput: string): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  return start.toISOString();
}

/** Local calendar date → ISO at end of that local day. */
export function dateInputToIsoEndOfDay(dateInput: string): string {
  const [year, month, day] = dateInput.split('-').map(Number);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return end.toISOString();
}
