import { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

export const staggerChildren: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const slideIn: Variants = {
  initial: (direction: 'left' | 'right' = 'right') => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200
    }
  },
  exit: (direction: 'left' | 'right' = 'right') => ({
    x: direction === 'left' ? '-100%' : '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 200
    }
  })
}

export const pulseGlow: Variants = {
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(114, 14, 14, 0)',
      '0 0 20px 10px rgba(114, 14, 14, 0.3)',
      '0 0 0 0 rgba(114, 14, 14, 0)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

export const floatAnimation: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}