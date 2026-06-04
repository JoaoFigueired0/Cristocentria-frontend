import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { formatBRL } from '@/lib/utils'
import { ORDER_STATUS, getStatusInfo } from '@/lib/order-status'
import { CancelOrderButton } from './CancelOrderButton'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Detalhes do Pedido' }

const TIMELINE = [
  { label: 'Pedido recebido', key: 'createdAt' },
  { label: 'Confirmado',      key: 'paidAt' },
  { label: 'Enviado',         key: 'shippedAt' },
  { label: 'Entregue',        key: 'deliveredAt' },
]

const PAYMENT_LABELS: Record<string, string> = {
  PIX:         '⚡ PIX',
  CREDIT_CARD: '💳 Cartão de crédito',
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function Timeline({ status, order }: { status: string; order: Record<string, any> }) {
  const info = getStatusInfo(status)
  const cancelled = info.step === -1

  if (cancelled) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <p className="text-sm font-medium text-red-700">
          Este pedido foi <span className="font-semibold">{info.label.toLowerCase()}</span>.
          {(order.notes as string)?.includes('REEMBOLSO') && (
            <span className="ml-1">O reembolso está sendo processado.</span>
          )}
        </p>
        {order.notes && (
          <p className="mt-1 text-xs text-red-600 opacity-80">{order.notes as string}</p>
        )}
      </div>
    )
  }

  const currentStep = info.step

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-brand-muted">Acompanhamento</p>
      <ol className="relative flex items-start justify-between">
        {TIMELINE.map((step, i) => {
          const done = i <= currentStep
          const active = i === currentStep
          const date = order[step.key] as string | null

          return (
            <li key={step.key} className="flex flex-1 flex-col items-center gap-1.5">
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className={`absolute h-0.5 -z-10 transition-colors ${done ? 'bg-brand-black' : 'bg-brand-border'}`}
                  style={{ top: '14px', left: `${(i - 1) * 33.33 + 16.67}%`, width: '33.33%' }}
                />
              )}
              <div className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
                done ? 'border-brand-black bg-brand-black' : 'border-brand-border bg-white'
              }`}>
                {done && (
                  <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
              <span className={`text-center text-[11px] leading-tight ${active ? 'font-semibold text-brand-black' : done ? 'text-brand-graphite' : 'text-brand-muted'}`}>
                {step.label}
              </span>
              {date && (
                <time dateTime={new Date(date).toISOString()} className="text-[10px] text-brand-muted">
                  {new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </time>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function AddressBlock({ snapshot }: { snapshot: unknown }) {
  const addr = snapshot as Record<string, string>
  if (addr?.type === 'PICKUP_LOCAL') {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">Retirada</p>
        <p className="text-sm font-medium text-brand-black">📍 {addr.label}</p>
        {addr.address && <p className="mt-0.5 text-sm text-brand-graphite">{addr.address}</p>}
      </div>
    )
  }
  if (addr?.type === 'PICKUP_SELLER') {
    return (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">Retirada</p>
        <p className="text-sm font-medium text-brand-black">🤝 {addr.label}</p>
        {addr.note && <p className="mt-0.5 text-sm text-brand-graphite">{addr.note}</p>}
      </div>
    )
  }
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-muted">Endereço de entrega</p>
      <p className="text-sm font-semibold text-brand-black">{addr.recipientName}</p>
      <p className="mt-0.5 text-sm text-brand-graphite">{addr.street}, {addr.number}{addr.complement ? ` — ${addr.complement}` : ''}</p>
      <p className="text-sm text-brand-muted">{addr.neighborhood} · {addr.city}/{addr.state}</p>
      <p className="text-sm text-brand-muted">{addr.zipCode}</p>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function PedidoPage({ params }: { params: { orderNumber: string } }) {
  const order = await api.orders.byNumber(params.orderNumber).catch(() => null)
  if (!order) notFound()

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="container-page py-10">
      <Link href="/conta" className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-black">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Minha Conta
      </Link>

      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brand-black">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-brand-muted">
            {new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <Timeline status={order.status} order={order as Record<string, unknown>} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Itens + resumo */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="rounded-xl border border-brand-border bg-white">
            <div className="border-b border-brand-border px-5 py-4">
              <h2 className="font-display text-lg text-brand-black">ITENS DO PEDIDO</h2>
            </div>
            <ul className="divide-y divide-brand-border">
              {order.items.map((item: any) => {
                const snap = item.productSnapshot as Record<string, string>
                const img = snap.image ?? null
                const isExternal = img?.startsWith('http') ?? false
                return (
                  <li key={item.id} className="flex items-start gap-4 p-5">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-surface2">
                      {img ? (
                        <Image src={img} alt={snap.name ?? 'Produto'} fill className="object-cover" sizes="64px" unoptimized={isExternal} />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <svg className="h-6 w-6 text-brand-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        {item.product?.slug ? (
                          <Link href={`/produto/${item.product.slug}`} className="font-semibold text-brand-black hover:underline line-clamp-2">
                            {snap.name}
                          </Link>
                        ) : (
                          <p className="font-semibold text-brand-black line-clamp-2">{snap.name}</p>
                        )}
                        <p className="mt-1 text-sm text-brand-muted">
                          {snap.color && <span>{snap.color}</span>}
                          {snap.color && snap.size && <span> · </span>}
                          {snap.size && <span>Tam. {snap.size}</span>}
                        </p>
                        <p className="text-sm text-brand-muted">Qtd: {item.quantity} · {formatBRL(Number(item.unitPrice))} un.</p>
                      </div>
                      <p className="shrink-0 font-semibold text-brand-black">{formatBRL(Number(item.total))}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Resumo */}
          <div className="rounded-xl border border-brand-border bg-white p-5">
            <h2 className="mb-4 font-display text-lg text-brand-black">RESUMO</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Subtotal</dt>
                <dd className="font-medium">{formatBRL(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Frete</dt>
                <dd className={Number(order.shippingCost) === 0 ? 'font-medium text-green-600' : 'font-medium'}>
                  {Number(order.shippingCost) === 0 ? 'Grátis' : formatBRL(Number(order.shippingCost))}
                </dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between">
                  <dt className="text-green-700">Desconto</dt>
                  <dd className="font-medium text-green-700">−{formatBRL(Number(order.discount))}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-border pt-2.5 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatBRL(Number(order.total))}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Lateral */}
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-brand-border bg-white p-5">
            <AddressBlock snapshot={order.addressSnapshot} />
          </div>

          <div className="rounded-xl border border-brand-border bg-white p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">Pagamento</p>
            <p className="text-sm font-medium text-brand-black">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
            {order.paidAt && (
              <p className="mt-0.5 text-xs text-brand-muted">
                Confirmado em {new Date(order.paidAt).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {(order.trackingCode || order.shippingService) && (
            <div className="rounded-xl border border-brand-border bg-white p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-muted">Envio</p>
              {order.shippingService && <p className="text-sm font-medium text-brand-black">{order.shippingService}</p>}
              {order.trackingCode && (
                <p className="mt-1 font-mono text-sm text-brand-graphite">
                  <span className="text-brand-muted">Rastreio: </span>{order.trackingCode}
                </p>
              )}
            </div>
          )}

          {/* Cancelamento */}
          {statusInfo.cancellable && (
            <CancelOrderButton orderNumber={order.orderNumber} />
          )}

          <div className="flex flex-col gap-2">
            <Link href="/conta" className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-black text-sm font-semibold text-white hover:opacity-80">
              Meus pedidos
            </Link>
            <Link href="/colecao" className="flex h-10 w-full items-center justify-center rounded-lg border border-brand-border text-sm font-medium text-brand-graphite hover:text-brand-black">
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
