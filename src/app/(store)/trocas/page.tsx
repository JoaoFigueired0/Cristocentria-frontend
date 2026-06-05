import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: 'Trocas e Devoluções — Cristocentria',
  description: 'Política de trocas e devoluções da Cristocentria. Prazo de 30 dias após o recebimento.',
}

const STEPS = [
  {
    step: '01',
    title: 'Verifique o prazo',
    body: 'Trocas e devoluções são aceitas em até 30 dias corridos após a data de recebimento do produto.',
  },
  {
    step: '02',
    title: 'Confira as condições',
    body: 'O produto deve estar sem uso, sem lavagem, com etiqueta original e na embalagem original.',
  },
  {
    step: '03',
    title: 'Entre em contato',
    body: `Envie um e-mail para ${siteConfig.contactEmail} com o número do pedido e o motivo da troca ou devolução. Retornaremos em até 2 dias úteis.`,
  },
  {
    step: '04',
    title: 'Envie o produto',
    body: 'Após aprovação, você receberá o endereço para envio. Os custos de postagem para troca por defeito são por nossa conta. Para outros casos, o frete de retorno é por conta do cliente.',
  },
  {
    step: '05',
    title: 'Receba o reembolso ou novo produto',
    body: 'Após recebermos e validarmos o produto, processamos a troca ou reembolso em até 5 dias úteis.',
  },
]

export default function TrocasPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide text-brand-black md:text-5xl">
          TROCAS E DEVOLUÇÕES
        </h1>
        <p className="mt-4 text-brand-graphite/70">
          Sua satisfação é nossa prioridade. Veja abaixo como funciona nosso processo.
        </p>

        <div className="mt-12 space-y-8">
          {STEPS.map(({ step, title, body }) => (
            <div key={step} className="flex gap-6">
              <span className="font-display text-3xl text-brand-black/20 tabular-nums leading-none">
                {step}
              </span>
              <div>
                <h2 className="font-medium text-brand-black">{title}</h2>
                <p className="mt-1 text-sm text-brand-graphite/70 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-lg border border-brand-black/10 p-6 text-sm text-brand-graphite/70">
          <strong className="text-brand-black">Importante:</strong> produtos com sinais de uso,
          lavagem ou sem etiqueta não são elegíveis para troca ou devolução. Em caso de dúvida,{' '}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="underline underline-offset-4 hover:text-brand-black"
          >
            fale conosco
          </a>{' '}
          antes de enviar.
        </div>
      </div>
    </div>
  )
}
