'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'

// Reidrata os stores zustand/persist após o mount no cliente.
// Com skipHydration: true nos stores, o SSR renderiza estado vazio
// (igual ao servidor), e este componente preenche o localStorage
// somente depois — eliminando o hydration mismatch.
export function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
  }, [])

  return null
}
