/**
 * Optimized motion utilities for better animation performance
 * These utilities ensure hardware acceleration and smooth animations
 */

import { Transition } from 'framer-motion'

/**
 * Default optimized transition for smooth animations
 * Uses tween type for better performance than spring animations
 */
export const smoothTransition: Transition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}

/**
 * Optimized transition for fade-in animations
 */
export const fadeInTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.4,
}

/**
 * Optimized transition for slide animations
 */
export const slideTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.5,
}

/**
 * Optimized transition for scale animations
 */
export const scaleTransition: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.3,
}

/**
 * CSS classes for hardware acceleration
 */
export const gpuAcceleratedClasses = 'gpu-accelerated'

/**
 * Initial animation states for common animations
 */
export const initialStates = {
  fadeIn: { opacity: 0 },
  slideUp: { opacity: 0, y: 20 },
  slideDown: { opacity: 0, y: -20 },
  slideLeft: { opacity: 0, x: -20 },
  slideRight: { opacity: 0, x: 20 },
  scale: { opacity: 0, scale: 0.9 },
}

/**
 * Animate states for common animations
 */
export const animateStates = {
  fadeIn: { opacity: 1 },
  slideUp: { opacity: 1, y: 0 },
  slideDown: { opacity: 1, y: 0 },
  slideLeft: { opacity: 1, x: 0 },
  slideRight: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
}

