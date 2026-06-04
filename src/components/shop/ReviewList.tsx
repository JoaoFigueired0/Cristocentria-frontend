interface Review {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  isVerified: boolean
  createdAt: string | Date
  user: { name: string }
}

interface ReviewListProps {
  reviews: Review[]
  averageRating: number
  reviewCount: number
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const px = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${px} ${star <= rating ? 'text-amber-400' : 'text-brand-border'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 shrink-0 text-right text-brand-muted">{star}</span>
      <svg className="h-3 w-3 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-border">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-brand-muted">{count}</span>
    </div>
  )
}

export function ReviewList({ reviews, averageRating, reviewCount }: ReviewListProps) {
  if (!reviews.length) {
    return (
      <div className="rounded-xl border border-brand-border bg-white p-10 text-center">
        <div className="mx-auto mb-3 flex justify-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg key={s} className="h-6 w-6 text-brand-border" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="font-display text-xl tracking-wide text-brand-black">SEM AVALIAÇÕES AINDA</p>
        <p className="mt-2 text-sm text-brand-muted">
          Compre este produto e seja o primeiro a avaliar.
        </p>
      </div>
    )
  }

  // Distribuição por estrela
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <section aria-label="Avaliações do produto">
      {/* Painel de resumo */}
      <div className="mb-8 grid gap-6 rounded-xl border border-brand-border bg-white p-6 sm:grid-cols-2">
        {/* Média geral */}
        <div className="flex flex-col items-center justify-center gap-2">
          <p className="font-display text-6xl leading-none text-brand-black">
            {averageRating.toFixed(1)}
          </p>
          <Stars rating={Math.round(averageRating)} size="lg" />
          <p className="text-sm text-brand-muted">
            {reviewCount} {reviewCount === 1 ? 'avaliação' : 'avaliações'}
          </p>
        </div>

        {/* Barras de distribuição */}
        <div className="flex flex-col justify-center gap-1.5">
          {dist.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={reviewCount} />
          ))}
        </div>
      </div>

      {/* Lista de comentários */}
      <div className="divide-y divide-brand-border">
        {reviews.map((r) => (
          <article key={r.id} className="py-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.isVerified && (
                    <span className="rounded-sm bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700">
                      ✓ Compra verificada
                    </span>
                  )}
                </div>
                {r.title && (
                  <p className="font-semibold text-brand-black">{r.title}</p>
                )}
              </div>
              <time
                dateTime={new Date(r.createdAt).toISOString()}
                className="shrink-0 text-xs text-brand-muted"
              >
                {new Date(r.createdAt).toLocaleDateString('pt-BR')}
              </time>
            </div>

            {r.body && (
              <p className="mt-2 text-sm leading-relaxed text-brand-graphite">{r.body}</p>
            )}

            <p className="mt-3 text-xs font-medium text-brand-muted">{r.user.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
