import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartVariant = {
  id: string
  color: string
  size: string
  sku: string
  stock: number
}

export type CartProduct = {
  id: string
  name: string
  slug: string
  basePrice: number
  pixPrice: number
  images: string[]
}

export type CartItem = {
  id: string        // CartItem id no banco
  variantId: string
  quantity: number
  variant: CartVariant
  product: CartProduct
}

type CartStore = {
  items: CartItem[]
  isDrawerOpen: boolean

  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, qty: number) => void
  clear: () => void

  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void

  count: () => number
  subtotal: () => number
  pixSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      setItems: (items) => set({ items }),

      addItem: (newItem) =>
        set((state) => {
          const exists = state.items.find((i) => i.variantId === newItem.variantId)
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, newItem] }
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      updateQuantity: (variantId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId ? { ...i, quantity: qty } : i
                ),
        })),

      clear: () => set({ items: [] }),

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

      count: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.product.basePrice * i.quantity, 0),
      pixSubtotal: () =>
        get().items.reduce((acc, i) => acc + i.product.pixPrice * i.quantity, 0),
    }),
    {
      name: 'cristocentria-cart',
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    }
  )
)
