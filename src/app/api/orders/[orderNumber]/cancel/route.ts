import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextAuthRequest } from 'next-auth'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ''

type Ctx = { params: Promise<{ orderNumber: string }> }

const handler = auth(async function (req: NextAuthRequest, ctx: Ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { orderNumber } = await (ctx as Ctx).params
  const body = await req.arrayBuffer()

  try {
    const res = await fetch(`${BACKEND}/api/orders/${orderNumber}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
        'x-user-id': req.auth.user.id ?? '',
        'x-user-role': (req.auth.user as { role?: string }).role ?? '',
      },
      body: Buffer.from(body),
    })

    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? {}, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Erro de conexão.' }, { status: 502 })
  }
})

export { handler as POST }
