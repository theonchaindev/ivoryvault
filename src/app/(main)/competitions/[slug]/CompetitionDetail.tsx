'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import CountdownTimer from '@/components/CountdownTimer'
import TicketSelector from './TicketSelector'
import { formatDate } from '@/lib/utils'

interface Competition {
  id: string; slug: string; title: string; subtitle?: string | null
  description: string; prizeValue: number; ticketPrice: number
  maxTickets: number; ticketsSold: number; status: string
  drawDate?: Date | null; images: string[]
}

const ease = [0.22, 1, 0.36, 1] as const

export default function CompetitionDetail({ competition, isInstant = false, instantSpins = 0 }: { competition: Competition; isInstant?: boolean; instantSpins?: number }) {
  const [activeImg, setActiveImg] = useState(0)
  const remaining = competition.maxTickets - competition.ticketsSold
  const pct = Math.round((competition.ticketsSold / competition.maxTickets) * 100)
  const hot = pct >= 80

  // Mobile: an in-page "Enter Now" button opens the ticket sheet; the sticky
  // bottom bar only appears once that button has scrolled out of view.
  const [sheetOpen, setSheetOpen] = useState(false)
  const enterBtnRef = useRef<HTMLButtonElement>(null)
  const [topEnterVisible, setTopEnterVisible] = useState(true)

  useEffect(() => {
    const el = enterBtnRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setTopEnterVisible(entry.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className={"cdp"}>
      <div className="cdp__inner">

        {/* ── LEFT: image column ── */}
        <motion.div
          className="cdp__images"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Main image */}
          <div className="cdp__main-img-wrap">
            <AnimatePresence mode="sync">
              {competition.images.length > 0 ? (
                <motion.img
                  key={activeImg}
                  src={competition.images[activeImg]}
                  alt={competition.title}
                  className="cdp__main-img"
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              ) : (
                <div className="cdp__img-placeholder" />
              )}
            </AnimatePresence>

            {hot && <span className="cdp__hot">🔥 Selling Fast</span>}
          </div>

          {/* Thumbnails */}
          {competition.images.length > 1 && (
            <div className="cdp__thumbs">
              {competition.images.map((src, i) => (
                <motion.button
                  key={i}
                  className={`cdp__thumb${i === activeImg ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" />
                </motion.button>
              ))}
            </div>
          )}

          {/* Mobile-only Enter Now button, above the countdown */}
          {competition.status === 'active' && (
            <button ref={enterBtnRef} className="cdp__mobile-enter" onClick={() => setSheetOpen(true)}>
              Enter Now
            </button>
          )}

          {/* Draw info card */}
          {competition.drawDate && (
            <div className="cdp__draw-info">
              <p className="cdp__draw-label">Draw closes in</p>
              <CountdownTimer drawDate={competition.drawDate.toISOString()} />
              <p className="cdp__draw-date">Draw date: {formatDate(competition.drawDate)}</p>
            </div>
          )}
        </motion.div>

        {/* ── RIGHT: info + ticket selector ── */}
        <motion.div
          className="cdp__right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          {/* Title */}
          <div className="cdp__title-block">
            {isInstant && <span className="cdp__instant-badge">⚡ Spin &amp; Win Instantly</span>}
            {!isInstant && <h1 className="cdp__title">{competition.title}</h1>}
            {competition.subtitle && <p className="cdp__subtitle">{competition.subtitle}</p>}
          </div>

          {/* Instant-win reveal banner */}
          {isInstant && instantSpins > 0 && (
            <a href={`/instant/${competition.slug}`} className="cdp__reveal-banner">
              You have {instantSpins} instant spin{instantSpins === 1 ? '' : 's'} ready
              <span>Reveal Instant Spin Results →</span>
            </a>
          )}

          {/* Progress */}
          <div className="cdp__progress-card">
            <div className="cdp__progress-stats">
              <div>
                <p className="cdp__stat-label">Tickets Sold</p>
                <p className="cdp__stat-val">{competition.ticketsSold.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="cdp__stat-label">Remaining</p>
                <p className="cdp__stat-val cdp__stat-val--gold">{remaining.toLocaleString()}</p>
              </div>
            </div>
            <div className="cdp__track">
              <motion.div
                className="cdp__fill"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, ease, delay: 0.3 }}
              />
            </div>
            <p className="cdp__pct">{pct}% sold of {competition.maxTickets.toLocaleString()} tickets</p>
          </div>

          {/* Ticket selector */}
          <TicketSelector
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            hideTrigger={topEnterVisible}
            competition={{
              id: competition.id,
              slug: competition.slug,
              title: competition.title,
              image: competition.images[0] ?? null,
              ticketPrice: competition.ticketPrice,
              maxTickets: competition.maxTickets,
              ticketsSold: competition.ticketsSold,
              status: competition.status,
            }} />

          {/* Description */}
          <div className="cdp__desc-card">
            <h2 className="cdp__card-title">About This Prize</h2>
            <p className="cdp__desc-body">{competition.description}</p>
          </div>

          {/* How draw works */}
          <div className="cdp__draw-card">
            <h2 className="cdp__card-title">How the Draw Works</h2>
            {[
              'Every ticket is assigned a unique number at purchase.',
              'When the competition closes, a winner is drawn at random using verified software.',
              'All draws are live-recorded and fully transparent.',
              'The winner is contacted within 24 hours. Prize dispatched within 7 days.',
              'Full audit trail — every entry is verifiable.',
            ].map((item, i) => (
              <motion.div
                key={i}
                className="cdp__draw-item"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease, delay: i * 0.06 }}
              >
                <span className="cdp__draw-n">{String(i + 1).padStart(2, '0')}</span>
                <p>{item}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      <style>{`
        .cdp { background: var(--bg); padding: 3rem 0 5rem; }
        /* Extra bottom padding on mobile so sticky CTA doesn't overlap content */
        @media (max-width: 860px) { .cdp { padding-bottom: 7rem; } }
        .cdp__inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 clamp(1.5rem,3vw,3rem);
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(2rem,4vw,4rem); align-items: start;
        }
        @media (max-width: 860px) { .cdp__inner { grid-template-columns: 1fr; } }

        /* Left: images */
        .cdp__images { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 84px; }
        @media (max-width: 860px) { .cdp__images { position: static; } }

        .cdp__main-img-wrap {
          position: relative; aspect-ratio: 1/1; overflow: hidden;
          border-radius: var(--r-card); background: var(--bg2);
          box-shadow: var(--shadow-md);
        }
        .cdp__main-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
        .cdp__img-placeholder { position: absolute; inset: 0; background: linear-gradient(145deg,var(--bg2),var(--border)); }

        .cdp__hot {
          position: absolute; top: 1rem; left: 1rem; z-index: 2;
          background: #e05a30; color: #fff;
          font-size: .5rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          padding: .3rem .75rem; border-radius: var(--r-pill);
        }
        .cdp__prize-chip {
          position: absolute; bottom: 1rem; right: 1rem; z-index: 2;
          background: rgba(250,247,242,.93); backdrop-filter: blur(10px);
          border: 1px solid rgba(31,122,224,.4); border-radius: var(--r-card);
          padding: .625rem 1rem; text-align: right;
        }
        .cdp__prize-chip-label { display: block; font-size: .45rem; letter-spacing: .14em; text-transform: uppercase; color: var(--gold); font-weight: 600; margin-bottom: .2rem; }
        .cdp__prize-chip-val { display: block; font-family: var(--font-cormorant,serif); font-size: 1.875rem; font-weight: 700; color: var(--ink); line-height: 1; }

        /* Thumbnails */
        .cdp__thumbs { display: flex; gap: .625rem; }
        .cdp__thumb {
          width: 72px; height: 72px; flex-shrink: 0;
          overflow: hidden; border-radius: 10px;
          border: 2.5px solid var(--border); cursor: pointer; padding: 0; background: none;
          transition: border-color .2s;
        }
        .cdp__thumb.active { border-color: var(--gold); }
        .cdp__thumb:hover:not(.active) { border-color: var(--ink2); }
        .cdp__thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* Draw info */
        /* Mobile-only in-page Enter Now button (above the countdown) */
        .cdp__mobile-enter { display: none; }
        @media (max-width: 860px) {
          .cdp__mobile-enter {
            display: block; width: 100%; background: var(--gold); color: #fff; border: none; cursor: pointer;
            font-family: inherit; font-size: .8125rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
            padding: 1rem; border-radius: var(--r-btn); box-shadow: 0 8px 22px rgba(37,99,235,.28);
            transition: background .2s, transform .15s;
          }
          .cdp__mobile-enter:active { transform: scale(.98); background: var(--gold-d); }
        }
        .cdp__draw-info { background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.25rem; }
        .cdp__draw-label { font-size: .5375rem; letter-spacing: .16em; text-transform: uppercase; color: var(--ink3); margin-bottom: .75rem; font-weight: 500; }
        .cdp__draw-date { font-size: .8125rem; color: var(--ink3); margin-top: .75rem; }

        /* Right */
        .cdp__right { display: flex; flex-direction: column; gap: 1.25rem; }

        .cdp__title-block {}
        .cdp__title { font-family: var(--font-cormorant,serif); font-size: clamp(1.875rem,3.5vw,3rem); font-weight: 700; color: var(--ink); line-height: 1; letter-spacing: -.02em; margin-bottom: .375rem; }
        .cdp__subtitle { font-family: var(--font-cormorant,serif); font-style: italic; font-size: 1rem; color: var(--ink3); }
        .cdp__instant-badge { display: inline-block; background: var(--gold-pale); border: 1px solid var(--gold); color: var(--gold); font-size: .55rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; padding: .35rem .8rem; border-radius: 999px; margin-bottom: .75rem; }
        .cdp__reveal-banner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; background: var(--gold); color: #fff; border-radius: var(--r-card); padding: 1rem 1.25rem; text-decoration: none; font-weight: 700; font-size: .875rem; box-shadow: 0 8px 24px rgba(37,99,235,.3); transition: background .2s, transform .15s; }
        .cdp__reveal-banner:hover { background: var(--gold-d); transform: translateY(-1px); }
        .cdp__reveal-banner span { font-size: .75rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; opacity: .95; }

        /* Progress */
        .cdp__progress-card { background: linear-gradient(180deg, var(--card), var(--gold-pale)); border: 1.5px solid var(--gold); border-radius: var(--r-card); padding: 1.5rem; box-shadow: 0 8px 22px rgba(37,99,235,.1); }
        .cdp__progress-stats { display: flex; justify-content: space-between; margin-bottom: .875rem; }
        .cdp__stat-label { font-size: .5875rem; letter-spacing: .14em; text-transform: uppercase; color: var(--ink2); margin-bottom: .25rem; font-weight: 600; }
        .cdp__stat-val { font-family: var(--font-cormorant,serif); font-size: 2.25rem; font-weight: 600; color: var(--ink); line-height: 1; }
        .cdp__stat-val--gold { color: var(--gold); }
        .cdp__track { height: 6px; background: var(--track); border-radius: var(--r-pill); overflow: hidden; margin-bottom: .5rem; }
        .cdp__fill { height: 100%; background: var(--gold); border-radius: var(--r-pill); }
        .cdp__pct { font-size: .75rem; color: var(--ink3); text-align: right; }

        /* Desc / draw cards */
        .cdp__desc-card, .cdp__draw-card { background: var(--card); border: 1px solid var(--border); border-radius: var(--r-card); padding: 1.5rem; }
        .cdp__card-title { font-family: var(--font-cormorant,serif); font-size: 1.375rem; font-weight: 500; color: var(--ink); padding-bottom: .75rem; border-bottom: 1px solid var(--border); margin-bottom: 1rem; }
        .cdp__desc-body { font-size: .875rem; line-height: 1.85; color: var(--ink2); white-space: pre-wrap; }
        .cdp__draw-item { display: flex; gap: .875rem; align-items: flex-start; font-size: .875rem; line-height: 1.75; color: var(--ink2); padding: .625rem 0; border-bottom: 1px solid var(--border); }
        .cdp__draw-item:last-child { border-bottom: none; padding-bottom: 0; }
        .cdp__draw-n { font-family: var(--font-cormorant,serif); font-size: 1.125rem; font-weight: 700; color: var(--gold); min-width: 24px; line-height: 1.5; flex-shrink: 0; }
      `}</style>
    </div>
  )
}
