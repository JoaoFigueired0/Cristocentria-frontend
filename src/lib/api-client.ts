/**
 * Cliente de API para Server Components (executa no servidor do frontend).
 * Chama o backend em :3001 diretamente, forwarding a cookie de sessão do NextAuth.
 * Client Components usam fetch('/api/...') — o next.config.ts faz o rewrite.
 */
import { cookies } from 'next/headers'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { next?: NextFetchRequestConfig; nullOn404?: boolean } = {}
): Promise<T | null> {
  const cookieStore = await cookies()
  // Em HTTPS (produção), NextAuth usa o prefixo __Secure-
  const sessionCookie =
    cookieStore.get('__Secure-authjs.session-token') ??
    cookieStore.get('authjs.session-token')

  const { nullOn404, ...fetchOptions } = options

  const res = await fetch(`${BACKEND}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers ?? {}),
      ...(sessionCookie
        ? { Cookie: `authjs.session-token=${sessionCookie.value}` }
        : {}),
    },
  })

  if (res.status === 404 && nullOn404) return null

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? `API error ${res.status} on ${path}`)
  }

  return res.json() as Promise<T>
}

// ─── API tipada por domínio ───────────────────────────────────────────────────

export const api = {
  products: {
    featured: (limit = 8) =>
      apiFetch<any[]>(`/api/products/featured?limit=${limit}`, {
        next: { revalidate: 3600 },
      }),

    bySlug: (slug: string) =>
      apiFetch<any>(`/api/products/${slug}`, {
        cache: 'no-store',
        nullOn404: true,
      }),

    list: (params?: Record<string, string>) => {
      const sp = params ? `?${new URLSearchParams(params)}` : ''
      return apiFetch<any>(`/api/products${sp}`, {
        next: { revalidate: 1800 },
      })
    },
  },

  categories: {
    list: () =>
      apiFetch<any[]>('/api/categories', { next: { revalidate: 3600 } }),
  },

  orders: {
    byNumber: (orderNumber: string, userId?: string) => {
      const q = userId ? `?userId=${userId}` : ''
      return apiFetch<any>(`/api/orders/${orderNumber}${q}`, {
        cache: 'no-store',
      })
    },

    byUser: (page = 1, pageSize = 5) =>
      apiFetch<any>(`/api/orders?page=${page}&pageSize=${pageSize}`, {
        cache: 'no-store',
      }),
  },

  admin: {
    dashboard: () =>
      apiFetch<any>('/api/admin/dashboard', { cache: 'no-store' }),

    orders: (params?: Record<string, string>) => {
      const sp = params ? `?${new URLSearchParams(params)}` : ''
      return apiFetch<any>(`/api/admin/orders${sp}`, { cache: 'no-store' })
    },

    products: (params?: Record<string, string>) => {
      const sp = params ? `?${new URLSearchParams(params)}` : ''
      return apiFetch<any>(`/api/admin/products${sp}`, { cache: 'no-store' })
    },

    productById: (id: string) =>
      apiFetch<any>(`/api/admin/products/${id}`, {
        cache: 'no-store',
        nullOn404: true,
      }),

    stock: (params?: Record<string, string>) => {
      const sp = params ? `?${new URLSearchParams(params)}` : ''
      return apiFetch<any>(`/api/admin/stock${sp}`, { cache: 'no-store' })
    },

    categories: {
      list: () =>
        apiFetch<any[]>('/api/admin/categories', { cache: 'no-store' }),

      byId: (id: string) =>
        apiFetch<any>(`/api/admin/categories/${id}`, {
          cache: 'no-store',
          nullOn404: true,
        }),
    },
  },
}
