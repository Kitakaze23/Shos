import { z } from "zod"

export const emailSchema = z.string().email("Invalid email address")

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const currencySchema = z.string().length(3, "Currency must be 3 characters")

export const positiveNumberSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val
    if (isNaN(num) || num < 0) {
      throw new Error("Must be a positive number")
    }
    return num
  })

export const percentageSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val
    if (isNaN(num) || num < 0 || num > 100) {
      throw new Error("Must be between 0 and 100")
    }
    return num
  })

export const operatingHoursSchema = z
  .union([z.string(), z.number()])
  .transform((val) => {
    const num = typeof val === "string" ? parseFloat(val) : val
    if (isNaN(num) || num < 0 || num > 1000) {
      throw new Error("Must be between 0 and 1000")
    }
    return num
  })

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _: "Validation failed" } }
  }
}
