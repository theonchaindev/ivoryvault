import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import GiveawayBanner from '@/components/GiveawayBanner'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="main-shell">
        <GiveawayBanner />
        {children}
      </main>
      <Footer />
    </>
  )
}
