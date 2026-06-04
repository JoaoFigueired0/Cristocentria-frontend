'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface EstoqueFiltersProps {
  products: { id: string; name: string }[]
  currentProductId: string
  currentLowStock: boolean
}

export function EstoqueFilters({
  products,
  currentProductId,
  currentLowStock,
}: EstoqueFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function navigate(key: string, value: string | null) {
    const sp = new URLSearchParams(searchParams.toString())
    if (value) sp.set(key, value)
    else sp.delete(key)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      {/* Filtro por produto */}
      <select
        value={currentProductId}
        onChange={(e) => navigate('productId', e.target.value || null)}
        className="rounded border border-brand-border bg-white px-3 py-2 text-sm"
      >
        <option value="">Todos os produtos</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {/* Filtro críticos */}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={currentLowStock}
          onChange={(e) => navigate('lowStock', e.target.checked ? 'true' : null)}
          className="accent-brand-navy"
        />
        Só críticos (≤ 5)
      </label>
    </div>
  )
}
