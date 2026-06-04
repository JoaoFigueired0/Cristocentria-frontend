'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogoMark } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
  { href: '/admin/produtos', label: 'Produtos', icon: '👕' },
  { href: '/admin/colecoes', label: 'Coleções', icon: '🗂️' },
  { href: '/admin/estoque', label: 'Estoque', icon: '📋' },
]

interface AdminSidebarProps {
  email: string
}

export function AdminSidebar({ email }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Bloqueia scroll do body quando menu mobile está aberto
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const sidebarContent = (
    <div className="flex h-full flex-col bg-brand-navy">
      {/* Header da sidebar */}
      <div className="flex h-16 items-center justify-between gap-2.5 border-b border-white/10 px-5">
        <div className="flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="font-display text-sm tracking-widest text-white">ADMIN</span>
        </div>
        {/* Botão fechar — só no mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          className="flex h-8 w-8 items-center justify-center rounded text-white/60 hover:text-white lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-3 py-4" aria-label="Menu admin">
        {NAV.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-white/10 px-6 py-4">
        <p className="truncate text-xs text-white/40">{email}</p>
        <Link
          href="/api/auth/signout"
          className="mt-2 block text-xs text-white/40 hover:text-white/70"
        >
          Sair
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop: sidebar fixa ─────────────────────────────── */}
      <aside className="hidden w-60 shrink-0 lg:block">
        {sidebarContent}
      </aside>

      {/* ── Mobile: topbar + drawer ───────────────────────────── */}
      {/* Topbar */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-brand-navy px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <LogoMark size={28} />
          <span className="font-display text-sm tracking-widest text-white">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
          className="flex h-9 w-9 items-center justify-center rounded text-white/70 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Menu admin mobile"
      >
        {sidebarContent}
      </aside>
    </>
  )
}
