import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { ReviewSection } from '@/components/shop/ReviewSection'
import { Accordion } from '@/components/shop/Accordion'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { Badge } from '@/components/ui/Badge'
import { ProductDetails } from '@/components/shop/ProductDetails'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await api.products.bySlug(slug)
  if (!product) return { title: 'Produto não encontrado' }

  const images = product.images as string[]
  return {
    title: product.name,
    description:
      product.shortDescription ??
      product.description?.slice(0, 160) ??
      'Produto Cristocentria',
    openGraph: {
      images: images[0] ? [{ url: images[0] }] : [],
    },
  }
}

function StarsSummary({ rating, count }: { rating: number; count: number }) {
  if (count === 0) return null
  const full = Math.floor(rating)
  const half = rating - full >= 0.5

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} de 5 estrelas`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${star <= full ? 'text-amber-400' : star === full + 1 && half ? 'text-amber-300' : 'text-brand-border'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <a
        href="#avaliacoes"
        className="text-xs text-brand-muted hover:text-brand-black hover:underline"
      >
        {count} {count === 1 ? 'avaliação' : 'avaliações'}
      </a>
    </div>
  )
}

export default async function ProdutoPage({ params }: PageProps) {
  const { slug } = await params
  const product = await api.products.bySlug(slug)
  if (!product) notFound()

  const images = product.images as string[]
  const basePrice = Number(product.basePrice)
  const pixPrice = Number(product.pixPrice)

  const stockMap: Record<string, number> = {}
  for (const v of product.variants) {
    stockMap[`${v.color}_${v.size}`] = v.stock
  }

  const availableColors = Array.from(new Set<string>(
    product.variants.filter((v: any) => v.stock > 0).map((v: any) => v.color as string)
  ))

  const reviewCount = product._count.reviews
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
      : 0

  // Apenas o accordion de Descrição (guia de medidas fica no modal via ProductDetails)
  const accordionItems = [
    {
      title: 'Descrição',
      content: (
        <p className="whitespace-pre-line">{product.description ?? 'Em breve.'}</p>
      ),
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    brand: { '@type': 'Brand', name: 'Cristocentria' },
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating.toFixed(1),
        reviewCount,
      },
    }),
    offers: {
      '@type': 'Offer',
      price: pixPrice,
      priceCurrency: 'BRL',
      availability:
        product.variants.some((v: any) => v.stock > 0)
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>') }}
      />

      <div className="container-page py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Galeria */}
          <ProductGallery images={images} alt={product.name} />

          {/* Info + interações */}
          <div className="flex flex-col gap-6">
            <div>
              {product.badge && (
                <Badge variant="dark" className="mb-2">{product.badge}</Badge>
              )}
              <h1 className="font-display text-4xl leading-tight tracking-wide text-brand-black">
                {product.name.toUpperCase()}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-sm text-brand-graphite">{product.shortDescription}</p>
              )}
              {/* Resumo de avaliações inline */}
              <div className="mt-2">
                <StarsSummary rating={averageRating} count={reviewCount} />
              </div>
            </div>

            <PriceDisplay basePrice={basePrice} pixPrice={pixPrice} size="lg" />

            {/* Seletores + botões (Client Component — inclui Guia de Medidas modal) */}
            <ProductDetails
              productId={product.id}
              productName={product.name}
              basePrice={basePrice}
              pixPrice={pixPrice}
              variants={product.variants.map((v: any) => ({
                id: v.id,
                color: v.color,
                size: v.size,
                stock: v.stock,
                sku: v.sku,
              }))}
              availableColors={availableColors}
              images={images}
            />

            {/* Accordion — somente Descrição */}
            <div className="border-t border-brand-border pt-4">
              <Accordion items={accordionItems} />
            </div>
          </div>
        </div>

        {/* Avaliações — dinâmico com abas */}
        <section id="avaliacoes" className="mt-16 border-t border-brand-border pt-12">
          <h2 className="mb-8 font-display text-3xl tracking-wide text-brand-black">
            AVALIAÇÕES
          </h2>
          <ReviewSection
            productId={product.id}
            initialData={{
              items: product.reviews.map((r: any) => ({
                id: r.id,
                rating: r.rating,
                title: r.title ?? null,
                body: r.body ?? null,
                isVerified: r.isVerified,
                createdAt: r.createdAt,
                user: r.user,
              })),
              averageRating,
              reviewCount,
            }}
          />
        </section>
      </div>
    </>
  )
}
