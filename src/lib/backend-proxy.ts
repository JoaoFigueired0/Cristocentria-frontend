import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

async function authHeader(): Promise<Record<string, string>> {
  const store = await cookies()
  const val = (
    store.get('__Secure-authjs.session-token') ??
    store.get('authjs.session-token')
  )?.value
  return val ? { Cookie: `authjs.session-token=${val}` } : {}
}

export async function proxyGet(path: string) {
  try {
    const res = await fetch(`${BACKEND}${path}`, {
      headers: { 'Content-Type': 'application/json', ...await authHeader() },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Erro de conexão.' }, { status: 502 })
  }
}

export async function proxyMutate(req: NextRequest, path: string, method: string) {
  try {
    const body = method !== 'DELETE' ? await req.text() : undefined
    const res = await fetch(`${BACKEND}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...await authHeader() },
      ...(body ? { body } : {}),
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? {}, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Erro de conexão.' }, { status: 502 })
  }
}
