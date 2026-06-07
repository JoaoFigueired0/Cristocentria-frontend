import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { formatBRL } from '@/lib/utils'
import { getStatusInfo } from '@/lib/order-status'

export const metadata: Metadata = { title: 'Dashboard Admin' }
export const revalidate = 60

function StatusBadge({ status }: { status: string }) {
  const { label, variant } = getStatusInfo(status)
  return <Badge variant={variant}>{label}</Badge>
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-brand-black">{value}</p>
      {sub && <p className="mt-1 text-xs text-brand-muted">{sub}</p>}
    </div>
  )
}

export default async function AdminDashboard() {
  const data = await api.admin.dashboard().catch(() => ({
    revenue: { total: 0, averageTicket: 0, paidOrdersCount: 0 },
    ordersByStatus: [],
    recentOrders: [],
    stockAlerts: [],
  }))

  const { revenue, recentOrders, stockAlerts, ordersByStatus } = data
  const orderCount = ordersByStatus.reduce((s: number, x: any) => s + x.count, 0)

  return (
    <>
      <h1 className="mb-6 font-display text-3xl text-brand-black">DASHBOARD</h1>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Receita Total"
          value={formatBRL(Number(revenue.total ?? 0))}
          sub={`${revenue.paidOrdersCount} pedidos pagos`}
        />
        <StatCard
          label="Ticket Médio"
          value={formatBRL(Number(revenue.averageTicket ?? 0))}
        />
        <StatCard
          label="Total de Pedidos"
          value={String(orderCount)}
        />
        <StatCard
          label="Estoque Crítico"
          value={String(stockAlerts.length)}
          sub="variantes com ≤ 5 unidades"
        />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        {/* Pedidos recentes */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-brand-black">PEDIDOS RECENTES</h2>
            <Link href="/admin/pedidos" className="text-sm text-brand-muted hover:text-brand-black">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-surface2">
                  <th className="px-4 py-3 text-left font-semibold text-brand-black">Pedido</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-black">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-brand-black">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-brand-black">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-surface2">
                    <td className="px-4 py-3">
                      <Link href={`/pedido/${order.orderNumber}`} className="font-mono font-medium hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-brand-graphite">
                      {order.user?.name ?? order.guestName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatBRL(Number(order.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estoque crítico */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-brand-black">ESTOQUE CRÍTICO</h2>
            <Link href="/admin/estoque?lowStock=true" className="text-sm text-brand-muted hover:text-brand-black">
              Gerenciar →
            </Link>
          </div>
          <div className="rounded-xl border border-brand-border bg-white">
            {stockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <span className="mb-2 text-2xl">✓</span>
                <p className="text-sm font-medium text-green-600">Estoque normalizado</p>
                <p className="mt-1 text-xs text-brand-muted">Nenhuma variante abaixo do limite.</p>
              </div>
            ) : (
              <ul className="divide-y divide-brand-border">
                {stockAlerts.map((v: any) => (
                  <li key={v.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate text-sm font-medium text-brand-black">{v.product.name}</p>
                      <p className="text-xs text-brand-muted">
                        {v.color} · {v.size} · <span className="font-mono">{v.sku}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={[
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
                        v.stock === 0
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600',
                      ].join(' ')}>
                        {v.stock === 0 ? 'Sem estoque' : `${v.stock} un.`}
                      </span>
                      <Link
                        href={`/admin/estoque?productId=${v.product.id}`}
                        className="text-xs text-brand-navy hover:underline"
                      >
                        Ajustar
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
