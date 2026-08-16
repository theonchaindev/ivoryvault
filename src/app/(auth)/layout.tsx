import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SiteAlert from '@/components/SiteAlert'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteAlert />
      <Navbar />
      <main style={{ paddingTop: 'calc(72px + var(--banner-h, 0px))', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
