import { useState, useEffect, useCallback } from 'react'

export function useOtpResend(initialCooldown = 30) {
  const [cooldown, setCooldown] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return

    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const startCooldown = useCallback(() => {
    // Calculate next cooldown: initial * 2^retryCount
    // Cap at 1 hour (3600 seconds)
    const nextCooldown = Math.min(initialCooldown * Math.pow(2, retryCount), 3600)
    setCooldown(nextCooldown)
    setRetryCount((prev) => prev + 1)
  }, [initialCooldown, retryCount])

  const resetResend = useCallback(() => {
    setCooldown(0)
    setRetryCount(0)
  }, [])

  return {
    cooldown,
    canResend: cooldown === 0,
    startCooldown,
    resetResend,
  }
}
