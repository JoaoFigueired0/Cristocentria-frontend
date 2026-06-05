import { type NextRequest } from 'next/server'
import { proxyMutate } from '@/lib/backend-proxy'

export const PATCH = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => proxyMutate(req, `/api/user/addresses/${id}`, 'PATCH'))

export const DELETE = (req: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  params.then(({ id }) => proxyMutate(req, `/api/user/addresses/${id}`, 'DELETE'))
