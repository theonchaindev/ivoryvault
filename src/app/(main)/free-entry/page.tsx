import AnimatedSection from '@/components/AnimatedSection'
import Link from 'next/link'

export const metadata = {
  title: 'Free Entry — Ivory Vault',
  description: 'Enter Ivory Vault competitions for free via our postal entry route. No purchase necessary.',
}

export default function FreeEntryPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>No Purchase Necessary</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, color: 'var(--ink)' }}>
            Free Entry Route
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#5c524a',
              marginTop: '0.75rem',
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
            }}
          >
            Every competition can be entered for free via postal entry.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <AnimatedSection>
          {/* Important notice */}
          <div
            style={{
              padding: '1.5rem 2rem',
              backgroundColor: 'var(--card)',
              border: '1px solid var(--gold)',
              borderLeft: '4px solid var(--gold)',
              marginBottom: '3rem',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: '#5c524a', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--ink)' }}>Important:</strong> In accordance with UK competition law, a free alternative method of entry (AMOE) is available for all Ivory Vault competitions. No purchase is necessary to enter, and free entries are given equal standing in the draw.
            </p>
          </div>

          {/* How to enter free */}
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.875rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '2rem' }}>
            How to Enter for Free
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
            {[
              {
                step: '01',
                title: 'Write Your Entry',
                content: 'On a plain piece of paper, write the following information clearly:\n• Your full name\n• Your date of birth\n• Your full postal address\n• Your email address (for prize notification)\n• The name of the competition you wish to enter\n• The number of entries you are requesting (maximum 1 free entry per competition per person)',
              },
              {
                step: '02',
                title: 'Post Your Entry',
                content: 'Place your entry in a sealed envelope and post it to:\n\nIvory Vault Free Entry\nPO Box [TBC]\nUnited Kingdom\n\nEntries must be received at least 48 hours before the stated competition close date.',
              },
              {
                step: '03',
                title: 'Entry Confirmation',
                content: 'Free entries will be added to the draw within 2 working days of receipt. You will receive an email confirmation once your entry has been processed. If you do not receive confirmation within 5 working days, please contact us.',
              },
              {
                step: '04',
                title: 'The Draw',
                content: 'Free entries are included in the main draw alongside purchased ticket entries. Every free entry has an equal chance of winning. There is no difference in the weight given to free versus purchased entries in the random selection process.',
              },
            ].map(item => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  gap: '2rem',
                  padding: '2rem',
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <span
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '3rem',
                      fontWeight: 700,
                      color: 'var(--border)',
                      lineHeight: 1,
                      display: 'block',
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#5c524a', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Rules */}
          <div style={{ padding: '2rem', backgroundColor: 'var(--card)', border: '1px solid var(--border)', marginBottom: '3rem' }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '1.25rem' }}>
              Free Entry Rules
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Maximum 1 free entry per person per competition',
                'Entrant must be a UK resident aged 18 or over',
                'Entries must be handwritten — printed or photocopied entries are not valid',
                'Entries must be posted, not emailed or submitted online',
                'Free entries must arrive at least 48 hours before competition close date',
                'Late or illegible entries will not be accepted',
                'Entries that do not include all required information will be disqualified',
                'Free entries are subject to the same Terms & Conditions as purchased tickets',
              ].map((rule, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--gold)', marginTop: '9px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', color: '#5c524a', lineHeight: 1.7 }}>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--ink3)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Have questions about free entry?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn-outline">Contact Us</Link>
              <Link href="/competitions" className="btn-primary">Browse Competitions</Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
