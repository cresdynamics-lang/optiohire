import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-figtree active:scale-[0.99]",
  {
    variants: {
      variant: {
          default: "bg-primary text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30",
          secondary: "bg-secondary text-white hover:bg-sky-600 shadow-sm shadow-cyan-500/20 hover:shadow-md hover:shadow-cyan-500/30",
        destructive:
            "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20 hover:shadow-md hover:shadow-red-500/30",
        outline:
            "border border-slate-300/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        link: "text-primary underline-offset-4 hover:underline",
          gradient: "bg-gradient-to-r from-primary to-secondary text-white hover:from-blue-700 hover:to-sky-600 shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-cyan-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
