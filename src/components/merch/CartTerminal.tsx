'use client'

import { useState, useEffect } from 'react'
import { CartItem } from '@/data/merch'
import { MERCH } from '@/data/siteCopy'
import clsx from 'clsx'

interface CartTerminalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onRemoveItem: (id: string, size: string) => void
  onUpdateQuantity: (id: string, size: string, quantity: number) => void
}

export function CartTerminal({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
}: CartTerminalProps) {
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [showExecute, setShowExecute] = useState(false)

  // Calculate totals
  const subtotal = items.reduce((sum, ci) => sum + ci.item.price * ci.quantity, 0)
  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  // Add terminal line on item changes
  useEffect(() => {
    if (items.length > 0) {
      const lastItem = items[items.length - 1]
      setTerminalLines((prev) => [
        ...prev.slice(-4),
        `> BUFFER_LOADED: ${lastItem.item.serial} [${lastItem.size}]`,
      ])
    }
  }, [items])

  // Typing animation for execute button
  useEffect(() => {
    if (isOpen && items.length > 0) {
      const timer = setTimeout(() => setShowExecute(true), 500)
      return () => clearTimeout(timer)
    }
    setShowExecute(false)
  }, [isOpen, items.length])

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Terminal sidebar */}
      <div
        className={clsx(
          'fixed top-0 right-0 h-full w-full max-w-md bg-void border-l border-white/30/30 z-50',
          'transition-transform duration-500 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Terminal header */}
        <div className="flex items-center justify-between p-4 border-b border-white/30/30">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-arterial" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-signal/60" />
            </div>
            <span className="font-mono text-xs text-white/70">
              ACQUISITION_BUFFER.exe
            </span>
          </div>
          <button
            onClick={onClose}
            className="font-mono text-xs text-white/50 hover:text-white transition-colors"
          >
            [X]
          </button>
        </div>

        {/* Terminal content */}
        <div className="flex flex-col h-[calc(100%-60px)]">
          {/* Log lines */}
          <div className="p-4 border-b border-white/30/20 font-mono text-[10px] text-white/50 space-y-1">
            <p>{'>'} INITIALIZING_CART_SYSTEM...</p>
            <p>{'>'} CONNECTION_ESTABLISHED</p>
            {terminalLines.map((line, i) => (
              <p key={i} className="text-signal">
                {line}
              </p>
            ))}
            <p className="text-white animate-pulse">█</p>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-mono text-xs text-white/50">
                  [BUFFER_EMPTY]
                </p>
                <p className="font-mono text-[10px] text-white/50/60 mt-2">
                  No items queued for acquisition
                </p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={`${cartItem.item.id}-${cartItem.size}`}
                  className="p-3 border border-white/30/30 bg-black/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-arterial">
                          #{cartItem.item.serial}
                        </span>
                        <span className="font-mono text-[10px] text-white/50">
                          [{cartItem.size}]
                        </span>
                      </div>
                      <h4 className="font-mono text-sm text-white mt-1">
                        {cartItem.item.name}
                      </h4>
                    </div>
                    <button
                      onClick={() => onRemoveItem(cartItem.item.id, cartItem.size)}
                      className="font-mono text-[10px] text-white/50 hover:text-arterial transition-colors"
                    >
                      [DEL]
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-white/50">QTY:</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            cartItem.item.id,
                            cartItem.size,
                            Math.max(1, cartItem.quantity - 1)
                          )
                        }
                        className="font-mono text-xs text-white/70 hover:text-white px-1"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs text-white w-6 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(
                            cartItem.item.id,
                            cartItem.size,
                            cartItem.quantity + 1
                          )
                        }
                        className="font-mono text-xs text-white/70 hover:text-white px-1"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-mono text-sm text-white">
                      €{(cartItem.item.price * cartItem.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals and checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-white/30/30 space-y-3">
              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">SUBTOTAL:</span>
                  <span className="text-white/70">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">{MERCH.shippingFee}</span>
                  <span className={shipping === 0 ? 'text-signal' : 'text-white/70'}>
                    {shipping === 0 ? 'WAIVED' : `€${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/30/20">
                  <span className="text-white">TOTAL:</span>
                  <span className="text-arterial text-sm">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Execute button */}
              <button
                className={clsx(
                  'w-full py-4 font-mono text-sm tracking-widest border transition-all duration-300',
                  'border-arterial text-arterial hover:bg-arterial hover:text-black',
                  showExecute ? 'opacity-100' : 'opacity-0'
                )}
              >
                [ EXECUTE_ORDER ]
              </button>

              <p className="font-mono text-[9px] text-white/50 text-center">
                {MERCH.secureCheckout}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
