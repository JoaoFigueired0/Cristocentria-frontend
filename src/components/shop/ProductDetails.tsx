'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColorSelector } from '@/components/ui/ColorSelector'
import { SizeSelector } from '@/components/ui/SizeSelector'
import { Button } from '@/components/ui/Button'
import { StickyAddToCart } from './StickyAddToCart'
import { MeasureGuideModal } from './MeasureGuideModal'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import { WishlistButton } from '@/components/ui/WishlistButton'
import { formatBRL, pixDiscount } from '@/lib/utils'

interface Variant {
  id: string
  color: string
  size: string
  stock: number
  sku: string
}

interface ProductDetailsProps {
  productId: string
  productName: string
  basePrice: number
  pixPrice: number
  variants: Variant[]
  availableColors: string[]
  images: string[]
}

export function ProductDetails({
  productId,
  productName,
  basePrice,
  pixPrice,
  variants,
  availableColors,
  images,
}: ProductDetailsProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableColors[0] ?? null
  )
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [measureOpen, setMeasureOpen] = useState(false)

  const priceRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const addItem = useCartStore((s) => s.addItem)
  const openDrawer = useCartStore((s) => s.openDrawer)
  const addToast = useToastStore((s) => s.add)

  // Tamanhos disponíveis para a cor selecionada
  const sizesForColor = selectedColor
    ? variants
        .filter((v) => v.color === selectedColor)
        .map((v) => v.size)
    : []

  const unavailableSizes = selectedColor
    ? variants
        .filter((v) => v.color === selectedColor && v.stock === 0)
        .map((v) => v.size)
    : []

  const selectedVariant =
    selectedColor && selectedSize
      ? variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        )
      : null

  function handleColorChange(color: string) {
    setSelectedColor(color)
    setSelectedSize(null)
  }

  async function handleAddToCart(isPix = false) {
    if (!selectedVariant) {
      addToast('Selecione cor e tamanho antes de adicionar', 'info')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: selectedVariant.id, quantity: 1 }),
      })

      if (!res.ok) {
        const err = await res.json()
        addToast(err.error ?? 'Erro ao adicionar ao carrinho', 'error')
        return
      }

      const cart = await res.json()

      // Sincroniza store local
      addItem({
        id: selectedVariant.id,
        variantId: selectedVariant.id,
        quantity: 1,
        variant: {
          id: selectedVariant.id,
          color: selectedVariant.color,
          size: selectedVariant.size,
          sku: selectedVariant.sku,
          stock: selectedVariant.stock,
        },
        product: {
          id: productId,
          name: productName,
          slug: '',
          basePrice,
          pixPrice,
          images,
        },
      })

      if (isPix) {
        router.push('/checkout')
      } else {
        addToast(`${productName} adicionado ao carrinho!`, 'success')
        openDrawer()
      }
    } catch {
      addToast('Erro ao adicionar ao carrinho. Tente novamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const savings = pixDiscount(basePrice, pixPrice)

  return (
    <>
      <div ref={priceRef} />

      <ColorSelector
        colors={availableColors}
        selected={selectedColor}
        onChange={handleColorChange}
      />

      <SizeSelector
        sizes={sizesForColor}
        unavailableSizes={unavailableSizes}
        selected={selectedSize}
        onChange={setSelectedSize}
      />

      {/* Guia de medidas */}
      <button
        type="button"
        onClick={() => setMeasureOpen(true)}
        className="self-start text-xs text-brand-muted underline underline-offset-2 hover:text-brand-black"
      >
        Guia de medidas
      </button>

      {/* Botões */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!selectedVariant}
            onClick={() => handleAddToCart(false)}
          >
            {selectedVariant
              ? 'Adicionar ao Carrinho'
              : !selectedColor
              ? 'Selecione uma cor'
              : 'Selecione um tamanho'}
          </Button>
          <WishlistButton productId={productId} size="md" className="shrink-0 border border-brand-border" />
        </div>

        <Button
          variant="outline"
          size="lg"
          fullWidth
          disabled={!selectedVariant}
          onClick={() => handleAddToCart(true)}
        >
          Comprar via PIX
          {savings > 0 && (
            <span className="ml-1.5 text-brand-pix text-sm">
              ({formatBRL(pixPrice)})
            </span>
          )}
        </Button>
      </div>

      {/* Stock badge */}
      {selectedVariant && selectedVariant.stock <= 5 && selectedVariant.stock > 0 && (
        <p className="text-xs font-medium text-amber-600">
          ⚠ Últimas {selectedVariant.stock} unidades
        </p>
      )}

      {/* Sticky mobile */}
      <StickyAddToCart
        name={productName}
        price={pixPrice}
        anchorRef={priceRef}
        onAdd={() => handleAddToCart(false)}
        loading={loading}
        disabled={!selectedVariant}
      />

      {/* Modal de medidas */}
      <MeasureGuideModal open={measureOpen} onClose={() => setMeasureOpen(false)} />
    </>
  )
}
