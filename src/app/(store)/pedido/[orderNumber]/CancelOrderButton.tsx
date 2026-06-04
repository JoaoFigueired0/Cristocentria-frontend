'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  orderNumber: string
}

export function CancelOrderButton({ orderNumber }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCancel() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/orders/${orderNumber}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelado pelo cliente' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Não foi possível cancelar o pedido.')
        return
      }

      setOpen(false)
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

      {/* Modal de confirmação */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Cancelar pedido?</h2>
            <p className="mt-2 text-sm text-brand-graphite">
              Essa ação não pode ser desfeita. Se o pagamento já foi realizado, o vendedor será notificado para processar o reembolso.
            </p>

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
                ) : 'Sim, cancelar'}
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); setError('') }}
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
