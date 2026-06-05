import { type NextRequest } from 'next/server'
import { proxyMutate } from '@/lib/backend-proxy'

export const PATCH = (req: NextRequest) => proxyMutate(req, '/api/user/password', 'PATCH')
