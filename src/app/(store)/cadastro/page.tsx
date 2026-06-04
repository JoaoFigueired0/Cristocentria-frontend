'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogoMark } from '@/components/layout/Logo'

export default function CadastroPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      })

      const data = await res.json()

      if (res.status === 409) {
        setError('Este e-mail já está cadastrado.')
        return
      }

      if (res.status === 400) {
        const msg = data.issues?.[0]?.message ?? data.error ?? 'Dados inválidos.'
        setError(msg)
        return
      }

      if (!res.ok) {
        setError('Erro ao criar conta. Tente novamente.')
        return
      }

      // Loga automaticamente após o cadastro
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        router.replace('/login?registered=1')
      } else {
        router.replace('/conta')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <LogoMark size={48} />
          <p className="font-display text-2xl tracking-widest text-brand-black">CRISTOCENTRIA</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
          <h1 className="mb-6 font-display text-2xl tracking-wide text-brand-black">CRIAR CONTA</h1>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Nome */}
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
                autoComplete="name"
                placeholder="Seu nome"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
              />
            </div>

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-brand-black">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-black">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 pr-10 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-black"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-brand-black">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type={showPass ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repita a senha"
                className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-brand-black py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Criando conta...
                </>
              ) : (
                'Criar conta'
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-brand-muted">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-brand-black hover:underline">
              Entrar
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-brand-muted">
          <Link href="/" className="hover:text-brand-black hover:underline">
            ← Voltar para a loja
          </Link>
        </p>
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
