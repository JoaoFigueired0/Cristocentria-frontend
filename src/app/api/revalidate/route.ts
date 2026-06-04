import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  if (secret) {
    const token = req.headers.get('x-revalidate-token') ?? req.nextUrl.searchParams.get('token')
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  revalidatePath('/produto/[slug]', 'page')
  revalidatePath('/colecao', 'page')
  revalidatePath('/', 'page')
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
