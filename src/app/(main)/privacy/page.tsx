import AnimatedSection from '@/components/AnimatedSection'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Ivory Vault collects, uses and protects your personal data. UK GDPR compliant.',
}

const SECTIONS: { title: string; content: string }[] = [
  {
    title: '1. Who we are',
    content: `Ivory Vault Competitions Ltd ("Ivory Vault", "we", "us", "our"), a company registered in England and Wales under company number 17244721 with its registered office at 68 Laburnum Crescent, Northampton, NN3 2LF, operates this prize-competition website and is the "data controller" responsible for your personal data. If you have any questions about this policy or how we handle your data, contact us at support@ivoryvaultcompetitions.co.uk.`,
  },
  {
    title: '2. The data we collect',
    content: `• Account details: your name, email address, mobile number and a securely hashed password.
• Entries & orders: the competitions you enter, ticket/spin quantities, and purchase records.
• Payment data: card payments are processed securely by Stripe. We do not see or store your full card details — only a payment reference.
• Site credit & rewards: your balance, tier and any prizes won.
• Support messages: anything you send us via the contact form.
• Usage data: with your consent, analytics cookies (Google Analytics) collect anonymised information about how you use the site.`,
  },
  {
    title: '3. How and why we use it (lawful bases)',
    content: `• To run your account and administer competitions, draws and prizes — necessary for our contract with you.
• To take payment and prevent fraud — our legitimate interests and legal obligations.
• To contact winners and provide customer support — contract and legitimate interests.
• To send analytics/marketing — only where you have given consent, which you can withdraw at any time.
We will never sell your personal data.`,
  },
  {
    title: '4. Cookies',
    content: `We use strictly-necessary cookies to keep you logged in and to run your basket — these do not require consent. We only set analytics cookies (Google Analytics) if you accept them via our cookie banner. You can change your choice at any time by clearing the site data in your browser.`,
  },
  {
    title: '5. Who we share it with',
    content: `We use trusted third-party processors to run the service: Stripe (payment processing), Resend (transactional email), Cloudinary (image hosting), Google Analytics (site analytics, with consent), and Vercel/Neon (website hosting and database). These providers only process your data on our instructions. Some may process data outside the UK/EEA under appropriate safeguards. We may also disclose data where required by law.`,
  },
  {
    title: '6. How long we keep it',
    content: `We keep your account and entry records for as long as your account is active and for a reasonable period afterwards to meet legal, accounting and fraud-prevention requirements. You can ask us to delete your account at any time (subject to any records we must retain by law).`,
  },
  {
    title: '7. Your rights',
    content: `Under UK GDPR you have the right to access, correct, delete or restrict processing of your personal data, to object to processing, to data portability, and to withdraw consent at any time. To exercise any of these, email support@ivoryvaultcompetitions.co.uk. You also have the right to complain to the Information Commissioner's Office (ICO) at ico.org.uk.`,
  },
  {
    title: '8. Security',
    content: `We protect your data with encryption in transit, hashed passwords, and access controls. No system is completely secure, but we take reasonable steps to safeguard your information and will notify you and the relevant authorities of any breach where legally required.`,
  },
  {
    title: '9. Children',
    content: `Our competitions and services are strictly for adults aged 18 or over. We do not knowingly collect data from anyone under 18. If you believe a minor has provided us with personal data, contact us and we will delete it.`,
  },
  {
    title: '10. Changes to this policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Please review it periodically.`,
  },
]

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, color: 'var(--ink)' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: '0.75rem' }}>Last updated: July 2026</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <AnimatedSection>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {SECTIONS.map(s => (
              <div key={s.title}>
                <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '0.75rem' }}>{s.title}</h2>
                <p style={{ fontSize: '0.9rem', color: '#5c524a', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.content}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
