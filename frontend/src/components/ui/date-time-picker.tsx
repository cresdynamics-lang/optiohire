'use client'

import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar, RangeValue } from "@/components/ui/calendar"

interface DateTimePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minDateTime?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className,
  disabled,
  minDateTime,
}: DateTimePickerProps) {
  const [rangeValue, setRangeValue] = React.useState<RangeValue | null>(null)

  React.useEffect(() => {
    if (!value) {
      setRangeValue(null)
      return
    }

    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      setRangeValue(null)
      return
    }

    setRangeValue({ start: parsed, end: parsed })
  }, [value])

  const minValue = React.useMemo(() => {
    if (!minDateTime) return undefined
    const parsed = new Date(minDateTime)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  }, [minDateTime])

  const handleChange = React.useCallback(
    (nextValue: RangeValue | null) => {
      setRangeValue(nextValue)

      if (!nextValue?.start || !nextValue?.end) {
        return
      }

      const normalized = new Date(nextValue.end)
      normalized.setSeconds(0, 0)

      if (minValue && normalized < minValue) {
        return
      }

      onChange(format(normalized, "yyyy-MM-dd'T'HH:mm"))
    },
    [minValue, onChange]
  )

  return (
    <div className={cn("relative w-full", className)}>
      <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
        <Calendar
          allowClear={false}
          compact
          horizontalLayout
          showTimeInput
          value={rangeValue}
          onChange={handleChange}
          minValue={minValue}
        />
      </div>
      {!rangeValue?.end && (
        <p className="mt-2 text-xs text-muted-foreground">{placeholder}</p>
      )}
      {rangeValue?.end && (
        <p className="mt-2 text-xs text-muted-foreground">
          Selected {format(rangeValue.end, "MMM dd, yyyy hh:mm a")}
        </p>
      )}
    </div>
  )
}

