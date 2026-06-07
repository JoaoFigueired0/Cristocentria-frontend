import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/shop/CartDrawer'
import { auth } from '@/auth'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <>
      <Navbar isAdmin={isAdmin} />
      <main id="main-content">{children}</main>
      <Footer />
      <CartDrawer />
    </>
  )
}
