import HowItWorks from '@/components/HowItWorks'
import AnimatedSection from '@/components/AnimatedSection'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works — Ivory Vault',
  description: 'Learn how Ivory Vault competitions work. UK competition law compliant, transparent draws, and real prizes.',
}

const faqs = [
  {
    q: 'Are these competitions legal in the UK?',
    a: 'Yes. All Ivory Vault competitions are operated in full compliance with UK competition law. A free entry route (postal entry) is always available, ensuring no purchase is necessary to enter.',
  },
  {
    q: 'How are winners selected?',
    a: "Winners are selected using a verified random number generator. The entire process is recorded and can be audited. Every ticket holder's entry is logged immutably in our system.",
  },
  {
    q: 'When will I receive my prize?',
    a: 'Winners are contacted within 24 hours of the draw. Physical prizes are dispatched within 7 working days. Cash prizes are transferred within 5 working days.',
  },
  {
    q: 'Can I enter multiple times?',
    a: 'Yes — purchasing more tickets increases your chances. You can buy up to 50 tickets per transaction, and multiple transactions are permitted.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards, Apple Pay, and Google Pay. All payments are processed securely by Stripe.',
  },
  {
    q: 'What is the free entry route?',
    a: 'To comply with UK law, a free postal entry route is available for every competition. See our Free Entry page for full instructions on how to enter without purchase.',
  },
  {
    q: 'What happens if a competition doesn\'t sell out?',
    a: 'If a competition reaches its draw date without selling all tickets, the draw proceeds normally with the tickets already sold. The competition is never cancelled.',
  },
  {
    q: 'How will I know if I\'ve won?',
    a: "Winners are notified by email and phone. We also publish winner announcements (with consent) on our Winners page and social media.",
  },
]

export default function HowItWorksPage() {
  return (
    <div style={{ backgroundColor: '#fdf6ef', minHeight: 'calc(100vh - 72px)' }}>
      {/* Header */}
      <div style={{ padding: '4rem 2rem 0', borderBottom: '1px solid #e8d8cc', backgroundColor: '#fffcf9' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingBottom: '3rem' }}>
          <p
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#b76e79',
              marginBottom: '0.75rem',
            }}
          >
            The Process
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 600,
              color: '#1c1a18',
              lineHeight: 1.1,
            }}
          >
            How It Works
          </h1>
          <p
            style={{
              fontSize: '1.1rem',
              color: '#5c524a',
              marginTop: '1rem',
              maxWidth: '600px',
              fontFamily: 'var(--font-cormorant)',
              fontStyle: 'italic',
              lineHeight: 1.6,
            }}
          >
            Transparent, fair, and fully UK compliant. Every detail of our competition process is designed with integrity.
          </p>
        </div>
      </div>

      {/* Steps */}
      <HowItWorks />

      {/* UK Compliance */}
      <section style={{ padding: '4rem 2rem', backgroundColor: '#fffcf9', borderTop: '1px solid #e8d8cc', borderBottom: '1px solid #e8d8cc' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AnimatedSection>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                color: '#1c1a18',
                marginBottom: '1.5rem',
              }}
            >
              UK Competition Law Compliance
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'All competitions are operated under UK law as skill-based or prize competitions.',
                'A free alternative method of entry (AMOE) is available for every competition.',
                'No purchase is required to enter. Ticket purchases do not increase mathematical advantage over free entries when factored against the free entry pool.',
                'We comply with the Gambling Commission\'s guidance on promotional competitions.',
                'All participants must be 18 years of age or older.',
                'Ivory Vault reserves the right to request proof of age and identity from any winner.',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b76e79', marginTop: '7px', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.9rem', color: '#5c524a', lineHeight: 1.7 }}>{item}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/free-entry" className="btn-outline">
                View Free Entry Instructions
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <AnimatedSection>
            <h2
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
                fontWeight: 600,
                color: '#1c1a18',
                marginBottom: '3rem',
              }}
            >
              Frequently Asked Questions
            </h2>
          </AnimatedSection>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {faqs.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 0.05}>
                <div
                  style={{
                    padding: '2rem 0',
                    borderBottom: '1px solid #e8d8cc',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: '#1c1a18',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {faq.q}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#5c524a', lineHeight: 1.75 }}>
                    {faq.a}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <p style={{ color: '#9a8878', marginBottom: '1rem' }}>Still have questions?</p>
              <Link href="/contact" className="btn-primary">
                Contact Us
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}
