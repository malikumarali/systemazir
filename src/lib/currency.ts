// ============================================================
// Agency OS — Currency Utilities
// ============================================================

export const DEFAULT_EXCHANGE_RATE = 280 // 1 USD = 280 PKR

/**
 * Convert USD to PKR
 */
export function usdToPkr(usd: number, rate: number = DEFAULT_EXCHANGE_RATE): number {
  return Math.round(usd * rate) // PKR rounded to nearest whole rupee
}

/**
 * Format USD value
 */
export function formatUsd(value: number): string {
  if (value >= 1_000_000) {
    return `$ ${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$ ${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }
  return `$ ${value.toFixed(2)}`
}

/**
 * Format PKR value
 */
export function formatPkr(value: number): string {
  if (value >= 10_000_000) {
    return `PKR ${(value / 10_000_000).toFixed(2)} Cr`
  }
  if (value >= 100_000) {
    return `PKR ${(value / 100_000).toFixed(2)} L`
  }
  return `PKR ${value.toLocaleString('en-PK')}`
}

/**
 * Format dual currency display (USD + PKR)
 */
export function formatDual(
  usdValue: number,
  rate: number = DEFAULT_EXCHANGE_RATE
): string {
  const pkr = usdToPkr(usdValue, rate)
  return `${formatUsd(usdValue)} / ${formatPkr(pkr)}`
}

/**
 * Format value based on display preference
 */
export function formatCurrency(
  usdValue: number,
  display: 'USD' | 'PKR' | 'Both',
  rate: number = DEFAULT_EXCHANGE_RATE
): string {
  switch (display) {
    case 'USD':
      return formatUsd(usdValue)
    case 'PKR':
      return formatPkr(usdToPkr(usdValue, rate))
    case 'Both':
      return formatDual(usdValue, rate)
  }
}

/**
 * Get sign color class for P/L display
 */
export function getPLColorClass(value: number): string {
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-gray-400'
}

/**
 * Get P/L prefix (+ or -)
 */
export function getPLPrefix(value: number): string {
  return value > 0 ? '+' : ''
}
