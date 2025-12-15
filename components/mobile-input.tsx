"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface MobileInputProps extends InputProps {
  label?: string
  currency?: string
  type?: "text" | "number" | "email" | "password" | "tel" | "url"
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel" | "url"
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, label, currency, type = "text", inputMode, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    React.useEffect(() => {
      if (props.value) {
        setHasValue(true)
      }
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    // Determine input mode for mobile keyboards
    const getInputMode = () => {
      if (inputMode) return inputMode
      if (type === "number") return "decimal"
      if (type === "email") return "email"
      if (type === "tel") return "tel"
      if (type === "url") return "url"
      return "text"
    }

    return (
      <div className="relative w-full">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              "absolute left-3 transition-all duration-200 pointer-events-none",
              isFocused || hasValue
                ? "top-2 text-xs text-primary"
                : "top-3 text-sm text-muted-foreground"
            )}
          >
            {label}
          </Label>
        )}
        <div className="relative">
          {currency && type === "number" && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {currency}
            </span>
          )}
          <Input
            ref={ref}
            type={type}
            inputMode={getInputMode()}
            className={cn(
              "h-14 text-base", // Larger touch target
              label && "pt-5", // Space for floating label
              currency && type === "number" && "pl-8",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
        </div>
      </div>
    )
  }
)
MobileInput.displayName = "MobileInput"
