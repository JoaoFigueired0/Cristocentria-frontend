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
  const bodyText = Buffer.from(body).toString()
  const { reason } = JSON.parse(bodyText || '{}')

  const role = (req.auth.user as { role?: string }).role
  const isAdmin = role === 'ADMIN'

  // DEBUG: retorna diagnóstico temporário
  return NextResponse.json({
    _debug: true,
    orderNumber,
    userId: req.auth.user.id,
    role,
    isAdmin,
    reason,
  })
})

export { handler as POST }
