import HowItWorks from '@/components/HowItWorks'
import HowItWorksClient from './HowItWorksClient'
import Link from 'next/link'

export const metadata = {
  title: 'How It Works — Ivory Vault',
  description: 'Learn how Ivory Vault competitions work. UK competition law compliant, transparent draws, and real prizes.',
}

const faqs = [
  { q: 'Are these competitions legal in the UK?', a: 'Yes. All Ivory Vault competitions are operated in full compliance with UK competition law. A free entry route (postal entry) is always available, ensuring no purchase is necessary to enter.' },
  { q: 'How are winners selected?', a: "Winners are selected using a verified random number generator. The entire process is recorded and can be audited. Every ticket holder's entry is logged immutably in our system." },
  { q: 'When will I receive my prize?', a: 'Winners are contacted within 24 hours of the draw. Physical prizes are dispatched within 7 working days. Cash prizes are transferred within 5 working days.' },
  { q: 'Can I enter multiple times?', a: 'Yes — purchasing more tickets increases your chances. You can buy up to 50 tickets per transaction, and multiple transactions are permitted.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit and debit cards, Apple Pay, and Google Pay. All payments are processed securely by Stripe.' },
  { q: 'What is the free entry route?', a: 'To comply with UK law, a free postal entry route is available for every competition. See our Free Entry page for full instructions on how to enter without purchase.' },
  { q: "What happens if a competition doesn't sell out?", a: 'If a competition reaches its draw date without selling all tickets, the draw proceeds normally with the tickets already sold. The competition is never cancelled.' },
  { q: "How will I know if I've won?", a: "Winners are notified by email and phone. We also publish winner announcements (with consent) on our Winners page and social media." },
]

const compliance = [
  'All competitions are operated under UK law as skill-based or prize competitions.',
  'A free alternative method of entry (AMOE) is available for every competition.',
  'No purchase is required to enter. Ticket purchases do not increase mathematical advantage over free entries when factored against the free entry pool.',
  "We comply with the Gambling Commission's guidance on promotional competitions.",
  'All participants must be 18 years of age or older.',
  'Ivory Vault reserves the right to request proof of age and identity from any winner.',
]

export default function HowItWorksPage() {
  return (
    <HowItWorksClient faqs={faqs} compliance={compliance}>
      <HowItWorks />
    </HowItWorksClient>
  )
}
