'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

type Modal = 'none' | 'options' | 'confirm-delete'

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [modal, setModal] = useState<Modal>('none')
  const [busy, setBusy] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

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
        setErrorMsg('Este produto possui pedidos e não pode ser excluído permanentemente. Use "Arquivar" em vez disso.')
        setModal('options')
      } else {
        setErrorMsg(data.error ?? `Erro ao excluir (${res.status})`)
      }
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
        onClick={() => setModal('options')}
        disabled={busy}
        className="text-xs text-red-400 transition-colors hover:text-red-600 disabled:opacity-40"
        title={`Remover ${productName}`}
      >
        Excluir
      </button>

      {/* Modal principal — Arquivar ou Excluir */}
      {modal === 'options' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Remover produto</h2>
            <p className="mt-1 text-sm text-brand-graphite">
              O que deseja fazer com <span className="font-semibold">{productName}</span>?
            </p>

            {errorMsg && (
              <p className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{errorMsg}</p>
            )}

            <div className="mt-5 space-y-3">
              {/* Opção recomendada: Arquivar */}
              <button
                type="button"
                onClick={handleArchive}
                disabled={busy}
                className="flex w-full items-center justify-between rounded-lg border border-brand-border px-4 py-3 text-left transition-colors hover:border-brand-black hover:bg-brand-surface2 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-semibold text-brand-black">Arquivar produto</p>
                  <p className="text-xs text-brand-muted">Remove da loja · Histórico de pedidos preservado</p>
                </div>
                {busy ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-black border-t-transparent" />
                ) : (
                  <span className="rounded bg-brand-surface2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-brand-graphite">Seguro</span>
                )}
              </button>

              {/* Opção secundária: Excluir permanentemente */}
              <button
                type="button"
                onClick={() => { setErrorMsg(''); setModal('confirm-delete') }}
                disabled={busy}
                className="flex w-full items-center justify-between rounded-lg border border-red-100 px-4 py-3 text-left transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-semibold text-red-600">Excluir permanentemente</p>
                  <p className="text-xs text-red-400">Só funciona se não houver pedidos associados</p>
                </div>
              </button>
            </div>

            <button type="button" onClick={close} className="mt-4 w-full text-sm text-brand-muted hover:text-brand-black">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmação do delete permanente */}
      {modal === 'confirm-delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-display text-xl text-brand-black">Excluir permanentemente?</h2>
            <p className="mt-2 text-sm text-brand-graphite">
              <span className="font-semibold">{productName}</span> será removido definitivamente. Esta ação não pode ser desfeita.
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
              <button type="button" onClick={() => setModal('options')} className="flex-1 rounded-lg border border-brand-border py-2.5 text-sm text-brand-graphite hover:text-brand-black">
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
