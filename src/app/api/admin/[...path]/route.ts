import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextAuthRequest } from 'next-auth'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ''

type Ctx = { params: Promise<{ path: string[] }> }

const handler = auth(async function (req: NextAuthRequest, ctx: Ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  if ((req.auth.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado', code: 'FORBIDDEN' }, { status: 403 })
  }

  const { path } = await ctx.params
  const url = `${BACKEND}/api/admin/${path.join('/')}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'x-internal-secret': INTERNAL_SECRET,
    'x-user-id': req.auth.user.id ?? '',
    'x-user-role': (req.auth.user as { role?: string }).role ?? '',
  }

  const contentType = req.headers.get('content-type')
  if (contentType) headers['content-type'] = contentType

  const body =
    req.method !== 'GET' && req.method !== 'HEAD'
      ? await req.arrayBuffer()
      : undefined

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: body ? Buffer.from(body) : undefined,
  })

  const resBody = await res.arrayBuffer()
  return new NextResponse(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  })
})

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE }
