'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { LogoMark } from '@/components/layout/Logo'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()

  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin'
  const urlError = searchParams.get('error')

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl)
    }
  }, [status, router, callbackUrl])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: email.trim(),
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('E-mail ou senha incorretos.')
      return
    }

    router.replace(callbackUrl)
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <LogoMark size={48} />
        <p className="font-display text-2xl tracking-widest text-brand-black">CRISTOCENTRIA</p>
        <p className="text-sm text-brand-muted">Área administrativa</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-sm">
        <h1 className="mb-6 font-display text-2xl tracking-wide text-brand-black">ENTRAR</h1>

        {(error || urlError === 'CredentialsSignin') && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || 'E-mail ou senha incorretos.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-brand-black">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted transition-colors focus:border-brand-black focus:outline-none"
              placeholder="••••••••"
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
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-sm text-brand-muted">
        Não tem conta?{' '}
        <a href="/cadastro" className="font-medium text-brand-black hover:underline">
          Criar conta
        </a>
      </p>

      <p className="mt-4 text-center text-xs text-brand-muted">
        <a href="/" className="hover:text-brand-black hover:underline">
          ← Voltar para a loja
        </a>
      </p>
    </div>
  )
}
