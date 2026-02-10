import React from "react"
import clsx from "clsx"
import { Error } from "@/components/ui/error"

const sizes = [
  {
    xsmall: "h-6 text-xs pl-1.5 pr-6",
    small: "h-8 text-sm pl-3 pr-8",
    medium: "h-10 text-sm pl-3 pr-8",
    large: "h-12 text-base pl-3 pr-10 rounded-lg",
  },
  {
    xsmall: "h-6 text-xs px-6",
    small: "h-8 text-sm px-8",
    medium: "h-10 text-sm px-8",
    large: "h-12 text-base px-10 rounded-lg",
  },
]

export interface Option {
  value: string
  label: string
}

interface SelectProps {
  variant?: "default" | "ghost"
  options?: Option[]
  label?: string
  value?: string
  placeholder?: string
  size?: keyof typeof sizes[0]
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  disabled?: boolean
  error?: string
  onChange?: React.ChangeEventHandler<HTMLSelectElement>
}

const ArrowBottom = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
    />
  </svg>
)

export const Select = ({
  variant = "default",
  options,
  label,
  value,
  placeholder,
  size = "medium",
  suffix,
  prefix,
  disabled = false,
  error,
  onChange,
}: SelectProps) => {
  return (
    <div>
      {label && (
        <label className="block font-sans text-xs uppercase tracking-wide text-slate-500 mb-2">
          {label}
        </label>
      )}
      <div
        className={clsx(
          "relative flex items-center text-slate-700",
          disabled ? "fill-slate-400" : "fill-slate-500 hover:fill-slate-900"
        )}
      >
        <select
          disabled={disabled}
          value={value}
          onChange={onChange}
          className={clsx(
            "font-sans appearance-none w-full border rounded-md transition-colors outline-none bg-white dark:bg-slate-900",
            sizes[prefix ? 1 : 0][size],
            disabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : variant === "default"
              ? "text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/40"
              : "bg-transparent text-slate-200 border-transparent focus:ring-2 focus:ring-primary/40",
            error && "border-red-500 ring-2 ring-red-500/40"
          )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {prefix && (
          <span
            className={clsx(
              "absolute pointer-events-none left-3 flex items-center",
              size === "xsmall" ? "top-1" : "top-2"
            )}
          >
            {prefix}
          </span>
        )}
        <span
          className={clsx(
            "absolute pointer-events-none flex items-center",
            size === "xsmall" ? "right-2 top-1" : "right-3 top-2"
          )}
        >
          {suffix ?? <ArrowBottom />}
        </span>
      </div>
      {error && (
        <div className="mt-1">
          <Error size={size === "large" ? "large" : "small"}>{error}</Error>
        </div>
      )}
    </div>
  )
}



