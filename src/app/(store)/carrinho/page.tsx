'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import { Button } from '@/components/ui/Button'
import { formatBRL, pixDiscount } from '@/lib/utils'

export default function CarrinhoPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore((s) => s.subtotal())
  const pixSubtotal = useCartStore((s) => s.pixSubtotal())
  const addToast = useToastStore((s) => s.add)

  const [loadingItem, setLoadingItem] = useState<string | null>(null)

  const freeShippingThreshold = 199
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : 18.9
  const piDiscount = pixDiscount(subtotal, pixSubtotal)
  const total = subtotal + shippingCost

  async function handleRemove(variantId: string, itemId: string) {
    setLoadingItem(variantId)
    try {
      await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE' })
      removeItem(variantId)
    } catch {
      addToast('Erro ao remover item', 'error')
    } finally {
      setLoadingItem(null)
    }
  }

  async function handleQtyChange(variantId: string, itemId: string, qty: number) {
    if (qty < 1) return handleRemove(variantId, itemId)
    setLoadingItem(variantId)
    try {
      await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty }),
      })
      updateQuantity(variantId, qty)
    } catch {
      addToast('Erro ao atualizar quantidade', 'error')
    } finally {
      setLoadingItem(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 text-6xl">🛒</div>
        <h1 className="font-display text-3xl text-brand-black">SEU CARRINHO ESTÁ VAZIO</h1>
        <p className="mt-2 text-brand-muted">Adicione produtos para continuar.</p>
        <Button variant="primary" size="lg" className="mt-8" asChild>
          <Link href="/colecao">Ver coleção</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-4xl text-brand-black">CARRINHO</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Itens */}
        <div className="lg:col-span-2">
          <ul className="divide-y divide-brand-border">
            {items.map((item) => (
              <li key={item.variantId} className="flex gap-4 py-5">
                {/* Imagem */}
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-surface2">
                  <Image
                    src={item.product.images[0] ?? '/images/placeholder.jpg'}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col justify-between gap-1">
                  <div>
                    <Link
                      href={`/produto/${item.product.slug}`}
                      className="font-medium text-brand-black hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-brand-muted">
                      {item.variant.color} — {item.variant.size}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Qty */}
                    <div className="flex items-center rounded border border-brand-border">
                      <button
                        onClick={() => handleQtyChange(item.variantId, item.id, item.quantity - 1)}
                        disabled={loadingItem === item.variantId}
                        aria-label="Diminuir quantidade"
                        className="flex h-8 w-8 items-center justify-center text-brand-graphite hover:bg-brand-surface2 disabled:opacity-50"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(item.variantId, item.id, item.quantity + 1)}
                        disabled={loadingItem === item.variantId || item.quantity >= item.variant.stock}
                        aria-label="Aumentar quantidade"
                        className="flex h-8 w-8 items-center justify-center text-brand-graphite hover:bg-brand-surface2 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    {/* Preço + remover */}
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-brand-black">
                        {formatBRL(item.product.basePrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemove(item.variantId, item.id)}
                        disabled={loadingItem === item.variantId}
                        aria-label={`Remover ${item.product.name}`}
                        className="text-brand-muted hover:text-red-500 disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                          <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/colecao" className="mt-4 inline-block text-sm text-brand-muted hover:text-brand-black">
            ← Continuar comprando
          </Link>
        </div>

        {/* Resumo */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-xl border border-brand-border bg-white p-6">
            <h2 className="font-display text-xl text-brand-black">RESUMO DO PEDIDO</h2>

            {/* Banner PIX */}
            {piDiscount > 0 && (
              <div className="mt-4 rounded-lg bg-brand-pix/10 p-3 text-sm">
                <p className="font-medium text-green-700">
                  💰 Pague via PIX e economize {formatBRL(piDiscount)}
                </p>
              </div>
            )}

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Subtotal</dt>
                <dd className="font-medium">{formatBRL(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-brand-graphite">Frete</dt>
                <dd className={shippingCost === 0 ? 'font-medium text-brand-pix' : 'font-medium'}>
                  {shippingCost === 0 ? 'Grátis' : formatBRL(shippingCost)}
                </dd>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-brand-muted">
                  Frete grátis a partir de {formatBRL(freeShippingThreshold)}
                </p>
              )}
              <div className="flex justify-between border-t border-brand-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatBRL(total)}</dd>
              </div>
            </dl>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-6"
              asChild
            >
              <Link href="/checkout">Finalizar Compra →</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
