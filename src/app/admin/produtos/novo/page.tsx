import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { ProductForm } from '@/components/admin/ProductForm'

export const metadata: Metadata = { title: 'Novo Produto — Admin' }

export default async function NovoProdutoPage() {
  const categories = await api.categories.list().catch(() => [])

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/produtos"
          className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-black"
        >
          ← Produtos
        </Link>
        <span className="text-brand-border">/</span>
        <h1 className="font-display text-2xl text-brand-black">NOVO PRODUTO</h1>
      </div>

      <ProductForm
        mode="create"
        categories={categories ?? []}
      />
    </>
  )
}
