'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { merchItems, MerchItem, CartItem } from '@/data/merch'
import { MerchHeader } from '@/components/merch/MerchHeader'
import { MerchGrid } from '@/components/merch/MerchGrid'
import { ProductModal } from '@/components/merch/ProductModal'
import { RitualChamber } from '@/components/merch/RitualChamber'
import { useTransition } from '@/providers/TransitionProvider'
import { useCountdown } from '@/hooks/useCountdown'

export default function MerchPage() {
  const { navigateTo } = useTransition()
  const countdown = useCountdown()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null)
  const hasLoaded = useRef(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('kamikaze_cart')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const items: CartItem[] = parsed.map((ci: { itemId: string; size: string; quantity: number }) => {
          const item = merchItems.find((m) => m.id === ci.itemId)
          return item ? { item, size: ci.size, quantity: ci.quantity } : null
        }).filter(Boolean)
        setCartItems(items)
      } catch {
        // Ignore parse errors
      }
    }
    hasLoaded.current = true
  }, [])

  // Save cart to localStorage whenever it changes (only after initial load)
  useEffect(() => {
    if (!hasLoaded.current) return
    const toStore = cartItems.map((ci) => ({
      itemId: ci.item.id,
      size: ci.size,
      quantity: ci.quantity,
    }))
    localStorage.setItem('kamikaze_cart', JSON.stringify(toStore))
  }, [cartItems])

  // Add item to cart
  const handleAddToCart = useCallback((item: MerchItem, size: string) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (ci) => ci.item.id === item.id && ci.size === size
      )
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id && ci.size === size
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        )
      }
      return [...prev, { item, size, quantity: 1 }]
    })
  }, [])

  // Calculate cart count
  const cartCount = cartItems.reduce((sum, ci) => sum + ci.quantity, 0)

  // Show Ritual Chamber lockup if countdown is not complete
  if (!countdown.isComplete) {
    return <RitualChamber />
  }

  // Show full merch page when countdown is complete
  return (
    <main className="min-h-screen bg-void">
      {/* Cart button - fixed, higher z-index than nav */}
      <button
        onClick={() => navigateTo('/merch/cart')}
        className="fixed top-5 right-6 z-[60] font-mono text-sm text-white hover:text-arterial transition-colors flex items-center gap-2 border border-white/30 hover:border-arterial px-3 py-1.5 bg-black/80 backdrop-blur-sm"
      >
        <span>[CART]</span>
        {cartCount > 0 && (
          <span className="bg-arterial text-black px-2 py-0.5 text-xs font-bold">
            {cartCount}
          </span>
        )}
      </button>

      {/* Header */}
      <MerchHeader />

      {/* Product grid */}
      <MerchGrid
        items={merchItems}
        onAddToCart={handleAddToCart}
        onSelectItem={setSelectedItem}
      />

      {/* Product modal */}
      <ProductModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />
    </main>
  )
}
