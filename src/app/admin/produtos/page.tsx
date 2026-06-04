import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api-client'
import { Badge } from '@/components/ui/Badge'
import { formatBRL } from '@/lib/utils'
import { DeleteProductButton } from './DeleteProductButton'

export const metadata: Metadata = { title: 'Produtos — Admin' }

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const sp = await searchParams
  const pageSize = 20
  const page = Math.max(1, Number(sp.page ?? 1))

  const params: Record<string, string> = { page: String(page), pageSize: String(pageSize) }
  if (sp.search) params.search = sp.search

  const { items: products = [], total = 0, totalPages = 1 } =
    await api.admin.products(params).catch(() => ({ items: [], total: 0, totalPages: 1 }))

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl text-brand-black">PRODUTOS</h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-brand-muted">{total} produto{total !== 1 ? 's' : ''}</p>
          <Link
            href="/admin/produtos/novo"
            className="rounded bg-brand-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-graphite"
          >
            + Novo Produto
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface2">
              {['Produto', 'Preço', 'Variantes', 'Reviews', 'Status', 'Atualizado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-brand-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-brand-muted">
                  Nenhum produto encontrado.
                </td>
              </tr>
            )}
            {products.map((p: any) => {
              const images = p.images as string[]
              const thumb = images[0] ?? null

              return (
                <tr key={p.id} className="hover:bg-brand-surface2">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* Miniatura — unoptimized para aceitar qualquer domínio */}
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-brand-surface2">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-brand-border">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-brand-black">{p.name}</p>
                        <p className="text-xs text-brand-muted">{p.slug}</p>
                        {p.badge && <Badge variant="dark" className="mt-0.5">{p.badge}</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{formatBRL(Number(p.basePrice))}</p>
                    <p className="text-xs text-brand-pix">PIX: {formatBRL(Number(p.pixPrice))}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-brand-graphite">{p._count.variants}</td>
                  <td className="px-4 py-3 text-center text-brand-graphite">{p._count.reviews}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${p.isActive ? 'text-green-600' : 'text-red-500'}`}>
                      {p.isActive ? '● Ativo' : '● Inativo'}
                    </span>
                    {p.isFeatured && (
                      <span className="ml-2 text-xs text-amber-500">★</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-brand-muted">
                    {new Date(p.updatedAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="text-xs text-brand-navy hover:underline"
                      >
                        Editar
                      </Link>
                      <span className="text-brand-border">·</span>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/produtos?page=${page - 1}`}
              className="rounded border border-brand-border px-3 py-1.5 text-sm hover:border-brand-black"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-brand-muted">Página {page} de {totalPages}</span>
          {page < totalPages && (
            <Link
              href={`/admin/produtos?page=${page + 1}`}
              className="rounded border border-brand-border px-3 py-1.5 text-sm hover:border-brand-black"
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </>
  )
}
