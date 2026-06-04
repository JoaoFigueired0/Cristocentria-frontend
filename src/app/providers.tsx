'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastContainer } from '@/components/ui/Toast'
import { StoreHydration } from '@/components/StoreHydration'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <StoreHydration />
      {children}
      <ToastContainer />
    </SessionProvider>
  )
}
