'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

const MENU_ITEMS = [
  { href: '/conta',                label: 'Pedidos' },
  { href: '/conta/dados',          label: 'Dados pessoais' },
  { href: '/conta/enderecos',      label: 'Endereços' },
  { href: '/conta/favoritos',      label: 'Favoritos' },
  { href: '/conta/alterar-senha',  label: 'Alterar senha' },
]

export default function AlterarSenhaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-black" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.replace('/login?callbackUrl=/conta/alterar-senha')
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (next !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    if (next.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })

      const data = await res.json()

      if (res.status === 400 && data.code === 'NO_PASSWORD') {
        setError('Sua conta foi criada via Google e não possui senha.')
        return
      }
      if (res.status === 401) {
        setError('Senha atual incorreta.')
        return
      }
      if (res.status === 400) {
        const msg = data.issues?.[0]?.message ?? data.error ?? 'Dados inválidos.'
        setError(msg)
        return
      }
      if (!res.ok) {
        setError('Erro ao alterar senha. Tente novamente.')
        return
      }

      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const user = session?.user

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-4xl text-brand-black">MINHA CONTA</h1>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-white p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-black text-xl font-bold text-white">
              {getInitials(user?.name ?? user?.email ?? 'U')}
            </div>
            <div>
              <p className="font-semibold text-brand-black">{user?.name}</p>
              <p className="text-sm text-brand-muted">{user?.email}</p>
            </div>
          </div>

          <nav className="mt-4" aria-label="Menu da conta">
            <ul className="flex flex-col divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
              {MENU_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 text-sm transition-colors hover:text-brand-black ${
                      item.href === '/conta/alterar-senha'
                        ? 'font-medium text-brand-black'
                        : 'text-brand-graphite'
                    }`}
                  >
                    {item.label}
                    <svg className="h-3 w-3 text-brand-muted" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Formulário */}
        <div className="lg:col-span-3">
          <h2 className="mb-6 font-display text-2xl text-brand-black">ALTERAR SENHA</h2>

          <div className="rounded-xl border border-brand-border bg-white p-6 sm:p-8">
            {success && (
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                Senha alterada com sucesso!
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-5">
              {/* Senha atual */}
              <div>
                <label htmlFor="current" className="mb-1.5 block text-sm font-medium text-brand-black">
                  Senha atual
                </label>
                <div className="relative">
                  <input
                    id="current"
                    type={showPass ? 'text' : 'password'}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 pr-10 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-black"
                    aria-label={showPass ? 'Ocultar senhas' : 'Mostrar senhas'}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Nova senha */}
              <div>
                <label htmlFor="next" className="mb-1.5 block text-sm font-medium text-brand-black">
                  Nova senha
                </label>
                <input
                  id="next"
                  type={showPass ? 'text' : 'password'}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
                />
              </div>

              {/* Confirmar nova senha */}
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-brand-black">
                  Confirmar nova senha
                </label>
                <input
                  id="confirm"
                  type={showPass ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Repita a nova senha"
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-black text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </>
                ) : (
                  'Salvar nova senha'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}
