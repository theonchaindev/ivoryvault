import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SiteAlert from '@/components/SiteAlert'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteAlert />
      <Navbar />
      <main className="main-shell">{children}</main>
      <Footer />
    </>
  )
}
