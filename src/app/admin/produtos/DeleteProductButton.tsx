'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

type Modal = 'none' | 'confirm' | 'conflict'

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [modal, setModal] = useState<Modal>('none')
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleDelete() {
    setBusy(true)
    setErrorMsg('')
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })

      if (res.ok) {
        router.refresh()
        setModal('none')
        return
      }

      const data = await res.json().catch(() => ({}))

      if (res.status === 409) {
        setModal('conflict')
        return
      }

      setErrorMsg(data.error ?? `Erro ao excluir (${res.status})`)
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  async function handleArchive() {
    setBusy(true)
    setErrorMsg('')
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })

      if (res.ok) {
        router.refresh()
        setModal('none')
        return
      }

      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Erro ao arquivar produto.')
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  function close() {
    setModal('none')
    setErrorMsg('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModal('confirm')}
        disabled={busy}
        className="text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
        title={`Excluir ${productName}`}
      >
        Excluir
      </button>

      {/* Modal de confirmação */}
      {modal === 'confirm' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Excluir produto?</h2>
            <p className="mt-2 text-sm text-brand-graphite">
              <span className="font-semibold">{productName}</span> será removido permanentemente. Esta ação não pode ser desfeita.
            </p>
            {errorMsg && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {busy ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Excluindo...</>
                ) : 'Sim, excluir'}
              </button>
              <button type="button" onClick={close} className="flex-1 rounded-lg border border-brand-border py-2.5 text-sm text-brand-graphite hover:text-brand-black">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de conflito — produto tem pedidos */}
      {modal === 'conflict' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Não foi possível excluir</h2>
            <p className="mt-2 text-sm text-brand-graphite">
              <span className="font-semibold">{productName}</span> possui pedidos associados e não pode ser excluído.
            </p>
            <p className="mt-2 text-sm text-brand-muted">
              Você pode <span className="font-medium text-brand-graphite">arquivar</span> o produto — ele deixa de aparecer na loja, mas o histórico de pedidos é preservado.
            </p>
            {errorMsg && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleArchive}
                disabled={busy}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-black py-2.5 text-sm font-semibold text-white hover:opacity-80 disabled:opacity-50"
              >
                {busy ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Arquivando...</>
                ) : 'Arquivar produto'}
              </button>
              <button type="button" onClick={close} className="flex-1 rounded-lg border border-brand-border py-2.5 text-sm text-brand-graphite hover:text-brand-black">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
