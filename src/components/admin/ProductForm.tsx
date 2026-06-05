'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { slugify } from '@/lib/utils'

const COLORS = ['BLACK', 'WHITE', 'GRAPHITE', 'OFFWHITE', 'BEIGE', 'OLIVE', 'NAVY', 'COFFEE'] as const
const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XGG'] as const

const COLOR_LABELS: Record<string, string> = {
  BLACK: 'Preto', WHITE: 'Branco', GRAPHITE: 'Grafite',
  OFFWHITE: 'Off-white', BEIGE: 'Areia', OLIVE: 'Oliva',
  NAVY: 'Marinho', COFFEE: 'Café',
}

type Variant = {
  id?: string
  color: string
  size: string
  stock: number
  sku: string
}

type Category = { id: string; name: string; slug: string }

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initialData?: {
    name: string
    slug: string
    shortDescription: string
    description: string
    basePrice: string
    pixPrice: string
    badge: string
    isActive: boolean
    isFeatured: boolean
    categoryId: string
    images: string[]
    variants: Variant[]
  }
  categories: Category[]
}

const DEFAULT_DATA = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  basePrice: '',
  pixPrice: '',
  badge: '',
  isActive: true,
  isFeatured: false,
  categoryId: '',
  images: [''],
  variants: [] as Variant[],
}

