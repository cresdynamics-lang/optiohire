import React from "react"
import clsx from "clsx"

const types = {
  base: "rounded-md shadow-md",
  small: "rounded-md shadow-sm",
  medium: "rounded-xl shadow-md",
  large: "rounded-xl shadow-lg",
  tooltip: "rounded-md shadow-lg",
  menu: "rounded-xl shadow-lg",
  modal: "rounded-xl shadow-2xl",
  fullscreen: "rounded-2xl shadow-2xl",
}

interface MaterialProps {
  type: keyof typeof types
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export const Material = React.forwardRef<HTMLDivElement, MaterialProps>(
  ({ type, children, className, style, onClick }, ref) => {
    return (
      <div
        className={clsx("bg-white dark:bg-slate-900", types[type], className)}
        ref={ref}
        style={style}
        onClick={onClick}
      >
        {children}
      </div>
    )
  }
)

Material.displayName = "Material"


