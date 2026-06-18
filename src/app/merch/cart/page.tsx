'use client'

import { useState, useEffect, useRef } from 'react'
import { CartItem, merchItems } from '@/data/merch'
import { useTransition } from '@/providers/TransitionProvider'
import { MERCH } from '@/data/siteCopy'
import clsx from 'clsx'

export default function CartPage() {
  const { navigateTo } = useTransition()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [terminalLines, setTerminalLines] = useState<string[]>([
    '> INITIALIZING_CART_SYSTEM...',
    '> CONNECTION_ESTABLISHED',
    '> LOADING_BUFFER_CONTENTS...',
  ])
  const hasLoaded = useRef(false)

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('kamikaze_cart')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Reconstruct cart items with full item data
        const items: CartItem[] = parsed.map((ci: { itemId: string; size: string; quantity: number }) => {
          const item = merchItems.find((m) => m.id === ci.itemId)
          return item ? { item, size: ci.size, quantity: ci.quantity } : null
        }).filter(Boolean)
        setCartItems(items)
        setTerminalLines((prev) => [...prev, `> LOADED ${items.length} ITEM(S) FROM BUFFER`])
      } catch {
        setTerminalLines((prev) => [...prev, '> ERROR: BUFFER_CORRUPTED'])
      }
    } else {
      setTerminalLines((prev) => [...prev, '> BUFFER_EMPTY'])
    }
    hasLoaded.current = true
  }, [])

  // Save cart to localStorage (only after initial load)
  useEffect(() => {
    if (!hasLoaded.current) return
    const toStore = cartItems.map((ci) => ({
      itemId: ci.item.id,
      size: ci.size,
      quantity: ci.quantity,
    }))
    localStorage.setItem('kamikaze_cart', JSON.stringify(toStore))
  }, [cartItems])

  // Remove item
  const handleRemoveItem = (id: string, size: string) => {
    setCartItems((prev) => prev.filter((ci) => !(ci.item.id === id && ci.size === size)))
    setTerminalLines((prev) => [...prev.slice(-6), `> ITEM_REMOVED_FROM_BUFFER`])
  }

  // Update quantity
  const handleUpdateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id, size)
      return
    }
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.item.id === id && ci.size === size ? { ...ci, quantity } : ci
      )
    )
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  return (
    <main className="min-h-screen bg-void pt-24 pb-32">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigateTo('/merch')}
              className="font-mono text-xs text-white/70 hover:text-white transition-colors"
            >
              {'<'} BACK_TO_INVENTORY
            </button>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-arterial" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-signal/60" />
            </div>
            <span className="font-mono text-sm text-white">
              ACQUISITION_BUFFER.exe
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl tracking-wider">
            [CART]
          </h1>
        </div>

        {/* Terminal log */}
        <div className="mb-8 p-4 border border-white/30/30 bg-black/50 font-mono text-[11px] text-white/50 space-y-1">
          {terminalLines.map((line, i) => (
            <p key={i} className={line.includes('ERROR') ? 'text-arterial' : line.includes('LOADED') ? 'text-signal' : ''}>
              {line}
            </p>
          ))}
          <p className="text-white animate-pulse">█</p>
        </div>

        {/* Cart items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-20 border border-white/30/20">
            <p className="font-mono text-lg text-white/50 mb-2">[BUFFER_EMPTY]</p>
            <p className="font-mono text-xs text-white/50/60 mb-6">
              No items queued for acquisition
            </p>
            <button
              onClick={() => navigateTo('/merch')}
              className="font-mono text-xs text-arterial border border-arterial/50 px-6 py-3 hover:bg-arterial/10 transition-colors"
            >
              [ BROWSE_INVENTORY ]
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Items list */}
            <div className="space-y-4">
              {cartItems.map((cartItem) => (
                <div
                  key={`${cartItem.item.id}-${cartItem.size}`}
                  className="p-6 border border-white/30/30 bg-black/30 flex flex-col md:flex-row md:items-center gap-6"
                >
                  {/* Item info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-xs text-arterial">
                        #{cartItem.item.serial}
                      </span>
                      <span className="font-mono text-[10px] text-white/50 px-2 py-0.5 border border-white/30/30">
                        {cartItem.size}
                      </span>
                    </div>
                    <h3 className="font-mono text-lg text-white">
                      {cartItem.item.name}
                    </h3>
                    <p className="font-mono text-xs text-white/50 mt-1">
                      {cartItem.item.category}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-white/50">QTY:</span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            cartItem.item.id,
                            cartItem.size,
                            cartItem.quantity - 1
                          )
                        }
                        className="font-mono text-lg text-white/70 hover:text-white px-2 border border-white/30/30 hover:border-white/40 transition-colors"
                      >
                        -
                      </button>
                      <span className="font-mono text-lg text-white w-8 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(
                            cartItem.item.id,
                            cartItem.size,
                            cartItem.quantity + 1
                          )
                        }
                        className="font-mono text-lg text-white/70 hover:text-white px-2 border border-white/30/30 hover:border-white/40 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <span className="font-mono text-lg text-white">
                      €{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                    {cartItem.quantity > 1 && (
                      <p className="font-mono text-[10px] text-white/50">
                        €{cartItem.item.price.toFixed(2)} each
                      </p>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveItem(cartItem.item.id, cartItem.size)}
                    className="font-mono text-xs text-white/50 hover:text-arterial transition-colors"
                  >
                    [DEL]
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border border-white/30/30 bg-black/30 p-6">
              <div className="space-y-3 font-mono text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-white/50">SUBTOTAL:</span>
                  <span className="text-white/70">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{MERCH.shippingFee}</span>
                  <span className={shipping === 0 ? 'text-signal' : 'text-white/70'}>
                    {shipping === 0 ? 'WAIVED (ORDER > €100)' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-white/30/30">
                  <span className="text-white text-lg">TOTAL:</span>
                  <span className="text-arterial text-xl">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                className={clsx(
                  'w-full py-5 font-mono text-sm tracking-widest border transition-all duration-300',
                  'border-arterial text-arterial hover:bg-arterial hover:text-black'
                )}
              >
                [{MERCH.checkout}]
              </button>

              <p className="font-mono text-[10px] text-white/50 text-center mt-4">
                {MERCH.secureCheckout}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
