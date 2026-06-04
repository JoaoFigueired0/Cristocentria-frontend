import type { Metadata } from 'next'
import Link from 'next/link'
import { ColecaoForm } from '../ColecaoForm'

export const metadata: Metadata = { title: 'Nova Coleção — Admin' }

export default function NovaColeçãoPage() {
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
        <h1 className="font-display text-2xl text-brand-black">NOVA COLEÇÃO</h1>
      </div>

      <ColecaoForm mode="create" />
    </>
  )
}
