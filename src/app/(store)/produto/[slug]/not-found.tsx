import Link from 'next/link'

export default function ProdutoNotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-muted">
        404
      </p>
      <h1 className="font-display text-4xl tracking-wide text-brand-black">
        PRODUTO NÃO ENCONTRADO
      </h1>
      <p className="mt-4 max-w-sm text-sm text-brand-graphite">
        Este produto não existe ou não está mais disponível.
      </p>
      <Link
        href="/colecao"
        className="mt-8 inline-flex h-11 items-center rounded bg-brand-black px-6 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        Ver coleção
      </Link>
    </div>
  )
}
