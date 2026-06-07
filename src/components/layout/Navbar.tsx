'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import { LogoMark } from './Logo'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/colecao', label: 'Coleção' },
  { href: '/colecao?category=camisetas', label: 'Camisetas' },
  { href: '/colecao?category=moletons', label: 'Moletons' },
]

export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const cartCount = useCartStore((s) => s.count())
  const openDrawer = useCartStore((s) => s.openDrawer)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fecha menu mobile no resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-brand-black transition-shadow duration-300',
        scrolled && 'shadow-lg shadow-black/20'
      )}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Início Cristocentria">
          <div className="flex items-center gap-2.5">
            <LogoMark size={36} />
            <span className="hidden font-display text-xl tracking-widest text-brand-white sm:block">
              CRISTOCENTRIA
            </span>
          </div>
        </Link>

        {/* Links desktop */}
        <ul className="hidden items-center gap-8 md:flex" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-brand-white/80 transition-colors hover:text-brand-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {/* Carrinho */}
          <button
            onClick={openDrawer}
            aria-label={`Carrinho — ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
            className="relative flex h-10 w-10 items-center justify-center rounded text-brand-white/80 hover:text-brand-white"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-beige text-[10px] font-bold text-brand-black"
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Admin — desktop */}
          {isAdmin && (
            <Link
              href="/admin"
              aria-label="Painel administrativo"
              className="hidden h-10 items-center justify-center rounded px-2 text-xs font-semibold uppercase tracking-widest text-brand-beige/80 transition-colors hover:text-brand-beige md:flex"
            >
              Admin
            </Link>
          )}

          {/* Minha conta — desktop */}
          <Link
            href="/conta"
            aria-label="Minha conta"
            className="hidden h-10 w-10 items-center justify-center rounded text-brand-white/80 transition-colors hover:text-brand-white md:flex"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          {/* Hamburger mobile */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded text-brand-white/80 hover:text-brand-white md:hidden"
          >
            <span className="flex h-5 w-5 flex-col items-center justify-center gap-1.5">
              <span className={cn('block h-0.5 w-5 bg-current transition-all', mobileOpen && 'translate-y-2 rotate-45')} />
              <span className={cn('block h-0.5 w-5 bg-current transition-all', mobileOpen && 'opacity-0')} />
              <span className={cn('block h-0.5 w-5 bg-current transition-all', mobileOpen && '-translate-y-2 -rotate-45')} />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-brand-black md:hidden">
          <ul className="container-page flex flex-col gap-0 py-2" role="list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-medium text-brand-white/80 hover:text-brand-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/conta"
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-brand-white/80 hover:text-brand-white"
              >
                Minha conta
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 text-sm font-semibold uppercase tracking-widest text-brand-beige/80 hover:text-brand-beige"
                >
                  Painel Admin
                </Link>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  )
}

function CartIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  )
}
