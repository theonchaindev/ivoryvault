'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

export interface CartItem {
  competitionId: string
  slug: string
  title: string
  image: string | null
  ticketPrice: number
  quantity: number
  maxAvailable: number
}

interface CartContextType {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (competitionId: string) => void
  updateQty: (competitionId: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)
const STORAGE_KEY = 'iv-basket'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // Persist
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* ignore */ }
  }, [items, hydrated])

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.competitionId === item.competitionId)
      if (existing) {
        return prev.map(i =>
          i.competitionId === item.competitionId
            ? { ...i, quantity: Math.min(i.maxAvailable, i.quantity + item.quantity) }
            : i,
        )
      }
      return [...prev, item]
    })
  }, [])

  const removeItem = useCallback((competitionId: string) => {
    setItems(prev => prev.filter(i => i.competitionId !== competitionId))
  }, [])

  const updateQty = useCallback((competitionId: string, quantity: number) => {
    setItems(prev => prev.map(i =>
      i.competitionId === competitionId
        ? { ...i, quantity: Math.max(1, Math.min(i.maxAvailable, quantity)) }
        : i,
    ))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.ticketPrice * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
