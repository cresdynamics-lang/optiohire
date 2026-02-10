import React from "react"
import clsx from "clsx"
import { Spinner } from "@/components/ui/spinner-1"

const sizes = [
  {
    tiny: "px-1.5 h-6 text-xs",
    small: "px-1.5 h-8 text-sm",
    medium: "px-2.5 h-10 text-sm",
    large: "px-3.5 h-12 text-base",
  },
  {
    tiny: "w-6 h-6 text-xs",
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-sm",
    large: "w-12 h-12 text-base",
  },
]

const types = {
  primary: "bg-slate-900 hover:bg-slate-800 text-white fill-white",
  secondary:
    "bg-white hover:bg-slate-100 text-slate-900 fill-slate-900 border border-slate-200",
  tertiary: "bg-transparent hover:bg-slate-100 text-slate-900 fill-slate-900",
  error: "bg-red-600 hover:bg-red-500 text-white fill-white",
  warning: "bg-amber-500 hover:bg-amber-400 text-black fill-black",
}

const shapes = {
  square: {
    tiny: "rounded",
    small: "rounded-md",
    medium: "rounded-md",
    large: "rounded-lg",
  },
  circle: {
    tiny: "rounded-full",
    small: "rounded-full",
    medium: "rounded-full",
    large: "rounded-full",
  },
  rounded: {
    tiny: "rounded-full",
    small: "rounded-full",
    medium: "rounded-full",
    large: "rounded-full",
  },
}

export interface ButtonProps {
  size?: keyof typeof sizes[0]
  type?: keyof typeof types
  variant?: "styled" | "unstyled"
  shape?: keyof typeof shapes
  svgOnly?: boolean
  children?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  shadow?: boolean
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  ref?: React.Ref<HTMLButtonElement>
  className?: string
}

export const Button = ({
  size = "medium",
  type = "primary",
  variant = "styled",
  shape = "square",
  svgOnly = false,
  children,
  prefix,
  suffix,
  shadow = false,
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  ref,
  className,
  ...rest
}: ButtonProps) => {
  const baseClasses =
    variant === "unstyled"
      ? "outline-none px-0 h-fit bg-transparent hover:bg-transparent text-slate-900"
      : types[type]

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      tabIndex={0}
      className={clsx(
        "flex justify-center items-center gap-1 transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        sizes[Number(svgOnly)][size],
        shapes[shape][size],
        baseClasses,
        shadow && "shadow-lg",
        fullWidth && "w-full",
        disabled && !loading && "bg-slate-200 text-slate-500 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      {loading ? <Spinner size={size === "large" ? 24 : 16} color="currentColor" /> : prefix}
      <span
        className={clsx(
          "relative overflow-hidden whitespace-nowrap text-ellipsis font-sans",
          size !== "tiny" && variant !== "unstyled" && "px-1.5"
        )}
      >
        {children}
      </span>
      {!loading && suffix}
    </button>
  )
}



