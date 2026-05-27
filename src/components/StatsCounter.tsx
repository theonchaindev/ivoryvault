'use client'

import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react'
import { useRef, useEffect } from 'react'

interface Stat { v: string; l: string }

function AnimatedNumber({ value }: { value: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { once: true })
  const numericPart = value.replace(/[^0-9]/g, '')
  const isNumeric = numericPart.length > 0
  const prefix = value.match(/^[£]/) ? value[0] : ''
  const suffix = value.replace(/^[£]/, '').replace(/[0-9]+/, '')
  const num = parseInt(numericPart)

  const count = useMotionValue(0)
  const rounded = useTransform(count, v => {
    const n = Math.round(v)
    if (!isNumeric) return value
    if (value.includes('k')) return `${prefix}${n}k+`
    return `${prefix}${n.toLocaleString()}${suffix}`
  })

  useEffect(() => {
    if (!inView || !isNumeric) return
    const controls = animate(count, num, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2,
    })
    return controls.stop
  }, [inView, count, num, isNumeric])

  return (
    <motion.p className="stat-v" ref={ref}>
      {isNumeric ? <motion.span>{rounded}</motion.span> : value}
    </motion.p>
  )
}

export default function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="stats-band" ref={ref}>
      {stats.map((s, i) => (
        <motion.div
          key={s.l}
          className="stat-item"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.1 }}
          style={{ borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none' }}
        >
          <AnimatedNumber value={s.v} />
          <p className="stat-l">{s.l}</p>
        </motion.div>
      ))}
    </section>
  )
}
