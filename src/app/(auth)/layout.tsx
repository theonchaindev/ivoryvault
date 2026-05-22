import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
