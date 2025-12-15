import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatShortDate,
  formatCompactNumber,
} from '@/utils/formatting'
import Decimal from 'decimal.js'

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('should format RUB currency', () => {
      const result = formatCurrency(1234567.89, 'RUB')
      expect(result).toContain('₽')
      expect(result).toContain('1,234,567.89')
    })

    it('should format USD currency', () => {
      const result = formatCurrency(1234.56, 'USD')
      expect(result).toContain('$')
      expect(result).toContain('1,234.56')
    })

    it('should format Decimal objects', () => {
      const result = formatCurrency(new Decimal(1234.56), 'EUR')
      expect(result).toContain('€')
    })

    it('should hide symbol when requested', () => {
      const result = formatCurrency(1234.56, 'USD', false)
      expect(result).not.toContain('$')
      expect(result).toContain('1,234.56')
    })
  })

  describe('formatNumber', () => {
    it('should format with default 2 decimals', () => {
      const result = formatNumber(1234.567)
      expect(result).toBe('1,234.57')
    })

    it('should format with custom decimals', () => {
      const result = formatNumber(1234.567, 0)
      expect(result).toBe('1,235')
    })

    it('should format Decimal objects', () => {
      const result = formatNumber(new Decimal(1234.567))
      expect(result).toBe('1,234.57')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage correctly', () => {
      const result = formatPercentage(75.5)
      expect(result).toBe('75.5%')
    })

    it('should format Decimal objects', () => {
      const result = formatPercentage(new Decimal(50.25))
      expect(result).toBe('50.3%')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15')
      const result = formatDate(date)
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('should format date strings', () => {
      const result = formatDate('2025-01-15')
      expect(result).toContain('January')
    })
  })

  describe('formatShortDate', () => {
    it('should format short date correctly', () => {
      const date = new Date('2025-01-15')
      const result = formatShortDate(date)
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('formatCompactNumber', () => {
    it('should format millions', () => {
      const result = formatCompactNumber(1500000)
      expect(result).toBe('1.5M')
    })

    it('should format thousands', () => {
      const result = formatCompactNumber(1500)
      expect(result).toBe('1.5K')
    })

    it('should format billions', () => {
      const result = formatCompactNumber(1500000000)
      expect(result).toBe('1.5B')
    })

    it('should format small numbers', () => {
      const result = formatCompactNumber(123)
      expect(result).toBe('123')
    })
  })
})
