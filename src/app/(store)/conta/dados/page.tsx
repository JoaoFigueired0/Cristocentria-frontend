'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ContaSidebar } from '@/components/layout/ContaSidebar'
import { maskCPF, maskPhone } from '@/lib/utils'

const inputCls =
  'w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none'

export default function DadosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?callbackUrl=/conta/dados')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((data) => {
        setName(data.name ?? '')
        setPhone(data.phone ? maskPhone(data.phone) : '')
        setCpf(data.cpf ?? '')
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.replace(/\D/g, '') || null,
          cpf: cpf.replace(/\D/g, '') || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.issues?.[0]?.message ?? data.error ?? 'Erro ao salvar.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
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
          <h2 className="mb-6 font-display text-2xl text-brand-black">DADOS PESSOAIS</h2>

          <div className="rounded-xl border border-brand-border bg-white p-6 sm:p-8">
            {/* E-mail somente leitura */}
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-brand-surface px-4 py-3">
              <svg className="h-4 w-4 shrink-0 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p className="text-xs text-brand-muted">E-mail (não editável)</p>
                <p className="text-sm font-medium text-brand-black">{session?.user?.email}</p>
              </div>
            </div>

            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Dados salvos com sucesso!
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-brand-black">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Seu nome"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-brand-black">
                  Telefone <span className="font-normal text-brand-muted">(opcional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-brand-black">
                  CPF <span className="font-normal text-brand-muted">(opcional)</span>
                </label>
                <input
                  id="cpf"
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className={inputCls}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-black text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  'Salvar alterações'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
