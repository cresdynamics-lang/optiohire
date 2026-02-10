"use client"

import { useEffect, useId, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

export function Sparkles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  options = {},
}: {
  className?: string
  size?: number
  minSize?: number | null
  density?: number
  speed?: number
  minSpeed?: number | null
  opacity?: number
  opacitySpeed?: number
  minOpacity?: number | null
  color?: string
  background?: string
  options?: any
}) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setIsReady(true)
    })
  }, [])

  const id = useId()

  const defaultOptions = {
    background: {
      color: {
        value: background,
      },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 60, // Reduced from 120 for smoother performance
    particles: {
      color: {
        value: color,
      },
      move: {
        enable: true,
        direction: "none",
        speed: {
          min: minSpeed || speed / 10,
          max: speed,
        },
        straight: false,
        outModes: {
          default: "out",
        },
        // Smooth continuous movement
        bounce: false,
        attract: {
          enable: false,
        },
      },
      number: {
        value: density,
        // Ensure particles are always active
        density: {
          enable: true,
          area: 800,
        },
      },
      opacity: {
        value: {
          min: minOpacity || opacity / 10,
          max: opacity,
        },
        animation: {
          enable: true,
          sync: false,
          speed: opacitySpeed,
          // Continuous animation without stopping
          destroy: "none",
          startValue: "random",
        },
      },
      size: {
        value: {
          min: minSize || size / 2.5,
          max: size,
        },
        animation: {
          enable: false, // Disable size animation for smoother performance
        },
      },
      // Life settings for continuous particles
      life: {
        count: 0, // Infinite particles
        delay: {
          value: 0,
        },
        duration: {
          value: 0,
        },
      },
    },
    detectRetina: true,
  }

  return isReady && <Particles id={id} options={{ ...defaultOptions, ...options }} className={className} />
}

