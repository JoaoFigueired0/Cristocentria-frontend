import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { formatBRL } from '@/lib/utils'
import { ORDER_STATUS, getStatusInfo } from '@/lib/order-status'

export const metadata: Metadata = { title: 'Pedidos — Admin' }

type SearchParams = { status?: string; search?: string; page?: string }

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))
  const params: Record<string, string> = { page: String(page), pageSize: '20' }
  if (sp.status) params.status = sp.status
  if (sp.search) params.search = sp.search

  const { items: orders = [], total = 0, totalPages = 1 } =
    await api.admin.orders(params).catch(() => ({ items: [], total: 0, totalPages: 1 }))

  function buildHref(overrides: Partial<SearchParams>) {
    const qs = new URLSearchParams({ ...sp, ...overrides } as Record<string, string>)
    return `/admin/pedidos?${qs}`
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-brand-black">PEDIDOS</h1>
        <span className="text-sm text-brand-muted">{total} pedidos</span>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['', ...Object.keys(ORDER_STATUS)].map((s) => (
          <Link key={s} href={buildHref({ status: s || undefined, page: '1' })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              (sp.status === s || (!sp.status && !s))
                ? 'border-brand-black bg-brand-black text-white'
                : 'border-brand-border text-brand-graphite hover:border-brand-graphite'
            }`}>
            {s ? getStatusInfo(s).label : 'Todos'}
          </Link>
        ))}
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface2">
              {['Pedido', 'Cliente', 'Itens', 'Status', 'Pagamento', 'Total', 'Data', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-brand-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {orders.map((o) => {
              const si = getStatusInfo(o.status)
              const needsRefund = o.status === 'CANCELLED' && (o.notes as string)?.includes('REEMBOLSO')
              return (
                <tr key={o.id} className={`hover:bg-brand-surface2 ${needsRefund ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3 font-mono font-medium">
                    {o.orderNumber}
                    {needsRefund && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">⚠ REEMBOLSO</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-brand-graphite">
                    <div>{o.user?.name ?? o.guestName ?? '—'}</div>
                    <div className="text-xs text-brand-muted">{o.user?.email ?? o.guestEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-brand-graphite">{o._count.items}</td>
                  <td className="px-4 py-3">
                    <Badge variant={si.variant}>{si.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-brand-graphite">{o.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium">{formatBRL(Number(o.total))}</td>
                  <td className="px-4 py-3 text-brand-muted">
                    {new Date(o.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/pedido/${o.orderNumber}`}
                      className="text-xs text-brand-navy hover:underline">Ver →</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {page > 1 && <Link href={buildHref({ page: String(page - 1) })} className="rounded border border-brand-border px-3 py-1.5 text-sm hover:border-brand-black">← Anterior</Link>}
          <span className="text-sm text-brand-muted">Página {page} de {totalPages}</span>
          {page < totalPages && <Link href={buildHref({ page: String(page + 1) })} className="rounded border border-brand-border px-3 py-1.5 text-sm hover:border-brand-black">Próxima →</Link>}
        </div>
      )}
    </>
  )
}
