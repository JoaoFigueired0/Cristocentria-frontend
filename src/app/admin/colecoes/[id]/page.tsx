import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ColecaoForm } from '../ColecaoForm'

export const metadata: Metadata = { title: 'Editar Coleção — Admin' }

export default async function EditarColeçãoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const collection = await api.admin.categories.byId(id)
  if (!collection) notFound()

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/colecoes"
          className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-black"
        >
          ← Coleções
        </Link>
        <span className="text-brand-border">/</span>
        <h1 className="font-display text-2xl text-brand-black">EDITAR COLEÇÃO</h1>
      </div>

      <ColecaoForm
        mode="edit"
        collectionId={id}
        initialData={{
          name: collection.name,
          slug: collection.slug,
          description: collection.description ?? '',
          image: collection.image ?? '',
          isActive: collection.isActive ?? false,
        }}
      />
    </>
  )
}
