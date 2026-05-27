'use client'

import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
  from?: 'bottom' | 'left' | 'right'
}

export default function AnimatedSection({ children, delay = 0, className, from = 'bottom' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const initial =
    from === 'left' ? { opacity: 0, x: -40, y: 0 } :
    from === 'right' ? { opacity: 0, x: 40, y: 0 } :
    { opacity: 0, x: 0, y: 36 }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