export function ProductForm({ mode, productId, initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const data = initialData ?? DEFAULT_DATA

  const [name, setName] = useState(data.name)
  const [slug, setSlug] = useState(data.slug)
  const [shortDescription, setShortDescription] = useState(data.shortDescription)
  const [description, setDescription] = useState(data.description)
  const [basePrice, setBasePrice] = useState(data.basePrice)
  const [pixPrice, setPixPrice] = useState(data.pixPrice)
  const [badge, setBadge] = useState(data.badge)
  const [isActive, setIsActive] = useState(data.isActive)
  const [isFeatured, setIsFeatured] = useState(data.isFeatured)
  const [categoryId, setCategoryId] = useState(data.categoryId)
  const [images, setImages] = useState<string[]>(data.images.length ? data.images : [''])
  const [variants, setVariants] = useState<Variant[]>(data.variants)
  const [newVariant, setNewVariant] = useState({ color: 'BLACK', size: 'M', stock: 0, sku: '' })
  const [customColor, setCustomColor] = useState('')
  const [useCustomColor, setUseCustomColor] = useState(false)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  function handleNameChange(val: string) {
    setName(val)
    if (mode === 'create') setSlug(slugify(val))
  }

  // ─── Imagens ───────────────────────────────────────────────────────────────

  function addImage() {
    setImages((prev) => [...prev, ''])
  }

  function updateImage(i: number, val: string) {
    setImages((prev) => prev.map((img, idx) => (idx === i ? val : img)))
  }

  function removeImage(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
  }

  function moveImage(i: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev]
      const target = i + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[i], next[target]] = [next[target], next[i]]
      return next
    })
  }

  // ─── Variantes ────────────────────────────────────────────────────────────

  function addVariant() {
    if (!newVariant.color.trim()) {
      setError('Informe a cor da variante.')
      return
    }
    if (!newVariant.sku.trim()) {
      setError('Informe o SKU da variante antes de adicionar.')
      return
    }
    if (variants.some((v) => v.color === newVariant.color && v.size === newVariant.size)) {
      setError('Já existe uma variante com essa cor e tamanho.')
      return
    }
    setVariants((prev) => [...prev, { ...newVariant }])
    setNewVariant((prev) => ({ ...prev, sku: '', stock: 0 }))
    setCustomColor('')
    setUseCustomColor(false)
    setError('')
  }

  function removeVariant(i: number) {
    setVariants((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateVariantStock(i: number, stock: number) {
    setVariants((prev) =>
      prev.map((v, idx) => (idx === i ? { ...v, stock } : v))
    )
  }

  // ─── Submissão ────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const cleanImages = images.filter((img) => img.trim())
    if (!cleanImages.length) {
      setError('Adicione pelo menos uma URL de imagem.')
      return
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      basePrice: parseFloat(basePrice),
      pixPrice: parseFloat(pixPrice),
      badge: badge.trim() || null,
      isActive,
      isFeatured,
      categoryId: categoryId || null,
      images: cleanImages,
      variants: mode === 'create' ? variants : undefined,
    }

    setSaving(true)
    try {
      const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Erro ${res.status}`)
        return
      }

      router.push('/admin/produtos')
      router.refresh()
    } catch {
      setError('Erro ao salvar. Verifique sua conexão.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!productId) return
    if (!confirm(`Excluir este produto permanentemente? Esta ação não pode ser desfeita.`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? `Erro ${res.status}`)
        return
      }
      router.push('/admin/produtos')
      router.refresh()
    } catch {
      setError('Erro ao excluir.')
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleActive() {
    if (!productId) return
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      setIsActive((v) => !v)
    } catch {
      setError('Erro ao alterar status.')
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">

          {/* Informações básicas */}
          <Section title="Informações">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome *">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="Ex: Camiseta Cristo em Mim"
                />
              </Field>

              <Field label="Slug *" hint="URL amigável">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="^[a-z0-9\-]+$"
                  className={inputCls}
                  placeholder="camiseta-cristo-em-mim"
                />
              </Field>
            </div>

            <Field label="Descrição curta" hint="Máx. 160 caracteres">
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                maxLength={160}
                className={inputCls}
                placeholder="Frase de destaque do produto"
              />
            </Field>

            <Field label="Descrição completa">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className={`${inputCls} resize-y`}
                placeholder="Detalhes do produto, materiais, diferenciais..."
              />
            </Field>
          </Section>

          {/* Preços */}
          <Section title="Preços">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço original (R$) *">
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className={inputCls}
                  placeholder="89.90"
                />
              </Field>
              <Field label="Preço PIX (R$) *">
                <input
                  type="number"
                  value={pixPrice}
                  onChange={(e) => setPixPrice(e.target.value)}
                  required
                  min="0.01"
                  step="0.01"
                  className={inputCls}
                  placeholder="80.91"
                />
              </Field>
            </div>
            {basePrice && pixPrice && Number(pixPrice) < Number(basePrice) && (
              <p className="text-xs text-brand-pix">
                Desconto PIX: {Math.round(((Number(basePrice) - Number(pixPrice)) / Number(basePrice)) * 100)}%
              </p>
            )}
          </Section>

          {/* Imagens */}
          <Section title="Imagens" hint="Cole URLs das imagens. A primeira é a principal.">
            <div className="space-y-2">
              {images.map((img, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs text-brand-muted">{i + 1}</span>
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(i, e.target.value)}
                    className={`${inputCls} flex-1`}
                    placeholder="https://..."
                  />
                  <div className="flex gap-1">
                    {i > 0 && (
                      <button type="button" onClick={() => moveImage(i, -1)} className={iconBtn} title="Mover para cima">↑</button>
                    )}
                    {i < images.length - 1 && (
                      <button type="button" onClick={() => moveImage(i, 1)} className={iconBtn} title="Mover para baixo">↓</button>
                    )}
                    {images.length > 1 && (
                      <button type="button" onClick={() => removeImage(i)} className={`${iconBtn} text-red-500`} title="Remover">×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addImage}
              className="mt-2 text-xs text-brand-navy underline hover:text-brand-black"
            >
              + Adicionar imagem
            </button>
          </Section>

          {/* Variantes */}
          <Section title="Variantes" hint={mode === 'edit' ? 'Use a página de Estoque para ajustar quantidades.' : 'Adicione combinações de cor, tamanho e estoque.'}>
            {variants.length > 0 && (
              <div className="mb-4 overflow-x-auto rounded-lg border border-brand-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-border bg-brand-surface2">
                      <th className="px-3 py-2 text-left font-semibold text-brand-black">Cor</th>
                      <th className="px-3 py-2 text-left font-semibold text-brand-black">Tam.</th>
                      <th className="px-3 py-2 text-left font-semibold text-brand-black">SKU</th>
                      <th className="px-3 py-2 text-center font-semibold text-brand-black">Estoque</th>
                      {mode === 'create' && (
                        <th className="px-3 py-2" />
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {variants.map((v, i) => (
                      <tr key={i} className="hover:bg-brand-surface2">
                        <td className="px-3 py-2">{COLOR_LABELS[v.color] ?? v.color}</td>
                        <td className="px-3 py-2 font-medium">{v.size}</td>
                        <td className="px-3 py-2 font-mono text-xs text-brand-muted">{v.sku}</td>
                        <td className="px-3 py-2 text-center">
                          {mode === 'create' ? (
                            <input
                              type="number"
                              value={v.stock}
                              min={0}
                              onChange={(e) => updateVariantStock(i, Number(e.target.value))}
                              className="w-16 rounded border border-brand-border px-2 py-1 text-center text-sm"
                            />
                          ) : (
                            <span className={v.stock === 0 ? 'text-red-500' : v.stock <= 5 ? 'text-amber-500' : 'text-green-600'}>
                              {v.stock} un.
                            </span>
                          )}
                        </td>
                        {mode === 'create' && (
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => removeVariant(i)}
                              className="text-xs text-red-500 hover:underline"
                            >
                              Remover
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {mode === 'create' && (
              <div className="rounded-lg border border-dashed border-brand-border p-4">
                <p className="mb-3 text-xs font-medium text-brand-muted uppercase tracking-wider">Nova variante</p>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Field label="Cor">
                    <select
                      value={useCustomColor ? '__custom__' : newVariant.color}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setUseCustomColor(true)
                          setNewVariant((v) => ({ ...v, color: customColor || '' }))
                        } else {
                          setUseCustomColor(false)
                          setCustomColor('')
                          setNewVariant((v) => ({ ...v, color: e.target.value }))
                        }
                      }}
                      className={inputCls}
                    >
                      {COLORS.map((c) => (
                        <option key={c} value={c}>{COLOR_LABELS[c]}</option>
                      ))}
                      <option value="__custom__">+ Outra cor...</option>
                    </select>
                    {useCustomColor && (
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase().replace(/\s+/g, '_')
                          setCustomColor(val)
                          setNewVariant((v) => ({ ...v, color: val }))
                        }}
                        className={`${inputCls} mt-1`}
                        placeholder="Ex: ROSA, VERMELHO, AZUL-ROYAL"
                        autoFocus
                      />
                    )}
                  </Field>
                  <Field label="Tamanho">
                    <select
                      value={newVariant.size}
                      onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))}
                      className={inputCls}
                    >
                      {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Estoque">
                    <input
                      type="number"
                      value={newVariant.stock}
                      min={0}
                      onChange={(e) => setNewVariant((v) => ({ ...v, stock: Number(e.target.value) }))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="SKU *">
                    <input
                      type="text"
                      value={newVariant.sku}
                      onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value.toUpperCase() }))}
                      className={inputCls}
                      placeholder="CCM-BLK-M"
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="mt-3 rounded bg-brand-navy px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                >
                  + Adicionar variante
                </button>
              </div>
            )}

            {mode === 'edit' && (
              <p className="text-xs text-brand-muted">
                Para adicionar ou remover variantes existentes, acesse a página de{' '}
                <a href="/admin/estoque" className="text-brand-navy underline">Estoque</a>.
              </p>
            )}
          </Section>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-6">

          {/* Status */}
          <Section title="Status">
            <div className="flex items-center justify-between rounded-lg border border-brand-border p-3">
              <div>
                <p className="text-sm font-medium text-brand-black">Produto ativo</p>
                <p className="text-xs text-brand-muted">Visível na loja</p>
              </div>
              <Toggle checked={isActive} onChange={setIsActive} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-brand-border p-3">
              <div>
                <p className="text-sm font-medium text-brand-black">Destaque</p>
                <p className="text-xs text-brand-muted">Aparece na página inicial</p>
              </div>
              <Toggle checked={isFeatured} onChange={setIsFeatured} />
            </div>
          </Section>

          {/* Organização */}
          <Section title="Organização">
            <Field label="Categoria">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputCls}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Selo / Badge" hint="Ex: Novo, Mais Vendido, Últimas Unidades">
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                maxLength={50}
                className={inputCls}
                placeholder="Opcional"
              />
            </Field>
          </Section>

          {/* Ações */}
          <Section title="Ações">
            <button
              type="submit"
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded bg-brand-black py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : mode === 'create' ? 'Criar Produto' : 'Salvar Alterações'}
            </button>

            {mode === 'edit' && productId && (
              <>
                <button
                  type="button"
                  onClick={handleToggleActive}
                  className="mt-2 w-full rounded border border-brand-border py-2 text-sm font-medium text-brand-graphite hover:border-brand-black hover:text-brand-black"
                >
                  {isActive ? 'Inativar produto' : 'Ativar produto'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="mt-2 w-full rounded border border-red-200 py-2 text-sm font-medium text-red-500 hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? 'Excluindo...' : 'Excluir produto'}
                </button>
              </>
            )}

            <a
              href="/admin/produtos"
              className="mt-2 block text-center text-xs text-brand-muted hover:text-brand-black"
            >
              Cancelar
            </a>
          </Section>
        </div>
      </div>
    </form>
  )
}

// ─── Componentes auxiliares ────────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <div className="mb-4 border-b border-brand-border pb-3">
        <h2 className="font-display text-lg tracking-wide text-brand-black">{title.toUpperCase()}</h2>
        {hint && <p className="mt-0.5 text-xs text-brand-muted">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-black">
        {label}
        {hint && <span className="ml-1 text-xs font-normal text-brand-muted">— {hint}</span>}
      </label>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
        'border-2 border-transparent transition-colors duration-200 ease-in-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-black',
        checked ? 'bg-brand-black' : 'bg-brand-border',
      ].join(' ')}
    >
      <span
        aria-hidden="true"
        className={[
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow',
          'ring-0 transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}

const inputCls = 'w-full rounded border border-brand-border bg-white px-3 py-2 text-sm text-brand-black placeholder-brand-muted focus:border-brand-black focus:outline-none'
const iconBtn = 'flex h-7 w-7 items-center justify-center rounded border border-brand-border text-sm text-brand-muted hover:border-brand-black hover:text-brand-black'
