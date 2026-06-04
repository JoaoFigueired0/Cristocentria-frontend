import type { Metadata } from 'next'
import { Suspense } from 'react'
import { api } from '@/lib/api-client'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGrid, ProductGridSkeleton } from '@/components/ui/ProductGrid'
import { SortSelect } from '@/components/ui/SortSelect'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Coleção 01',
  description: 'Explore todos os produtos Cristocentria. Camisetas e moletons com propósito.',
}

const COLORS = [
  { value: '', label: 'Todos' },
  { value: 'BLACK', label: 'Preto' },
  { value: 'WHITE', label: 'Branco' },
  { value: 'GRAPHITE', label: 'Grafite' },
  { value: 'OFFWHITE', label: 'Off-white' },
  { value: 'BEIGE', label: 'Areia' },
  { value: 'OLIVE', label: 'Oliva' },
  { value: 'NAVY', label: 'Marinho' },
  { value: 'COFFEE', label: 'Café' },
]


type SearchParams = {
  color?: string
  size?: string
  sort?: string
  page?: string
  category?: string
}

export default async function ColecaoPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { color, size, sort = 'newest', page = '1', category } = searchParams

  const params: Record<string, string> = { page, sort }
  if (color) params.color = color
  if (size) params.size = size
  if (category) params.category = category
  if (sort === 'featured') params.featured = 'true'

  // Params sem cor para calcular quais cores têm produtos em estoque
  const paramsNoColor: Record<string, string> = { limit: '200', sort: 'newest' }
  if (category) paramsNoColor.category = category

  const [result, categories, allForColors] = await Promise.all([
    api.products.list(params).catch(() => ({ items: [], total: 0, totalPages: 0 })),
    api.categories.list().catch(() => []),
    api.products.list(paramsNoColor).catch(() => ({ items: [] })),
  ])

  const availableColors = new Set<string>(
    (allForColors?.items ?? []).flatMap((p: any) =>
      (p.variants ?? []).filter((v: any) => v.stock > 0).map((v: any) => v.color)
    )
  )

  const { items, total, totalPages } = result
  const currentPage = Number(page)

  function buildHref(overrides: Partial<SearchParams>) {
    const base: Record<string, string> = {}
    if (color) base.color = color
    if (size) base.size = size
    if (category) base.category = category
    if (sort !== 'newest') base.sort = sort
    if (page !== '1') base.page = page

    // Aplica overrides: valor undefined remove a chave, string vazia também
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === '') {
        delete base[k]
      } else {
        base[k] = v
      }
    }

    const sp = new URLSearchParams(base)
    const str = sp.toString()
    return `/colecao${str ? `?${str}` : ''}`
  }

  return (
    <div className="container-page py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-5xl tracking-wide text-brand-black">
          {category
            ? ((categories ?? []).find((c: any) => c.slug === category)?.name?.toUpperCase() ?? category.toUpperCase())
            : 'COLEÇÃO'}
        </h1>
        <p className="mt-2 text-sm text-brand-muted">{total} produto{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtros de categoria */}
      {(categories ?? []).length > 0 && (
        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrar por categoria">
          <a
            href={buildHref({ category: undefined, page: '1' })}
            aria-pressed={!category}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !category
                ? 'border-brand-black bg-brand-black text-white'
                : 'border-brand-border bg-white text-brand-graphite hover:border-brand-graphite'
            }`}
          >
            Todos
          </a>
          {(categories ?? []).map((cat: any) => (
            <a
              key={cat.id}
              href={buildHref({ category: cat.slug, page: '1' })}
              aria-pressed={category === cat.slug}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat.slug
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-brand-border bg-white text-brand-graphite hover:border-brand-graphite'
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>
      )}

      {/* Filtros de cor — só exibe cores com produtos em estoque */}
      {availableColors.size > 0 && (
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2" role="group" aria-label="Filtrar por cor">
          {COLORS.filter((c) => !c.value || availableColors.has(c.value)).map((c) => (
            <a
              key={c.value}
              href={buildHref({ color: c.value || undefined, page: '1' })}
              aria-pressed={color === c.value || (!color && !c.value)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                (color === c.value) || (!color && !c.value)
                  ? 'border-brand-black bg-brand-black text-white'
                  : 'border-brand-border bg-white text-brand-graphite hover:border-brand-graphite'
              }`}
            >
              {c.label}
            </a>
          ))}
        </div>
      )}

      {/* Ordenação */}
      <SortSelect
        currentSort={sort}
        currentParams={{ color, size, category }}
      />

      {/* Grid */}
      <Suspense fallback={<ProductGridSkeleton count={24} />}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <p className="text-lg font-display text-brand-black">NENHUM PRODUTO ENCONTRADO</p>
            <a href="/colecao" className="mt-4 text-sm text-brand-muted underline">
              Limpar filtros
            </a>
          </div>
        ) : (
          <ProductGrid>
            {items.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                basePrice={Number(p.basePrice)}
                pixPrice={Number(p.pixPrice)}
                images={p.images as string[]}
                badge={p.badge}
                isFeatured={p.isFeatured}
                variants={p.variants}
              />
            ))}
          </ProductGrid>
        )}
      </Suspense>

      {/* Paginação */}
      {totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Paginação">
          {currentPage > 1 && (
            <a
              href={buildHref({ page: String(currentPage - 1) })}
              className="flex h-9 items-center rounded border border-brand-border px-4 text-sm hover:border-brand-black"
            >
              ← Anterior
            </a>
          )}
          <span className="text-sm text-brand-muted">
            Página {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages && (
            <a
              href={buildHref({ page: String(currentPage + 1) })}
              className="flex h-9 items-center rounded border border-brand-border px-4 text-sm hover:border-brand-black"
            >
              Próxima →
            </a>
          )}
        </nav>
      )}
    </div>
  )
}
