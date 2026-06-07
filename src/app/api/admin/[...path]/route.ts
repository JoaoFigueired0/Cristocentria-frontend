import { auth } from '@/auth'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET ?? ''

async function proxyAdmin(req: NextRequest, path: string[]): Promise<NextResponse> {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado', code: 'UNAUTHORIZED' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado', code: 'FORBIDDEN' }, { status: 403 })
  }

  const url = `${BACKEND}/api/admin/${path.join('/')}${req.nextUrl.search}`

  const headers: Record<string, string> = {
    'x-internal-secret': INTERNAL_SECRET,
    'x-user-id': session.user.id,
    'x-user-role': (session.user as { role?: string }).role ?? '',
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
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
    },
  })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyAdmin(req, (await params).path)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyAdmin(req, (await params).path)
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyAdmin(req, (await params).path)
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyAdmin(req, (await params).path)
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxyAdmin(req, (await params).path)
}
