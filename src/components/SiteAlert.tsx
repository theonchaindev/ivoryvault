'use client'

import { useLayoutEffect, useRef } from 'react'

// Site-wide, non-clickable notice bar. Fixed to the top on every customer page.
// Publishes its own height as --banner-h so the navbar and page content offset
// beneath it regardless of how the text wraps.
export default function SiteAlert() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => document.documentElement.style.setProperty('--banner-h', `${el.offsetHeight}px`)
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    window.addEventListener('resize', apply)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', apply)
      document.documentElement.style.removeProperty('--banner-h')
    }
  }, [])

  return (
    <div ref={ref} className="site-alert" role="status" aria-live="polite">
      <p className="site-alert__text">
        <strong>Payments temporarily unavailable.</strong> We&rsquo;re really sorry — we&rsquo;re working to fix
        this as quickly as we can. Please check back soon to enter.
      </p>
    </div>
  )
}
