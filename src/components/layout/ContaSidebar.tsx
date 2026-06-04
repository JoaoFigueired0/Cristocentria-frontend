'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { getInitials } from '@/lib/utils'

const MENU = [
  { href: '/conta',               label: 'Pedidos' },
  { href: '/conta/dados',         label: 'Dados pessoais' },
  { href: '/conta/enderecos',     label: 'Endereços' },
  { href: '/conta/favoritos',     label: 'Favoritos' },
  { href: '/conta/alterar-senha', label: 'Alterar senha' },
]

export function ContaSidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const user = session?.user

  return (
    <aside className="lg:col-span-1">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-black text-xl font-bold text-white">
          {getInitials(user?.name ?? user?.email ?? 'U')}
        </div>
        <div>
          <p className="font-semibold text-brand-black">{user?.name}</p>
          <p className="text-sm text-brand-muted">{user?.email}</p>
        </div>
      </div>

      <nav className="mt-4" aria-label="Menu da conta">
        <ul className="flex flex-col divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
          {MENU.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:text-brand-black ${
                  pathname === item.href
                    ? 'font-medium text-brand-black'
                    : 'text-brand-graphite'
                }`}
              >
                {item.label}
                <svg className="h-3 w-3 text-brand-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
