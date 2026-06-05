'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'

interface ColecaoFormProps {
  mode: 'create' | 'edit'
  collectionId?: string
  initialData?: {
    name: string
    slug: string
    description: string
    image: string
    isActive: boolean
  }
}

const DEFAULT = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
}

const inputCls =
  'w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-black placeholder-brand-muted focus:border-brand-black focus:outline-none'

export function ColecaoForm({ mode, collectionId, initialData }: ColecaoFormProps) {
  const router = useRouter()
  const d = initialData ?? DEFAULT

  const [name, setName] = useState(d.name)
  const [slug, setSlug] = useState(d.slug)
  const [description, setDescription] = useState(d.description)
  const [image, setImage] = useState(d.image)
  const [isActive, setIsActive] = useState(d.isActive)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(val: string) {
    setName(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const url =
        mode === 'create'
          ? '/api/admin/categories'
          : `/api/admin/categories/${collectionId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          image: image.trim() || null,
          isActive,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Erro ${res.status}`)
        return
      }

      router.push('/admin/colecoes')
      router.refresh()
    } catch {
      setError('Erro ao salvar. Verifique sua conexão.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!collectionId) return
    if (!confirm('Excluir esta coleção? Os produtos vinculados perderão a categoria.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/categories/${collectionId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Erro ${res.status}`)
        return
      }
      router.push('/admin/colecoes')
      router.refresh()
    } catch {
      setError('Erro ao excluir.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-brand-border bg-white p-5 space-y-4">
        <h2 className="font-display text-lg tracking-wide text-brand-black border-b border-brand-border pb-3">
          INFORMAÇÕES
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-black">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className={inputCls}
              placeholder="Ex: Camisetas"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-black">
              Slug *{' '}
              <span className="text-xs font-normal text-brand-muted">— URL amigável</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              pattern="^[a-z0-9\-]+$"
              className={inputCls}
              placeholder="camisetas"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-black">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className={`${inputCls} resize-y`}
            placeholder="Breve descrição da coleção"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-brand-black">
            URL da Imagem{' '}
            <span className="text-xs font-normal text-brand-muted">— aparece na home</span>
          </label>
          <input
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className={inputCls}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-brand-border p-3">
          <div>
            <p className="text-sm font-medium text-brand-black">Coleção ativa</p>
            <p className="text-xs text-brand-muted">Aparece na loja e na home</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={[
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
              'border-2 border-transparent transition-colors duration-200',
              isActive ? 'bg-brand-black' : 'bg-brand-border',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={[
                'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow',
                'ring-0 transition-transform duration-200',
                isActive ? 'translate-x-5' : 'translate-x-0',
              ].join(' ')}
            />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-10 items-center gap-2 rounded bg-brand-black px-6 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : mode === 'create' ? 'Criar Coleção' : 'Salvar Alterações'}
        </button>

        {mode === 'edit' && collectionId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex h-10 items-center gap-2 rounded border border-red-200 px-4 text-sm font-medium text-red-500 hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Excluindo...' : 'Excluir coleção'}
          </button>
        )}

        <a
          href="/admin/colecoes"
          className="text-xs text-brand-muted hover:text-brand-black"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
