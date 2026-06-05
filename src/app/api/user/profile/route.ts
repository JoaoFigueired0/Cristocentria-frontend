import { type NextRequest } from 'next/server'
import { proxyGet, proxyMutate } from '@/lib/backend-proxy'

export const GET = () => proxyGet('/api/user/profile')
export const PATCH = (req: NextRequest) => proxyMutate(req, '/api/user/profile', 'PATCH')
