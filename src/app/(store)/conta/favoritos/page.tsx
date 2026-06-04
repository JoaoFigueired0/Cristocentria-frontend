'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ContaSidebar } from '@/components/layout/ContaSidebar'
import { formatBRL } from '@/lib/utils'

interface WishlistProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  pixPrice: number
  images: string[]
  badge: string | null
  isActive: boolean
}

interface WishlistItem {
  id: string
  addedAt: string
  product: WishlistProduct
}

export default function FavoritosPage() {
  const { status } = useSession()
  const router = useRouter()

  const [items, setItems] = useState<WishlistItem[]>([])
  const [fetching, setFetching] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?callbackUrl=/conta/favoritos')
  }, [status, router])

  const load = useCallback(async () => {
    const res = await fetch('/api/wishlist')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    load().finally(() => setFetching(false))
  }, [status, load])

  async function handleRemove(productId: string) {
    setRemovingId(productId)
    try {
      await fetch(`/api/wishlist/${productId}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((i) => i.product.id !== productId))
    } finally {
      setRemovingId(null)
    }
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-black" />
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-4xl text-brand-black">MINHA CONTA</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        <ContaSidebar />

        <div className="lg:col-span-3">
          <h2 className="mb-6 font-display text-2xl text-brand-black">
            FAVORITOS{items.length > 0 && <span className="ml-2 text-lg text-brand-muted">({items.length})</span>}
          </h2>

          {items.length === 0 ? (
            <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-brand-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <p className="text-sm text-brand-muted">Nenhum produto nos favoritos ainda.</p>
              <Link
                href="/colecao"
                className="mt-4 inline-block text-sm font-medium text-brand-black underline"
              >
                Explorar coleção
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map(({ product }) => {
                const img = (product.images as string[])[0] ?? '/logo/icon-app.svg'
                const isExternal = img.startsWith('http')
                const inStock = product.isActive

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col rounded-xl border border-brand-border bg-white overflow-hidden"
                  >
                    {/* Imagem */}
                    <Link href={`/produto/${product.slug}`} className="relative block aspect-[3/4] bg-brand-surface overflow-hidden">
                      <Image
                        src={img}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized={isExternal}
                      />
                      {product.badge && (
                        <span className="absolute left-3 top-3 rounded bg-brand-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                          {product.badge}
                        </span>
                      )}
                      {!inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                          <span className="text-xs font-medium text-brand-muted">Indisponível</span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div className="flex-1">
                        <Link href={`/produto/${product.slug}`}>
                          <p className="text-sm font-semibold leading-snug text-brand-black hover:underline">
                            {product.name}
                          </p>
                        </Link>
                        <div className="mt-1.5 flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-brand-black">
                            {formatBRL(Number(product.pixPrice))}
                          </span>
                          <span className="text-xs text-green-600">no PIX</span>
                        </div>
                        {Number(product.basePrice) !== Number(product.pixPrice) && (
                          <p className="text-xs text-brand-muted line-through">
                            {formatBRL(Number(product.basePrice))}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/produto/${product.slug}`}
                          className="flex flex-1 items-center justify-center rounded-lg bg-brand-black py-2 text-xs font-semibold text-white transition-opacity hover:opacity-80"
                        >
                          Ver produto
                        </Link>
                        <button
                          onClick={() => handleRemove(product.id)}
                          disabled={removingId === product.id}
                          aria-label={`Remover ${product.name} dos favoritos`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border text-brand-muted transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                        >
                          {removingId === product.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-border border-t-brand-black" />
                          ) : (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
