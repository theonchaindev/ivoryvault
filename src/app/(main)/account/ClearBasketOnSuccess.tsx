'use client'

import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

export default function ClearBasketOnSuccess() {
  const { clear } = useCart()
  useEffect(() => {
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('checkout') === 'success') {
      clear()
    }
  }, [clear])
  return null
}
