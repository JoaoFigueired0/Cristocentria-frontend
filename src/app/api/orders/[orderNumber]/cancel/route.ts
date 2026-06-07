import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextAuthRequest } from 'next-auth'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ''

type Ctx = { params: Promise<{ orderNumber: string }> }

const adminHeaders = {
  'x-internal-secret': INTERNAL_SECRET,
}

const handler = auth(async function (req: NextAuthRequest, ctx: Ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { orderNumber } = await (ctx as Ctx).params
  const body = await req.arrayBuffer()
  const bodyText = Buffer.from(body).toString()
  const { reason } = JSON.parse(bodyText || '{}')

  const role = (req.auth.user as { role?: string }).role ?? ''
  const isAdmin = role === 'ADMIN'

  if (isAdmin) {
    const fullAdminHeaders = {
      'x-internal-secret': INTERNAL_SECRET,
      'x-user-id': req.auth.user.id ?? '',
      'x-user-role': role,
    }

    // Busca UUID do pedido via lista admin, depois PATCH status
    const searchRes = await fetch(
      `${BACKEND}/api/admin/orders?search=${encodeURIComponent(orderNumber)}&pageSize=1`,
      { headers: fullAdminHeaders }
    ).catch(() => null)

    if (!searchRes?.ok) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    }

    const { items } = await searchRes.json().catch(() => ({ items: [] }))
    const order = items?.find((o: { orderNumber: string }) => o.orderNumber === orderNumber)

    if (!order) {
      return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 })
    }

    const patchRes = await fetch(`${BACKEND}/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...fullAdminHeaders },
      body: JSON.stringify({ status: 'CANCELLED', notes: reason }),
    })

    const data = await patchRes.json().catch(() => null)
    return NextResponse.json(data ?? {}, { status: patchRes.status })
  }

  // Cliente cancela o próprio pedido
  try {
    const res = await fetch(`${BACKEND}/api/orders/${orderNumber}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': INTERNAL_SECRET,
        'x-user-id': req.auth.user.id ?? '',
        'x-user-role': (req.auth.user as { role?: string }).role ?? '',
      },
      body: bodyText,
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? {}, { status: res.status })
  } catch {
    return NextResponse.json({ error: 'Erro de conexão.' }, { status: 502 })
  }
})

export { handler as POST }
