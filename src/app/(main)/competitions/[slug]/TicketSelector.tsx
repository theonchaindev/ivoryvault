'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface TicketSelectorProps {
  competition: {
    id: string
    title: string
    ticketPrice: number
    maxTickets: number
    ticketsSold: number
    status: string
  }
}

export default function TicketSelector({ competition }: TicketSelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const remaining = competition.maxTickets - competition.ticketsSold
  const maxSelect = Math.min(remaining, 50)
  const total = competition.ticketPrice * quantity

  const handleCheckout = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitionId: competition.id, quantity }),
      })

      const data = await res.json()

      if (res.status === 401) {
        window.location.href = '/login?from=' + encodeURIComponent(window.location.pathname)
        return
      }

      if (!res.ok) {
        setError(data.error || 'Failed to create payment')
        return
      }

      // In a real app, redirect to Stripe checkout or use Stripe Elements
      alert(`Payment intent created! Client secret: ${data.clientSecret?.substring(0, 20)}...\n\nIn production, this would open the Stripe payment flow.`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (competition.status !== 'active') {
    return (
      <div style={{ backgroundColor: '#fffcf9', border: '1px solid #e8d8cc', padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', color: '#9a8878' }}>
          This competition has closed
        </p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#fffcf9', border: '1px solid #e8d8cc', padding: '2rem' }}>
      <h2
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.5rem',
          fontWeight: 600,
          color: '#1c1a18',
          marginBottom: '0.375rem',
        }}
      >
        Enter This Competition
      </h2>
      <p style={{ fontSize: '0.85rem', color: '#9a8878', marginBottom: '2rem' }}>
        {remaining.toLocaleString()} tickets remaining
      </p>

      {/* Price per ticket */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fdf6ef' }}>
        <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c524a' }}>Per Ticket</span>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.75rem', fontWeight: 600, color: '#b76e79' }}>
          {formatCurrency(competition.ticketPrice)}
        </span>
      </div>

      {/* Quantity */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#5c524a',
            marginBottom: '0.75rem',
          }}
        >
          Number of Tickets
        </label>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8d8cc', backgroundColor: 'white' }}>
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              borderRight: '1px solid #e8d8cc',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#5c524a',
            }}
          >
            −
          </button>
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              fontFamily: 'var(--font-cormorant)',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#1c1a18',
            }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(q => Math.min(maxSelect, q + 1))}
            style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              borderLeft: '1px solid #e8d8cc',
              cursor: 'pointer',
              fontSize: '1.25rem',
              color: '#5c524a',
            }}
          >
            +
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#9a8878', marginTop: '0.5rem' }}>
          Max {maxSelect} per transaction
        </p>
      </div>

      {/* Quick pick */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[1, 3, 5, 10].filter(n => n <= maxSelect).map(n => (
          <button
            key={n}
            onClick={() => setQuantity(n)}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              border: '1px solid',
              borderColor: quantity === n ? '#b76e79' : '#e8d8cc',
              backgroundColor: quantity === n ? '#b76e79' : 'white',
              color: quantity === n ? 'white' : '#5c524a',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e8d8cc',
          borderBottom: '1px solid #e8d8cc',
          padding: '1rem 0',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#5c524a' }}>Total</span>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2rem', fontWeight: 600, color: '#1c1a18' }}>
          {formatCurrency(total)}
        </span>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: 'rgba(183,110,121,0.08)',
            border: '1px solid rgba(183,110,121,0.2)',
            color: '#8a4f58',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleCheckout}
        disabled={loading}
        style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Processing...' : `Enter Now — ${formatCurrency(total)}`}
      </button>

      <p style={{ fontSize: '0.75rem', color: '#9a8878', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
        🔒 Secure payment via Stripe.{' '}
        No purchase necessary —{' '}
        <a href="/free-entry" style={{ color: '#b76e79', textDecoration: 'none' }}>
          free entry available
        </a>
        .
      </p>
    </div>
  )
}
