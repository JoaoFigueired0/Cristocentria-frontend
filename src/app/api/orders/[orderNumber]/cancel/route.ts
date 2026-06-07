import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ''

type Ctx = { params: Promise<{ orderNumber: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { orderNumber } = await params
  const body = await req.text()

  try {
    const res = await fetch(`${BACKEND}/api/orders/${orderNumber}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
        'x-user-id': session.user.id,
        'x-user-role': (session.user as { role?: string }).role ?? '',
      },
      body,
    })

    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? {}, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Erro de conexão.' }, { status: 502 })
  }
}
