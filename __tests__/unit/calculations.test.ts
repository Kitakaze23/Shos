import {
  calculateAnnualDepreciation,
  calculateMonthlyDepreciation,
  calculateAutoSalvageValue,
  calculateMonthlyVariableCosts,
  calculateTotalMonthlyCost,
  calculateCostPerHour,
  allocateCostByHours,
  allocateCostByShare,
  allocateCostEqually,
  calculateBreakEvenHours,
  calculateMonthlyReserve,
  calculateTotalFixedCosts,
  calculateAnnualCost,
  formatCurrency,
} from '@/lib/calculations'
import Decimal from 'decimal.js'

describe('Financial Calculations', () => {
  describe('calculateAnnualDepreciation', () => {
    it('should calculate annual depreciation correctly', () => {
      const result = calculateAnnualDepreciation(
        new Decimal(1000000),
        new Decimal(100000),
        10
      )
      expect(result.toNumber()).toBe(90000)
    })

    it('should handle zero purchase price', () => {
      const result = calculateAnnualDepreciation(
        new Decimal(0),
        new Decimal(0),
        10
      )
      expect(result.toNumber()).toBe(0)
    })

    it('should handle zero salvage value', () => {
      const result = calculateAnnualDepreciation(
        new Decimal(1000000),
        new Decimal(0),
        10
      )
      expect(result.toNumber()).toBe(100000)
    })

    it('should handle single year service life', () => {
      const result = calculateAnnualDepreciation(
        new Decimal(100000),
        new Decimal(10000),
        1
      )
      expect(result.toNumber()).toBe(90000)
    })
  })

  describe('calculateMonthlyDepreciation', () => {
    it('should calculate monthly depreciation correctly', () => {
      const annual = new Decimal(120000)
      const result = calculateMonthlyDepreciation(annual)
      expect(result.toNumber()).toBe(10000)
    })

    it('should handle zero annual depreciation', () => {
      const result = calculateMonthlyDepreciation(new Decimal(0))
      expect(result.toNumber()).toBe(0)
    })
  })

  describe('calculateAutoSalvageValue', () => {
    it('should calculate 10% salvage value', () => {
      const result = calculateAutoSalvageValue(new Decimal(1000000))
      expect(result.toNumber()).toBe(100000)
    })

    it('should handle zero purchase price', () => {
      const result = calculateAutoSalvageValue(new Decimal(0))
      expect(result.toNumber()).toBe(0)
    })
  })

  describe('calculateMonthlyVariableCosts', () => {
    it('should calculate variable costs correctly', () => {
      const hourlyRate = new Decimal(5000)
      const operatingHours = new Decimal(200)
      const result = calculateMonthlyVariableCosts(hourlyRate, operatingHours)
      expect(result.toNumber()).toBe(1000000)
    })

    it('should handle zero hours', () => {
      const result = calculateMonthlyVariableCosts(
        new Decimal(5000),
        new Decimal(0)
      )
      expect(result.toNumber()).toBe(0)
    })
  })

  describe('calculateTotalMonthlyCost', () => {
    it('should sum all costs correctly', () => {
      const fixedCosts = new Decimal(500000)
      const variableCosts = new Decimal(1000000)
      const depreciation = new Decimal(100000)
      const result = calculateTotalMonthlyCost(
        fixedCosts,
        variableCosts,
        depreciation
      )
      expect(result.toNumber()).toBe(1600000)
    })

    it('should handle zero costs', () => {
      const result = calculateTotalMonthlyCost(
        new Decimal(0),
        new Decimal(0),
        new Decimal(0)
      )
      expect(result.toNumber()).toBe(0)
    })
  })

  describe('calculateCostPerHour', () => {
    it('should calculate cost per hour correctly', () => {
      const totalCost = new Decimal(1600000)
      const operatingHours = new Decimal(200)
      const result = calculateCostPerHour(totalCost, operatingHours)
      expect(result.toNumber()).toBe(8000)
    })

    it('should handle zero hours', () => {
      const result = calculateCostPerHour(new Decimal(1000000), new Decimal(0))
      expect(result.isNaN() || result.isInfinity()).toBe(true)
    })
  })

  describe('allocateCostByHours', () => {
    it('should allocate cost proportionally by hours', () => {
      const totalCost = new Decimal(1000000)
      const memberHours = new Decimal(100)
      const allHours = new Decimal(200)
      const result = allocateCostByHours(totalCost, memberHours, allHours)
      expect(result.toNumber()).toBe(500000)
    })

    it('should handle equal hours', () => {
      const result = allocateCostByHours(
        new Decimal(1000000),
        new Decimal(100),
        new Decimal(100)
      )
      expect(result.toNumber()).toBe(1000000)
    })
  })

  describe('allocateCostByShare', () => {
    it('should allocate cost by ownership share', () => {
      const totalCost = new Decimal(1000000)
      const share = new Decimal(60) // 60%
      const result = allocateCostByShare(totalCost, share)
      expect(result.toNumber()).toBe(600000)
    })

    it('should handle 100% share', () => {
      const result = allocateCostByShare(new Decimal(1000000), new Decimal(100))
      expect(result.toNumber()).toBe(1000000)
    })
  })

  describe('allocateCostEqually', () => {
    it('should split cost equally among members', () => {
      const totalCost = new Decimal(1000000)
      const memberCount = 4
      const result = allocateCostEqually(totalCost, memberCount)
      expect(result.toNumber()).toBe(250000)
    })

    it('should handle single member', () => {
      const result = allocateCostEqually(new Decimal(1000000), 1)
      expect(result.toNumber()).toBe(1000000)
    })
  })

  describe('calculateBreakEvenHours', () => {
    it('should calculate break-even hours correctly', () => {
      const fixedCosts = new Decimal(500000)
      const depreciation = new Decimal(100000)
      const variableCostPerHour = new Decimal(5000)
      const result = calculateBreakEvenHours(
        fixedCosts,
        depreciation,
        variableCostPerHour
      )
      expect(result.toNumber()).toBe(120)
    })

    it('should handle zero variable cost', () => {
      const result = calculateBreakEvenHours(
        new Decimal(500000),
        new Decimal(100000),
        new Decimal(0)
      )
      expect(result.isNaN() || result.isInfinity()).toBe(true)
    })
  })

  describe('calculateMonthlyReserve', () => {
    it('should calculate 15% reserve by default', () => {
      const monthlyCost = new Decimal(1000000)
      const result = calculateMonthlyReserve(monthlyCost)
      expect(result.toNumber()).toBe(150000)
    })

    it('should calculate custom percentage reserve', () => {
      const monthlyCost = new Decimal(1000000)
      const result = calculateMonthlyReserve(monthlyCost, 0.2) // 20%
      expect(result.toNumber()).toBe(200000)
    })
  })

  describe('calculateTotalFixedCosts', () => {
    it('should sum all fixed costs', () => {
      const insurance = new Decimal(100000)
      const staff = new Decimal(500000)
      const rent = new Decimal(200000)
      const other = [{ amount: '100000' }, { amount: '50000' }]
      const result = calculateTotalFixedCosts(insurance, staff, rent, other)
      expect(result.toNumber()).toBe(950000)
    })

    it('should handle empty other expenses', () => {
      const result = calculateTotalFixedCosts(
        new Decimal(100000),
        new Decimal(500000),
        new Decimal(200000),
        []
      )
      expect(result.toNumber()).toBe(800000)
    })
  })

  describe('formatCurrency', () => {
    it('should format RUB currency correctly', () => {
      const result = formatCurrency(new Decimal(1234567.89), 'RUB')
      expect(result).toContain('₽')
      expect(result).toContain('1,234,567.89')
    })

    it('should format USD currency correctly', () => {
      const result = formatCurrency(new Decimal(1234.56), 'USD')
      expect(result).toContain('$')
      expect(result).toContain('1,234.56')
    })

    it('should handle zero amount', () => {
      const result = formatCurrency(new Decimal(0), 'RUB')
      expect(result).toContain('₽')
      expect(result).toContain('0.00')
    })
  })
})
