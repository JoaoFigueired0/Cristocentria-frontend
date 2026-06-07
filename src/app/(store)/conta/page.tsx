import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth-helpers'
import { api } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { getInitials, formatBRL } from '@/lib/utils'
import { getStatusInfo } from '@/lib/order-status'
import { LogoutButton } from '@/components/ui/LogoutButton'

export const metadata: Metadata = { title: 'Minha Conta' }

export default async function ContaPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const { items: orders = [] } = await api.orders.byUser(1, 5).catch(() => ({ items: [] }))

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-4xl text-brand-black">MINHA CONTA</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-black text-xl font-bold text-white">
              {getInitials(session.user.name ?? session.user.email ?? 'U')}
            </div>
            <div>
              <p className="font-semibold text-brand-black">{session.user.name}</p>
              <p className="text-sm text-brand-muted">{session.user.email}</p>
            </div>
          </div>

          {/* Menu */}
          <nav className="mt-4" aria-label="Menu da conta">
            <ul className="flex flex-col divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
              {[
                { href: '/conta',               label: 'Pedidos' },
                { href: '/conta/dados',         label: 'Dados pessoais' },
                { href: '/conta/enderecos',     label: 'Endereços' },
                { href: '/conta/favoritos',     label: 'Favoritos' },
                { href: '/conta/alterar-senha', label: 'Alterar senha' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between px-4 py-3 text-sm text-brand-graphite hover:text-brand-black"
                  >
                    {item.label}
                    <svg className="h-3 w-3 text-brand-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
              {session.user.role === 'ADMIN' && (
                <li>
                  <Link
                    href="/admin"
                    className="flex items-center justify-between px-4 py-3 text-sm font-semibold text-brand-black hover:text-brand-graphite"
                  >
                    Área Administrativa
                    <svg className="h-3 w-3 text-brand-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              )}
              <li>
                <LogoutButton className="flex w-full items-center px-4 py-3 text-sm text-red-500 hover:text-red-700" />
              </li>
            </ul>
          </nav>
        </aside>

        {/* Conteúdo */}
        <div className="lg:col-span-3">
          <h2 className="mb-4 font-display text-2xl text-brand-black">PEDIDOS RECENTES</h2>

          {orders.length === 0 ? (
            <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
              <p className="text-brand-muted">Você ainda não realizou nenhum pedido.</p>
              <Link
                href="/colecao"
                className="mt-4 inline-block text-sm font-medium text-brand-black underline"
              >
                Ir para a loja
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                return (
                  <Link
                    key={order.id}
                    href={`/pedido/${order.orderNumber}`}
                    className="flex items-center justify-between rounded-xl border border-brand-border bg-white px-5 py-4 hover:border-brand-graphite"
                  >
                    <div>
                      <p className="font-medium text-brand-black">{order.orderNumber}</p>
                      <p className="text-sm text-brand-muted">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        {' · '}
                        {order._count.items} {order._count.items === 1 ? 'item' : 'itens'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-brand-black">
                        {formatBRL(Number(order.total))}
                      </span>
                      {statusInfo && (
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
