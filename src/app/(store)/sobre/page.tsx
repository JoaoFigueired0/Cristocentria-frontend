import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre Nós — Cristocentria',
  description: 'Conheça a história e o propósito por trás da Cristocentria.',
}

export default function SobrePage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide text-brand-black md:text-5xl">
          SOBRE NÓS
        </h1>

        <div className="mt-10 space-y-6 text-brand-graphite/80 leading-relaxed">
          <p>
            A <strong className="text-brand-black">Cristocentria</strong> nasceu da vontade de unir
            fé e estilo em peças que vão além da moda. Acreditamos que a roupa pode ser uma forma de
            expressão da nossa identidade em Cristo — sem abrir mão de qualidade, conforto e design
            pensado com cuidado.
          </p>

          <p>
            Cada estampa é desenvolvida com intenção: palavras, versículos e símbolos que carregam
            significado real para quem os veste. Nossos tecidos são selecionados para oferecer
            durabilidade e conforto no dia a dia.
          </p>

          <p>
            Trabalhamos com produção responsável e estamos sempre atentos à qualidade de cada
            detalhe — do corte à embalagem.
          </p>

          <blockquote className="border-l-2 border-brand-black pl-6 italic text-brand-graphite/60">
            "Seja em tudo o que fizerem, feito de todo o coração, como para o Senhor."
            <br />
            <span className="mt-2 block text-sm not-italic">— Colossenses 3:23</span>
          </blockquote>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link
            href="/colecao"
            className="inline-flex h-11 items-center rounded bg-brand-black px-7 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Ver coleção
          </Link>
          <Link
            href="/contato"
            className="inline-flex h-11 items-center rounded border border-brand-black px-7 text-sm font-medium text-brand-black transition-colors hover:bg-brand-black/5"
          >
            Falar conosco
          </Link>
        </div>
      </div>
    </div>
  )
}
