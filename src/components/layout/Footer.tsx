import Link from 'next/link'
import { LogoFull } from './Logo'
import { siteConfig } from '@/lib/site-config'

const LINKS = {
  Loja: [
    { href: '/colecao', label: 'Coleção' },
    { href: '/colecao?category=camisetas', label: 'Camisetas' },
    { href: '/colecao?category=moletons', label: 'Moletons' },
  ],
  Ajuda: [
    { href: '/faq', label: 'Dúvidas frequentes' },
    { href: '/trocas', label: 'Trocas e devoluções' },
    { href: '/rastreio', label: 'Rastrear pedido' },
  ],
  Empresa: [
    { href: '/sobre', label: 'Sobre nós' },
    { href: '/contato', label: 'Contato' },
    { href: '/privacidade', label: 'Privacidade' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-brand-black text-brand-white/70">
      <div className="container-page py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <LogoFull size={36} />
            <p className="mt-4 text-sm leading-relaxed">
              Roupas com propósito.
              <br />
              Moda que expressa fé.
            </p>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="mt-4 block text-xs text-brand-white/50 transition-colors hover:text-brand-white/80"
            >
              {siteConfig.contactEmail}
            </a>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-display text-sm tracking-widest text-brand-white">
                {category.toUpperCase()}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-brand-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-center text-xs text-brand-white/40">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
