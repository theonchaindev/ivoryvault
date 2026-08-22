import AnimatedSection from '@/components/AnimatedSection'

export const metadata = {
  title: 'Terms & Conditions — Ivory Vault',
  description: 'Ivory Vault competition terms and conditions. UK competition law compliant.',
}

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem' }}>Legal</p>
          <h1 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 600, color: 'var(--ink)' }}>
            Terms & Conditions
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: '0.75rem' }}>Last updated: August 2026</p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 6rem' }}>
        <AnimatedSection>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {[
              {
                title: '1. Company Information',
                content: `These terms and conditions ("Terms") govern all competitions operated by Ivory Vault Ltd ("Ivory Vault", "we", "us" or "our"), a company registered in England and Wales (Company registration number: [COMPANY NUMBER TO BE CONFIRMED]). Our registered office and business address is 68 Laburnum Crescent, Northampton, NN3 2LF, United Kingdom. You can contact us at any time by email at support@ivoryvaultcompetitions.co.uk. By entering any competition on this website you confirm that you have read, understood and agree to be bound by these Terms.`,
              },
              {
                title: '2. Eligibility',
                content: `Competitions are open to UK residents aged 18 or over only. Employees, directors and anyone directly involved in administering the competition are not eligible to enter. Ivory Vault reserves the right to verify the eligibility of any entrant or winner.`,
              },
              {
                title: '3. How to Enter',
                content: `To enter a competition, you may either: (a) purchase the required number of tickets online at the stated ticket price; or (b) enter for free by post using the Alternative Method of Entry (AMOE) set out on our Free Entry page. No purchase is necessary to enter.`,
              },
              {
                title: '4. Ticket Purchases',
                content: `All ticket purchases are final and non-refundable once a competition is live. Each ticket purchased is assigned a unique entry number. You may buy up to the number of tickets still available for each competition. Ivory Vault reserves the right to limit the total number of tickets per person.`,
              },
              {
                title: '5. Payments',
                content: `Ticket payments are processed securely by our payment provider, Cashflows. We accept Visa and Mastercard debit and credit cards, and — where available — Apple Pay and Google Pay. All prices are displayed and charged in pounds sterling (GBP). We do not store your full card details. Ticket purchases are final and non-refundable once a competition is live, except where required by law or where a competition is cancelled by us (in which case the entry fees paid for affected tickets will be refunded to the original payment method). Where we reasonably suspect fraudulent, unauthorised or abusive activity, we reserve the right to decline or reverse a payment and cancel the associated entries.`,
              },
              {
                title: '6. The Draw',
                content: `The draw will take place on the stated draw date, or when all tickets have been sold (whichever is sooner). Winners are selected at random using a verified random number generator. The draw is final and binding. Ivory Vault's decision is final in all matters relating to the competition.`,
              },
              {
                title: '7. Prizes',
                content: `Prizes are as described on each individual competition page. Prizes are non-transferable and no cash alternative will be offered unless specifically stated. Ivory Vault reserves the right to substitute a prize of equal or greater value in exceptional circumstances. Winners will be contacted within 24 hours of the draw. Physical prizes will be dispatched within 7 working days. Cash prizes will be transferred within 5 working days of identity verification.`,
              },
              {
                title: '8. Winners',
                content: `Winners may be required to provide proof of identity and age. Winners may be asked to take part in publicity material unless they have specifically opted out. Winner names (first name and last initial only) may be published on our website. Winners must claim their prize within 30 days of notification; unclaimed prizes may be redrawn.`,
              },
              {
                title: '9. Privacy & Data',
                content: `Personal information provided when entering competitions will be used solely for competition administration and, if you have consented, for marketing purposes. We will never sell your data to third parties. Full details are in our Privacy Policy.`,
              },
              {
                title: '10. Liability',
                content: `Ivory Vault accepts no responsibility for entries lost, delayed, or damaged. Ivory Vault's liability to entrants is limited to the face value of their ticket purchase. Nothing in these terms limits liability for death, personal injury, or fraud caused by our negligence.`,
              },
              {
                title: '11. Governing Law',
                content: `These terms and conditions are governed by English law and any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.`,
              },
              {
                title: '12. General',
                content: `Ivory Vault reserves the right to amend these terms at any time. By entering any competition, you agree to be bound by these terms and conditions. If any provision is found to be invalid, the remaining provisions will continue in full force and effect.`,
              },
            ].map(section => (
              <div key={section.title} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: '1.375rem',
                    fontWeight: 600,
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                  }}
                >
                  {section.title}
                </h2>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: '#5c524a' }}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
