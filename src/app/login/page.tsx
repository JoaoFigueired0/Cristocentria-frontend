import { Suspense } from 'react'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface px-4">
      <Suspense fallback={<div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-black border-t-transparent" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
