'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { ReviewList } from './ReviewList'

interface ReviewItem {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  isVerified: boolean
  createdAt: string | Date
  user: { name: string }
}

interface ReviewData {
  items: ReviewItem[]
  averageRating: number
  reviewCount: number
}

interface ReviewSectionProps {
  productId: string
  initialData: ReviewData
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Nota">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} estrela${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <svg
            className={`h-8 w-8 transition-colors ${
              star <= (hover || value) ? 'text-amber-400' : 'text-brand-border'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export function ReviewSection({ productId, initialData }: ReviewSectionProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'list' | 'form'>('list')
  const [reviewData, setReviewData] = useState<ReviewData>(initialData)
  const [fetching, setFetching] = useState(false)

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const fetchReviews = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch(`/api/reviews/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setReviewData({
          items: data.items,
          averageRating: data.averageRating,
          reviewCount: data.reviewCount,
        })
      }
    } finally {
      setFetching(false)
    }
  }, [productId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setSubmitError('Selecione uma nota de 1 a 5 estrelas')
      return
    }
    if (body.trim() && body.trim().length < 10) {
      setSubmitError('O comentário deve ter pelo menos 10 caracteres')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          ...(title.trim() && { title: title.trim() }),
          ...(body.trim() && { body: body.trim() }),
        }),
      })

      if (res.status === 401) {
        setSubmitError('Faça login para enviar uma avaliação')
        return
      }
      if (res.status === 409) {
        setSubmitError('Você já avaliou este produto')
        return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setSubmitError(err.error ?? 'Erro ao enviar avaliação. Tente novamente.')
        return
      }

      setSubmitted(true)
      setRating(0)
      setTitle('')
      setBody('')
      await fetchReviews()
      setActiveTab('list')
    } catch {
      setSubmitError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  // Quando troca para a aba de lista, rebusca para garantir dados frescos
  useEffect(() => {
    if (activeTab === 'list') {
      fetchReviews()
    }
  }, [activeTab, fetchReviews])

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 flex gap-1 border-b border-brand-border">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'list'
              ? 'border-b-2 border-brand-black text-brand-black'
              : 'text-brand-muted hover:text-brand-black'
          }`}
        >
          Avaliações ({reviewData.reviewCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('form')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'form'
              ? 'border-b-2 border-brand-black text-brand-black'
              : 'text-brand-muted hover:text-brand-black'
          }`}
        >
          Escrever Avaliação
        </button>
      </div>

      {/* Lista de avaliações */}
      {activeTab === 'list' && (
        fetching ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-black" />
          </div>
        ) : (
          <ReviewList
            reviews={reviewData.items}
            averageRating={reviewData.averageRating}
            reviewCount={reviewData.reviewCount}
          />
        )
      )}

      {/* Formulário */}
      {activeTab === 'form' && (
        <div className="rounded-xl border border-brand-border bg-white p-6">
          {submitted && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700">
              Avaliação enviada com sucesso! Obrigado pelo seu feedback.
            </div>
          )}

          {!session ? (
            <div className="py-10 text-center">
              <p className="text-sm text-brand-graphite">
                Faça login para escrever uma avaliação.
              </p>
              <a
                href="/login"
                className="mt-4 inline-flex h-10 items-center rounded bg-brand-black px-6 text-sm font-medium text-white hover:opacity-80"
              >
                Fazer login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Estrelas */}
              <div>
                <p className="mb-2 text-sm font-medium text-brand-black">
                  Sua nota <span className="text-red-500">*</span>
                </p>
                <StarPicker value={rating} onChange={setRating} />
              </div>

              {/* Título */}
              <div>
                <label
                  htmlFor="review-title"
                  className="mb-1.5 block text-sm font-medium text-brand-black"
                >
                  Título{' '}
                  <span className="font-normal text-brand-muted">(opcional)</span>
                </label>
                <input
                  id="review-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Resumo da sua avaliação"
                  maxLength={100}
                  className="w-full rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted focus:border-brand-black focus:outline-none"
                />
              </div>

              {/* Comentário */}
              <div>
                <label
                  htmlFor="review-body"
                  className="mb-1.5 block text-sm font-medium text-brand-black"
                >
                  Comentário{' '}
                  <span className="font-normal text-brand-muted">(opcional, mín. 10 caracteres)</span>
                </label>
                <textarea
                  id="review-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Conte sua experiência com o produto..."
                  maxLength={2000}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-brand-border bg-white px-4 py-2.5 text-sm text-brand-black placeholder-brand-muted focus:border-brand-black focus:outline-none"
                />
                {body.length > 0 && (
                  <p className="mt-1 text-right text-xs text-brand-muted">
                    {body.length}/2000
                  </p>
                )}
              </div>

              {submitError && (
                <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="h-11 rounded bg-brand-black text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
