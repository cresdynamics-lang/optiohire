"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import { motion, useInView, Variants, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface TimelineContentProps extends HTMLMotionProps<"div"> {
  as?: keyof JSX.IntrinsicElements
  animationNum: number
  timelineRef: React.RefObject<HTMLElement | Element | null>
  customVariants?: Variants
  className?: string
  children?: ReactNode
}

export function TimelineContent({
  as = "div",
  animationNum,
  timelineRef,
  customVariants,
  className,
  children,
  ...props
}: TimelineContentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { 
    margin: "-100px",
    once: false 
  })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: animationNum * 0.1,
      },
    },
  }

  const variants = customVariants || defaultVariants

  const MotionComponent = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={hasAnimated ? "visible" : "hidden"}
      variants={variants}
      className={cn(className)}
      {...props}
    >
      {children}
    </MotionComponent>
  )
}

