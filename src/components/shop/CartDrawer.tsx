'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { cn } from '@/lib/utils'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isDrawerOpen)
  const close = useCartStore((s) => s.closeDrawer)
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore((s) => s.subtotal())
  const pixSubtotal = useCartStore((s) => s.pixSubtotal())

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />

      {/* Drawer */}
      <aside
        aria-label="Carrinho de compras"
        aria-modal="true"
        role="dialog"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="font-display text-xl tracking-wide text-brand-black">CARRINHO</h2>
          <button
            onClick={close}
            aria-label="Fechar carrinho"
            className="flex h-9 w-9 items-center justify-center rounded text-brand-graphite hover:text-brand-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg className="h-12 w-12 text-brand-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="mt-4 font-display text-lg text-brand-black">CARRINHO VAZIO</p>
              <p className="mt-1 text-sm text-brand-muted">Adicione produtos para continuar</p>
              <Link
                href="/colecao"
                onClick={close}
                className="mt-6 inline-flex h-10 items-center rounded bg-brand-black px-6 text-sm font-medium text-white hover:opacity-80"
              >
                Ver coleção
              </Link>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => {
                const img = item.product.images[0] ?? '/logo/icon-app.svg'
                const isExternal = img.startsWith('http')
                return (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded bg-brand-surface2">
                      <Image
                        src={img}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={isExternal}
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <p className="truncate text-sm font-medium text-brand-black">{item.product.name}</p>
                      <p className="text-xs text-brand-muted">{item.variant.color} · {item.variant.size}</p>

                      <div className="mt-auto flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-brand-border text-sm leading-none hover:border-brand-black"
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-brand-border text-sm leading-none hover:border-brand-black"
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>

                        <p className="text-sm font-semibold text-brand-black">
                          {(item.product.basePrice * item.quantity).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remover ${item.product.name}`}
                      className="self-start mt-0.5 text-brand-muted hover:text-brand-black"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-border px-5 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Subtotal</span>
              <span className="font-medium text-brand-black">
                {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Preço PIX</span>
              <span className="font-semibold text-green-600">
                {pixSubtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={close}
              className="flex w-full items-center justify-center gap-2 rounded bg-brand-black py-3 text-sm font-medium text-white transition-opacity hover:opacity-80"
            >
              Finalizar compra
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <button
              onClick={close}
              className="w-full rounded border border-brand-border py-2 text-sm text-brand-muted hover:text-brand-black"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
