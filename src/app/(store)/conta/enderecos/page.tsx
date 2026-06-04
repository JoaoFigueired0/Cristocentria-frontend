'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ContaSidebar } from '@/components/layout/ContaSidebar'
import { maskCEP } from '@/lib/utils'

const inputCls =
  'w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none disabled:bg-brand-surface disabled:text-brand-muted'

const ESTADOS = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
]

interface Address {
  id: string
  label: string
  recipientName: string
  zipCode: string
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  isDefault: boolean
}

const EMPTY_FORM = {
  label: 'Casa',
  recipientName: '',
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  isDefault: false,
}

export default function EnderecosPage() {
  const { status } = useSession()
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [fetching, setFetching] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?callbackUrl=/conta/enderecos')
  }, [status, router])

  const loadAddresses = useCallback(async () => {
    const res = await fetch('/api/user/addresses')
    if (res.ok) setAddresses(await res.json())
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return
    loadAddresses().finally(() => setFetching(false))
  }, [status, loadAddresses])

  async function handleCEP(raw: string) {
    const masked = maskCEP(raw)
    setForm((f) => ({ ...f, zipCode: masked }))
    const digits = raw.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }))
      }
    } catch {
      // CEP lookup não-crítico
    } finally {
      setCepLoading(false)
    }
  }

  function openNew() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(addr: Address) {
    setEditingId(addr.id)
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      zipCode: addr.zipCode,
      street: addr.street,
      number: addr.number,
      complement: addr.complement ?? '',
      neighborhood: addr.neighborhood,
      city: addr.city,
      state: addr.state,
      isDefault: addr.isDefault,
    })
    setError('')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      complement: form.complement || undefined,
    }

    try {
      const res = editingId
        ? await fetch(`/api/user/addresses/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/user/addresses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const data = await res.json()
        setError(data.issues?.[0]?.message ?? data.error ?? 'Erro ao salvar endereço.')
        return
      }

      await loadAddresses()
      setShowForm(false)
      setEditingId(null)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este endereço?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/user/addresses/${id}`, { method: 'DELETE' })
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/user/addresses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    await loadAddresses()
  }

  if (status === 'loading' || fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-black" />
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-4xl text-brand-black">MINHA CONTA</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        <ContaSidebar />

        <div className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl text-brand-black">ENDEREÇOS</h2>
            {!showForm && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 rounded-lg bg-brand-black px-4 py-2 text-sm font-medium text-white hover:opacity-80"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Novo endereço
              </button>
            )}
          </div>

          {/* Formulário */}
          {showForm && (
            <div className="mb-6 rounded-xl border border-brand-border bg-white p-6">
              <h3 className="mb-5 font-semibold text-brand-black">
                {editingId ? 'Editar endereço' : 'Novo endereço'}
              </h3>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                {/* Label */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">
                    Identificação
                  </label>
                  <input
                    type="text"
                    value={form.label}
                    onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="Casa, Trabalho…"
                    maxLength={20}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Destinatário */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">
                    Nome do destinatário
                  </label>
                  <input
                    type="text"
                    value={form.recipientName}
                    onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
                    placeholder="Quem vai receber"
                    required
                    className={inputCls}
                  />
                </div>

                {/* CEP */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">
                    CEP {cepLoading && <span className="text-brand-muted">(buscando…)</span>}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.zipCode}
                    onChange={(e) => handleCEP(e.target.value)}
                    placeholder="00000-000"
                    maxLength={9}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">Estado</label>
                  <div className="relative">
                    <select
                      value={form.state}
                      onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                      required
                      className="w-full appearance-none rounded-lg border border-brand-border bg-white py-2.5 pl-4 pr-10 text-sm text-brand-black transition-colors focus:border-brand-black focus:outline-none disabled:bg-brand-surface disabled:text-brand-muted"
                    >
                      <option value="">Selecione</option>
                      {ESTADOS.map(({ uf, name }) => (
                        <option key={uf} value={uf}>{uf} — {name}</option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Logradouro */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">Rua / Logradouro</label>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
                    placeholder="Rua, Av., Travessa…"
                    required
                    className={inputCls}
                  />
                </div>

                {/* Número */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">Número</label>
                  <input
                    type="text"
                    value={form.number}
                    onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                    placeholder="123"
                    maxLength={10}
                    required
                    className={inputCls}
                  />
                </div>

                {/* Complemento */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">
                    Complemento <span className="font-normal text-brand-muted">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.complement}
                    onChange={(e) => setForm((f) => ({ ...f, complement: e.target.value }))}
                    placeholder="Apto, Bloco…"
                    maxLength={60}
                    className={inputCls}
                  />
                </div>

                {/* Bairro */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">Bairro</label>
                  <input
                    type="text"
                    value={form.neighborhood}
                    onChange={(e) => setForm((f) => ({ ...f, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                    required
                    className={inputCls}
                  />
                </div>

                {/* Cidade */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-brand-black">Cidade</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                    placeholder="Cidade"
                    required
                    className={inputCls}
                  />
                </div>

                {/* Padrão */}
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                      className="h-4 w-4 rounded border-brand-border accent-brand-black"
                    />
                    <span className="text-sm text-brand-graphite">Definir como endereço padrão</span>
                  </label>
                </div>

                {/* Ações */}
                <div className="flex gap-3 sm:col-span-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-black px-6 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Salvando...
                      </>
                    ) : editingId ? 'Salvar alterações' : 'Adicionar'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="h-10 rounded-lg border border-brand-border px-6 text-sm text-brand-muted hover:text-brand-black"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de endereços */}
          {addresses.length === 0 && !showForm ? (
            <div className="rounded-xl border border-brand-border bg-white p-12 text-center">
              <svg className="mx-auto mb-3 h-10 w-10 text-brand-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <p className="text-sm text-brand-muted">Nenhum endereço cadastrado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`rounded-xl border bg-white p-5 ${addr.isDefault ? 'border-brand-black' : 'border-brand-border'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-brand-black">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="rounded-sm bg-brand-black px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-brand-graphite">{addr.recipientName}</p>
                      <p className="mt-0.5 text-sm text-brand-muted">
                        {addr.street}, {addr.number}
                        {addr.complement ? ` — ${addr.complement}` : ''}
                      </p>
                      <p className="text-sm text-brand-muted">
                        {addr.neighborhood} · {addr.city}/{addr.state} · {addr.zipCode}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-xs text-brand-muted underline hover:text-brand-black"
                        >
                          Tornar padrão
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(addr)}
                        className="text-xs text-brand-muted underline hover:text-brand-black"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="text-xs text-red-500 underline hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === addr.id ? '…' : 'Remover'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
