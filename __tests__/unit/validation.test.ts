import {
  emailSchema,
  passwordSchema,
  currencySchema,
  positiveNumberSchema,
  percentageSchema,
  operatingHoursSchema,
  validateForm,
} from '@/utils/validation'
import { z } from 'zod'

describe('Validation Utilities', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.safeParse('user@example.com')
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse('invalid-email')
      expect(result.success).toBe(false)
    })

    it('should reject empty string', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      const result = passwordSchema.safeParse('Password123')
      expect(result.success).toBe(true)
    })

    it('should reject short password', () => {
      const result = passwordSchema.safeParse('Pass1')
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase', () => {
      const result = passwordSchema.safeParse('password123')
      expect(result.success).toBe(false)
    })

    it('should reject password without lowercase', () => {
      const result = passwordSchema.safeParse('PASSWORD123')
      expect(result.success).toBe(false)
    })

    it('should reject password without number', () => {
      const result = passwordSchema.safeParse('Password')
      expect(result.success).toBe(false)
    })
  })

  describe('currencySchema', () => {
    it('should validate 3-letter currency code', () => {
      const result = currencySchema.safeParse('USD')
      expect(result.success).toBe(true)
    })

    it('should reject invalid length', () => {
      const result = currencySchema.safeParse('US')
      expect(result.success).toBe(false)
    })
  })

  describe('positiveNumberSchema', () => {
    it('should validate positive number', () => {
      const result = positiveNumberSchema.safeParse(100)
      expect(result.success).toBe(true)
    })

    it('should validate positive number string', () => {
      const result = positiveNumberSchema.safeParse('100')
      expect(result.success).toBe(true)
    })

    it('should reject negative number', () => {
      const result = positiveNumberSchema.safeParse(-100)
      expect(result.success).toBe(false)
    })

    it('should reject zero', () => {
      const result = positiveNumberSchema.safeParse(0)
      expect(result.success).toBe(false)
    })
  })

  describe('percentageSchema', () => {
    it('should validate percentage in range', () => {
      const result = percentageSchema.safeParse(50)
      expect(result.success).toBe(true)
    })

    it('should validate 0%', () => {
      const result = percentageSchema.safeParse(0)
      expect(result.success).toBe(true)
    })

    it('should validate 100%', () => {
      const result = percentageSchema.safeParse(100)
      expect(result.success).toBe(true)
    })

    it('should reject negative percentage', () => {
      const result = percentageSchema.safeParse(-10)
      expect(result.success).toBe(false)
    })

    it('should reject over 100%', () => {
      const result = percentageSchema.safeParse(150)
      expect(result.success).toBe(false)
    })
  })

  describe('operatingHoursSchema', () => {
    it('should validate hours in range', () => {
      const result = operatingHoursSchema.safeParse(200)
      expect(result.success).toBe(true)
    })

    it('should validate 0 hours', () => {
      const result = operatingHoursSchema.safeParse(0)
      expect(result.success).toBe(true)
    })

    it('should validate 1000 hours', () => {
      const result = operatingHoursSchema.safeParse(1000)
      expect(result.success).toBe(true)
    })

    it('should reject negative hours', () => {
      const result = operatingHoursSchema.safeParse(-10)
      expect(result.success).toBe(false)
    })

    it('should reject over 1000 hours', () => {
      const result = operatingHoursSchema.safeParse(1500)
      expect(result.success).toBe(false)
    })
  })

  describe('validateForm', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(18),
    })

    it('should validate correct data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }
      const result = validateForm(testSchema, data)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(data)
    })

    it('should return errors for invalid data', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        age: 15,
      }
      const result = validateForm(testSchema, data)
      expect(result.success).toBe(false)
      expect(result.errors).toBeDefined()
      expect(Object.keys(result.errors || {}).length).toBeGreaterThan(0)
    })
  })
})
