/**
 * Format a number into FCFA currency string
 * e.g., 45000 -> "45 000 FCFA"
 */
export function formatFCFA(
  amount: number | null | undefined,
  options?: {
    showSign?: boolean;
    compact?: boolean;
    hideCurrency?: boolean;
    useComma?: boolean;
  }
): string {
  const value = amount ?? 0;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  let formattedNumber = '';

  if (options?.compact && absValue >= 1_000_000) {
    formattedNumber = (absValue / 1_000_000).toFixed(1).replace('.0', '') + ' M';
  } else if (options?.compact && absValue >= 100_000) {
    formattedNumber = (absValue / 1_000).toFixed(0) + ' k';
  } else {
    // Space grouping: 180 000 (matches "1 248 500 FCFA" spec)
    const separator = options?.useComma ? ',' : ' ';
    formattedNumber = Math.round(absValue)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  const sign = options?.showSign
    ? value > 0
      ? '+ '
      : isNegative
      ? '- '
      : ''
    : isNegative
    ? '- '
    : '';

  if (options?.hideCurrency) {
    return `${sign}${formattedNumber}`;
  }

  return `${sign}${formattedNumber} FCFA`;
}

/**
 * Format date string (YYYY-MM-DD) to friendly date
 */
export function formatDate(
  dateStr: string,
  style: 'short' | 'medium' | 'long' | 'relative' = 'relative'
): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const today = new Date();
  const isToday =
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate();

  if (style === 'relative') {
    if (isToday) return "Aujourd'hui";
    if (isYesterday) return 'Hier';
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  }

  if (style === 'short') {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  if (style === 'long') {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get current month key in 'YYYY-MM' format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Format 'YYYY-MM' into readable French month title e.g. "Août 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const label = date.toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });
  // Capitalize first letter (e.g., "Août 2026")
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Shift monthKey by offset (+1 for next month, -1 for previous)
 */
export function getAdjacentMonth(monthKey: string, offset: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  return `${nextYear}-${nextMonth}`;
}

/**
 * Get all available months between two dates or for transaction list
 */
export function getRecentMonthsList(count = 12): string[] {
  const list: string[] = [];
  const current = getCurrentMonthKey();
  for (let i = -count + 1; i <= 3; i++) {
    list.push(getAdjacentMonth(current, i));
  }
  return list;
}

/**
 * Today's date in YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
