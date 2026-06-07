import type { NextConfig } from 'next'

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // /api/admin/* é tratado pelo route handler em src/app/api/admin/[...path]/route.ts
      { source: '/api/categories',      destination: `${BACKEND}/api/categories` },
      { source: '/api/cart',            destination: `${BACKEND}/api/cart` },
      { source: '/api/cart/:path*',     destination: `${BACKEND}/api/cart/:path*` },
      { source: '/api/orders',          destination: `${BACKEND}/api/orders` },
      { source: '/api/orders/:path*',   destination: `${BACKEND}/api/orders/:path*` },
      { source: '/api/reviews',         destination: `${BACKEND}/api/reviews` },
      { source: '/api/reviews/:path*',  destination: `${BACKEND}/api/reviews/:path*` },
      { source: '/api/shipping/:path*', destination: `${BACKEND}/api/shipping/:path*` },
      { source: '/api/payments/:path*', destination: `${BACKEND}/api/payments/:path*` },
      { source: '/api/user/:path*',     destination: `${BACKEND}/api/user/:path*` },
      { source: '/api/users/:path*',    destination: `${BACKEND}/api/users/:path*` },
      { source: '/api/wishlist',        destination: `${BACKEND}/api/wishlist` },
      { source: '/api/wishlist/:path*', destination: `${BACKEND}/api/wishlist/:path*` },
    ]
  },
  images: {
    remotePatterns: [
      // ── Produção: Cloudflare R2 ───────────────────────────────────
      { protocol: 'https', hostname: 'media.cristocentria.com.br', pathname: '/**' },
      { protocol: 'https', hostname: '*.r2.dev', pathname: '/**' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com', pathname: '/**' },
      // ── Amazon (URLs inseridas via formulário admin) ───────────────
      { protocol: 'https', hostname: 'm.media-amazon.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images-amazon.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.images-amazon.com', pathname: '/**' },
      // ── CDNs comuns (uploads via admin) ──────────────────────────
      { protocol: 'https', hostname: 'i.imgur.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.supabase.co', pathname: '/**' },
    ],
    // SVG permitido para placeholders e logos
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
