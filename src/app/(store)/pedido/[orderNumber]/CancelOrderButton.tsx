'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderNumber: string
}

const REASONS = [
  'Mudei de ideia',
  'Comprei por engano',
  'Encontrei preço melhor',
  'Demora na entrega',
  'Outro motivo',
]

export function CancelOrderButton({ orderNumber }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  function handleClose() {
    setOpen(false)
    setError('')
    setReason('')
    setCustomReason('')
  }

  async function handleCancel() {
    const finalReason = reason === 'Outro motivo' ? customReason.trim() : reason
    if (!finalReason) {
      setError('Selecione ou informe o motivo do cancelamento.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Não foi possível cancelar o pedido.')
        return
      }

      handleClose()
      router.refresh()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-full items-center justify-center rounded-lg border border-red-200 text-sm font-medium text-red-600 transition-colors hover:border-red-400 hover:bg-red-50"
      >
        Cancelar pedido
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Cancelar pedido?</h2>
            <p className="mt-1 text-sm text-brand-graphite">
              Essa ação não pode ser desfeita. Se o pagamento já foi realizado, o vendedor será notificado para processar o reembolso.
            </p>

            {/* Motivo */}
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">Motivo</p>
              <div className="flex flex-col gap-1.5">
                {REASONS.map((r) => (
                  <label key={r} className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="radio"
                      name="cancel-reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-brand-black"
                    />
                    <span className="text-sm text-brand-graphite">{r}</span>
                  </label>
                ))}
              </div>

              {reason === 'Outro motivo' && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Descreva o motivo..."
                  rows={3}
                  maxLength={300}
                  className="mt-1 w-full resize-none rounded-lg border border-brand-border px-3 py-2 text-sm text-brand-black placeholder:text-brand-muted focus:border-brand-black focus:outline-none"
                />
              )}
            </div>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Cancelando...
                  </>
                ) : 'Confirmar cancelamento'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-brand-border py-2.5 text-sm text-brand-graphite hover:text-brand-black"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
