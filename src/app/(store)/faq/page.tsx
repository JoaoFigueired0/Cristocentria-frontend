import type { Metadata } from 'next'
import { Accordion } from '@/components/shop/Accordion'

export const metadata: Metadata = {
  title: 'Dúvidas Frequentes — Cristocentria',
  description: 'Respostas para as perguntas mais comuns sobre pedidos, entrega, trocas e pagamentos.',
}

const FAQS = [
  {
    question: 'Quais são os prazos de entrega?',
    answer:
      'O prazo de envio é de 1 a 3 dias úteis após a confirmação do pagamento. O prazo de entrega varia de acordo com a sua região, geralmente entre 5 e 15 dias úteis.',
  },
  {
    question: 'Quais formas de pagamento são aceitas?',
    answer:
      'Aceitamos PIX (com desconto), cartão de crédito e débito. O pagamento via PIX é processado instantaneamente e libera o pedido em minutos.',
  },
  {
    question: 'Posso rastrear meu pedido?',
    answer:
      'Sim. Após o envio você recebe o código de rastreio por e-mail. Também é possível acompanhar pela página "Rastrear pedido" no menu.',
  },
  {
    question: 'Como funciona a política de trocas?',
    answer:
      'Aceitamos trocas em até 30 dias após o recebimento, desde que o produto esteja sem uso e com etiqueta. Consulte nossa página de Trocas e Devoluções para o passo a passo completo.',
  },
  {
    question: 'Os produtos têm nota fiscal?',
    answer: 'Sim, todos os pedidos acompanham nota fiscal eletrônica enviada por e-mail.',
  },
  {
    question: 'Como escolho o tamanho correto?',
    answer:
      'Cada produto tem uma tabela de medidas disponível na página do produto. Em caso de dúvida, entre em contato conosco pelo WhatsApp ou e-mail.',
  },
]

export default function FaqPage() {
  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl tracking-wide text-brand-black md:text-5xl">
          DÚVIDAS FREQUENTES
        </h1>
        <p className="mt-4 text-brand-graphite/70">
          Não encontrou sua resposta? Entre em{' '}
          <a href="/contato" className="underline underline-offset-4 hover:text-brand-black">
            contato
          </a>{' '}
          com a gente.
        </p>

        <div className="mt-12">
          <Accordion
            items={FAQS.map((f) => ({ title: f.question, content: f.answer }))}
          />
        </div>
      </div>
    </div>
  )
}
