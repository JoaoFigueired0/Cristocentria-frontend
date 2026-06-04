import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { EstoqueFilters } from './EstoqueFilters'
import { StockAdjustClient } from './StockAdjustClient'

export const metadata: Metadata = { title: 'Estoque — Admin' }

const COLOR_DOT: Record<string, string> = {
  BLACK:    'bg-[#0A0A0A]',
  WHITE:    'bg-[#F8F6F1] border border-gray-300',
  GRAPHITE: 'bg-[#3A3A3A]',
  OFFWHITE: 'bg-[#EDE9E0]',
  BEIGE:    'bg-[#C9B99A]',
  OLIVE:    'bg-[#5C6645]',
  NAVY:     'bg-[#1C2B4A]',
  COFFEE:   'bg-[#6B4226]',
}

export default async function AdminEstoquePage({
  searchParams,
}: {
  searchParams: { productId?: string; lowStock?: string }
}) {
  const lowStock = searchParams.lowStock === 'true'

  const stockParams: Record<string, string> = {}
  if (searchParams.productId) stockParams.productId = searchParams.productId
  if (lowStock) stockParams.lowStock = 'true'

  const [variants, productsResult] = await Promise.all([
    api.admin.stock(stockParams).catch(() => []) as Promise<any[]>,
    api.admin.products({ pageSize: '200' })
      .then((r: any) => r?.items ?? [])
      .catch(() => []) as Promise<any[]>,
  ])

  const totalStock = (variants as any[]).reduce((s: number, v: any) => s + v.stock, 0)

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-brand-black">ESTOQUE</h1>
      </div>

      {/* Filtros — Client Component (usa onChange/useRouter) */}
      <Suspense fallback={null}>
        <EstoqueFilters
          products={productsResult}
          currentProductId={searchParams.productId ?? ''}
          currentLowStock={lowStock}
        />
      </Suspense>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-surface2">
              {['Produto', 'Cor', 'Tam.', 'SKU', 'Estoque', 'Ajustar'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold text-brand-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {(variants as any[]).map((v: any) => (
              <tr key={v.id} className={cn('hover:bg-brand-surface2', v.stock === 0 && 'bg-red-50')}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/produtos/${v.product.id}`}
                    className="text-brand-black hover:underline"
                  >
                    {v.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-4 w-4 shrink-0 rounded-full', COLOR_DOT[v.color] ?? 'bg-brand-muted')} />
                    <span className="text-brand-graphite">{v.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{v.size}</td>
                <td className="px-4 py-3 font-mono text-xs text-brand-muted">{v.sku}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold',
                    v.stock === 0
                      ? 'bg-red-100 text-red-600'
                      : v.stock <= 5
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-green-100 text-green-700'
                  )}>
                    {v.stock} un.
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StockAdjustClient variantId={v.id} currentStock={v.stock} />
                </td>
              </tr>
            ))}
            {(variants as any[]).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-brand-muted">
                  Nenhuma variante encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-brand-muted">
        {(variants as any[]).length} variantes · {totalStock} unidades no total
      </p>
    </>
  )
}
