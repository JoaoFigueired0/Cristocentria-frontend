import { type NextRequest } from 'next/server'
import { proxyGet, proxyMutate } from '@/lib/backend-proxy'

export const GET = () => proxyGet('/api/user/addresses')
export const POST = (req: NextRequest) => proxyMutate(req, '/api/user/addresses', 'POST')
