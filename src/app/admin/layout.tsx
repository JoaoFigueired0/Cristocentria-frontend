import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-helpers'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user || (session.user.role as string) !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={session.user.email ?? ''} />

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto bg-brand-surface">
        {/* Espaço para a topbar fixa no mobile */}
        <div className="pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </main>
    </div>
  )
}
