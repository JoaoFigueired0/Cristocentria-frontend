import type { Metadata } from 'next'
import Link from 'next/link'
import { api } from '@/lib/api-client'

export const metadata: Metadata = { title: 'Coleções — Admin' }

export default async function ColecoesPage() {
  const collections = await api.admin.categories.list().catch(() => [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-brand-black">COLEÇÕES</h1>
        <Link
          href="/admin/colecoes/nova"
          className="inline-flex h-9 items-center gap-2 rounded bg-brand-black px-4 text-sm font-medium text-white hover:opacity-80"
        >
          + Nova Coleção
        </Link>
      </div>

      {(!collections || collections.length === 0) ? (
        <div className="rounded-xl border border-dashed border-brand-border bg-white p-12 text-center">
          <p className="font-display text-lg text-brand-black">NENHUMA COLEÇÃO CADASTRADA</p>
          <p className="mt-1 text-sm text-brand-muted">Crie a primeira coleção para ela aparecer na loja</p>
          <Link
            href="/admin/colecoes/nova"
            className="mt-4 inline-flex h-9 items-center gap-2 rounded bg-brand-black px-4 text-sm font-medium text-white hover:opacity-80"
          >
            + Nova Coleção
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border bg-brand-surface2">
                <th className="px-4 py-3 text-left font-semibold text-brand-black">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-brand-black">Slug</th>
                <th className="px-4 py-3 text-center font-semibold text-brand-black">Produtos</th>
                <th className="px-4 py-3 text-center font-semibold text-brand-black">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {collections.map((col: any) => (
                <tr key={col.id} className="hover:bg-brand-surface2">
                  <td className="px-4 py-3 font-medium text-brand-black">{col.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-brand-muted">{col.slug}</td>
                  <td className="px-4 py-3 text-center text-brand-muted">{col._count?.products ?? 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      col.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-brand-surface2 text-brand-muted'
                    }`}>
                      {col.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/colecoes/${col.id}`}
                      className="text-xs text-brand-navy hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
