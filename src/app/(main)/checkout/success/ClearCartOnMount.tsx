'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

/** Empties the basket once the order has been confirmed. */
export default function ClearCartOnMount() {
  const { clear } = useCart()
  useEffect(() => { clear() }, [clear])
  return null
}
