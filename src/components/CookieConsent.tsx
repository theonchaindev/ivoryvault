'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'

const GA_ID = 'G-VY0D6ECGYP'
const KEY = 'iv-cookie-consent'

type Consent = 'accepted' | 'rejected'

export default function CookieConsent() {
  // undefined = not yet read (SSR/first paint); null = read, no choice made yet
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined)
  const [pixelId, setPixelId] = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY)
      setConsent(stored === 'accepted' ? 'accepted' : stored === 'rejected' ? 'rejected' : null)
    } catch { setConsent(null) }
    // Fetch the admin-configured Meta Pixel ID (public value)
    fetch('/api/site/meta-pixel')
      .then(r => r.json())
      .then(d => { if (d.pixelId && /^\d+$/.test(String(d.pixelId))) setPixelId(String(d.pixelId)) })
      .catch(() => {})
  }, [])

  const choose = (v: Consent) => {
    try { localStorage.setItem(KEY, v) } catch { /* ignore */ }
    setConsent(v)
  }

  return (
    <>
      {/* Google Analytics only loads once analytics cookies are accepted */}
      {consent === 'accepted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}

      {/* Meta Pixel — only after consent, only if an admin has configured a Pixel ID */}
      {consent === 'accepted' && pixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {consent === null && (
        <div className="cc-banner" role="dialog" aria-label="Cookie consent">
          <p className="cc-banner__text">
            We use essential cookies to run the site and, with your consent, analytics cookies (Google Analytics) to
            understand how it&apos;s used. See our <Link href="/terms" className="cc-banner__link">Terms &amp; Privacy</Link>.
          </p>
          <div className="cc-banner__btns">
            <button className="cc-banner__btn cc-banner__btn--reject" onClick={() => choose('rejected')}>Reject</button>
            <button className="cc-banner__btn cc-banner__btn--accept" onClick={() => choose('accepted')}>Accept</button>
          </div>

          <style>{`
            .cc-banner { position: fixed; left: 1rem; right: 1rem; bottom: 1rem; z-index: 3000; max-width: 640px; margin: 0 auto;
              background: #0e1526; border: 1px solid rgba(255,255,255,.12); border-radius: 14px; padding: 1rem 1.25rem;
              display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; box-shadow: 0 12px 40px rgba(0,0,0,.4);
              font-family: var(--font-montserrat), system-ui, sans-serif; }
            .cc-banner__text { flex: 1; min-width: 220px; font-size: .8rem; line-height: 1.55; color: rgba(255,255,255,.75); }
            .cc-banner__link { color: #6ea0f5; text-decoration: none; }
            .cc-banner__link:hover { text-decoration: underline; }
            .cc-banner__btns { display: flex; gap: .5rem; }
            .cc-banner__btn { padding: .6rem 1.1rem; border-radius: 9px; cursor: pointer; font-family: inherit;
              font-size: .7rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; border: 1px solid transparent; }
            .cc-banner__btn--reject { background: transparent; color: rgba(255,255,255,.7); border-color: rgba(255,255,255,.2); }
            .cc-banner__btn--reject:hover { color: #fff; border-color: rgba(255,255,255,.4); }
            .cc-banner__btn--accept { background: #2563eb; color: #fff; }
            .cc-banner__btn--accept:hover { background: #1d4ed8; }
          `}</style>
        </div>
      )}
    </>
  )
}
