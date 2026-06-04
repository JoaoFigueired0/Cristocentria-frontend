'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StockAdjustClientProps {
  variantId: string
  currentStock: number
}

export function StockAdjustClient({ variantId, currentStock }: StockAdjustClientProps) {
  const [stock, setStock] = useState(currentStock)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle')
  const router = useRouter()

  async function handleSave() {
    if (stock < 0) return
    setSaving(true)
    setStatus('idle')

    try {
      const res = await fetch(`/api/admin/stock/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStock: stock,
          reason: reason.trim() || 'Ajuste manual',
        }),
      })

      if (res.ok) {
        setStatus('ok')
        setReason('')
        router.refresh()
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setStatus('err')
      }
    } catch {
      setStatus('err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={stock}
        min={0}
        onChange={(e) => { setStatus('idle'); setStock(Number(e.target.value)) }}
        className="w-16 rounded border border-brand-border px-2 py-1 text-center text-sm focus:border-brand-black focus:outline-none"
        aria-label="Quantidade em estoque"
      />
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Motivo (opcional)"
        className="w-28 rounded border border-brand-border px-2 py-1 text-xs focus:border-brand-black focus:outline-none"
        aria-label="Motivo do ajuste"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded bg-brand-navy px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? '...' : 'Salvar'}
      </button>

      {status === 'ok' && (
        <span className="text-xs font-medium text-green-600">✓ Salvo</span>
      )}
      {status === 'err' && (
        <span className="text-xs font-medium text-red-500">Erro</span>
      )}
    </div>
  )
}
