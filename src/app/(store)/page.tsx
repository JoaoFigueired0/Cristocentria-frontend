import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { ProductCard } from '@/components/ui/ProductCard'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Cristocentria — Roupas com Propósito',
  description: 'Camisetas e moletons que expressam fé. Qualidade premium, estilo autêntico.',
  openGraph: {
    images: [{ url: '/images/og-default.jpg' }],
  },
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    api.products.featured(8).catch(() => []),
    api.categories.list().catch(() => []),
  ])

  const activeCollections = categories ?? []

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-graphite"
        aria-label="Hero"
      >
        <span
          aria-hidden="true"
          className="absolute select-none font-display text-[30vw] font-bold leading-none text-white/5"
        >
          LS
        </span>

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        <div className="relative z-10 container-page flex flex-col items-center text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/70">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-beige" />
            {activeCollections[0]?.name ?? 'Coleção 01'}
          </span>

          <h1 className="font-display text-6xl leading-none tracking-wide text-white sm:text-7xl md:text-8xl lg:text-9xl">
            VISTA O
            <br />
            ESSENCIAL
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
            Peças que expressam fé sem abrir mão do estilo. Tecidos premium,
            estampas exclusivas e significado em cada detalhe.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/colecao"
              className="inline-flex h-12 items-center gap-2 rounded bg-white px-8 font-medium text-brand-black transition-opacity hover:opacity-90"
            >
              Comprar Agora
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/colecao"
              className="inline-flex h-12 items-center rounded border border-white/30 px-8 text-sm font-medium text-white transition-colors hover:border-white/60"
            >
              Ver coleção
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-white/30 pt-1.5">
            <div className="h-2 w-0.5 rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      {/* Nossas Coleções */}
      {activeCollections.length > 0 && (
        <section className="container-page py-16" aria-label="Nossas coleções">
          <SectionHeader title="NOSSAS COLEÇÕES" className="mb-10" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCollections.map((col: any) => (
              <Link
                key={col.id}
                href={`/colecao?category=${col.slug}`}
                className="group relative flex min-h-[200px] items-end overflow-hidden rounded-xl bg-brand-graphite p-6 transition-transform hover:scale-[1.02]"
              >
                {col.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={col.image}
                    alt={col.name}
                    className="absolute inset-0 h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative z-10">
                  <h3 className="font-display text-2xl tracking-wide text-white">{col.name.toUpperCase()}</h3>
                  {col.description && (
                    <p className="mt-1 text-sm text-white/70 line-clamp-2">{col.description}</p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-white/80 underline-offset-2 group-hover:underline">
                    Ver produtos
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Produtos em destaque / Novidades */}
      <section className="container-page py-20" aria-label="Produtos em destaque">
        <SectionHeader
          title="DESTAQUES"
          href="/colecao"
          className="mb-10"
        />

        <ProductGrid>
          {(products ?? []).map((p) => (
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
      </section>
    </>
  )
}
