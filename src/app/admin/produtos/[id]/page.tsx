import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Editar Produto — Admin' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarProdutoPage({ params }: PageProps) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    api.admin.productById(id),
    api.categories.list().catch(() => []),
  ])

  if (!product) notFound()

  const images = product.images as string[]

  const initialData = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription ?? '',
    description: product.description ?? '',
    basePrice: String(Number(product.basePrice)),
    pixPrice: String(Number(product.pixPrice)),
    badge: product.badge ?? '',
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId ?? '',
    images: images.length ? images : [''],
    variants: product.variants.map((v: any) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      stock: v.stock,
      sku: v.sku,
    })),
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-black"
          >
            ← Produtos
          </Link>
          <span className="text-brand-border">/</span>
          <h1 className="font-display text-2xl text-brand-black">EDITAR PRODUTO</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${product.isActive ? 'text-green-600' : 'text-red-500'}`}>
            {product.isActive ? '● Ativo' : '● Inativo'}
          </span>
          <a
            href={`/produto/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-navy underline"
          >
            Ver na loja ↗
          </a>
        </div>
      </div>

      <ProductForm
        mode="edit"
        productId={id}
        initialData={initialData}
        categories={categories ?? []}
      />
    </>
  )
}
