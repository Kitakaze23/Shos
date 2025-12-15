import Decimal from "decimal.js"

export function formatCurrency(
  amount: string | number | Decimal,
  currency: string = "RUB",
  showSymbol: boolean = true
): string {
  const value = typeof amount === "string" || typeof amount === "number"
    ? new Decimal(amount)
    : amount

  const currencySymbols: Record<string, string> = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }

  const symbol = currencySymbols[currency] || currency
  const formatted = value.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return showSymbol ? `${symbol}${formatted}` : formatted
}

export function formatNumber(
  value: string | number | Decimal,
  decimals: number = 2
): string {
  const num = typeof value === "string" || typeof value === "number"
    ? new Decimal(value)
    : value

  return num.toNumber().toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercentage(value: string | number | Decimal): string {
  const num = typeof value === "string" || typeof value === "number"
    ? new Decimal(value)
    : value

  return `${num.toFixed(1)}%`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatCompactNumber(value: string | number | Decimal): string {
  const num = typeof value === "string" || typeof value === "number"
    ? new Decimal(value)
    : value

  const n = num.toNumber()
  
  if (n >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(1)}B`
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`
  }
  return n.toFixed(0)
}
