import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextAuthRequest } from 'next-auth'

const handler = auth(async function (req: NextAuthRequest) {
  return NextResponse.json({
    authenticated: !!req.auth,
    user: req.auth?.user ?? null,
    rawAuth: req.auth ?? null,
  })
})

export { handler as GET }
