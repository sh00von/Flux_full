// components/CartSidebar.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserProfile } from "@/lib/auth"

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
}

interface CartSidebarProps {
  isOpen: boolean
  items: CartItem[]
  deliveryType: "local" | "shipping"
  onClose: () => void
  onQuantityChange: (id: string, qty: number) => void
  onRemove: (id: string) => void
  onDeliveryChange: (type: "local" | "shipping") => void
}

export default function CartSidebar({
  isOpen,
  items,
  deliveryType,
  onClose,
  onQuantityChange,
  onRemove,
  onDeliveryChange,
}: CartSidebarProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<"points" | "card">("card")
  const [userPoints, setUserPoints] = useState(0)
  const [isFirstOrder, setIsFirstOrder] = useState(false)

  // Fetch user data: referralReward + orderCount
  useEffect(() => {
    const token = localStorage.getItem("auth-token")
    if (!token) return
    getUserProfile(token)
      .then((u) => {
        setUserPoints(u.referralReward ?? 0)
        // assume backend returns orderCount on profile
        setIsFirstOrder((u.orderCount ?? 0) === 0)
      })
      .catch((err) => console.error("Failed to load user data:", err))
  }, [])

  const SUBTOTAL = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const DELIVERY_FEE = deliveryType === "local" ? 100 : 500
  const TOTAL = SUBTOTAL + DELIVERY_FEE

  // 10% discount for first order
  const DISCOUNT = isFirstOrder ? Math.round(TOTAL * 0.1) : 0
  const FINAL = TOTAL - DISCOUNT

  // Stripe checkout
  const handlePayWithCard = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ price: FINAL}),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to create checkout session.")
      }
      window.location.href = data.url
    } catch (error) {
      console.error("Stripe checkout error:", error)
    }
  }

  // Pay with points
  const handlePayWithPoints = async () => {
    try {
      if (userPoints < FINAL) {
        alert("Not enough points")
        return
      }
      const token = localStorage.getItem("auth-token")
      if (!token) {
        alert("Not authenticated")
        return
      }
      const orderItems = items.map((i) => ({
        listingId: i.id,
        title:     i.title,
        price:     i.price,
        quantity:  i.quantity,
      }))
      const res = await fetch(
        "http://localhost:5000/api/users/pay-with-points",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items:        orderItems,
            deliveryType,
            subtotal:     SUBTOTAL,
            deliveryFee:  DELIVERY_FEE,
            amount:       FINAL,
          }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || "Point payment failed.")
      }
      router.push("/success")
    } catch (error: any) {
      console.error("Point payment error:", error.message)
      alert(error.message)
    }
  }

  return (
    <div
      className={`fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-xl transform transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Your Cart</h2>
        <button onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Items */}
      <div className="p-4 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">Cart is empty</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center mb-4">
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p>{item.price} TK each</p>
                <div className="mt-1 flex items-center space-x-2">
                  <label>Qty:</label>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      onQuantityChange(item.id, Math.max(1, +e.target.value))
                    }
                    className="w-16 border rounded px-2 py-1"
                  />
                </div>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="ml-2 text-red-500"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals & Payment */}
      <div className="p-4 border-t space-y-4">
        {/* Delivery Type */}
        <div>
          <label className="block mb-1">Delivery Type</label>
          <select
            value={deliveryType}
            onChange={(e) =>
              onDeliveryChange(e.target.value as "local" | "shipping")
            }
            className="w-full border rounded px-2 py-1"
          >
            <option value="local">Local Delivery (100 TK)</option>
            <option value="shipping">Shipping (500 TK)</option>
          </select>
        </div>

        {/* Subtotal / Discount / Total */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{SUBTOTAL} TK</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>{DELIVERY_FEE} TK</span>
          </div>
          {isFirstOrder && (
            <div className="flex justify-between text-green-700">
              <span>10% First‑Order Discount:</span>
              <span>-{DISCOUNT} TK</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{FINAL} TK</span>
          </div>
          <div className="flex justify-between">
            <span>Your Points:</span>
            <span>{userPoints} pts</span>
          </div>
        </div>

        {/* Payment method switch */}
        <div className="flex space-x-2">
          <button
            onClick={() => setPaymentMethod("points")}
            disabled={userPoints < FINAL}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              paymentMethod === "points"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            } ${userPoints < FINAL ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Use Points
          </button>
          <button
            onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              paymentMethod === "card"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          >
            Use Card
          </button>
        </div>

        {/* Action button */}
        {paymentMethod === "points" ? (
          <Button
            onClick={handlePayWithPoints}
            className="w-full bg-green-600 text-white hover:bg-green-700"
            disabled={userPoints < FINAL}
          >
            Pay {FINAL} pts
          </Button>
        ) : (
          <Button
            onClick={handlePayWithCard}
            className="w-full bg-blue-800 text-white hover:bg-blue-700"
          >
            Pay Now
          </Button>
        )}
      </div>
    </div>
  )
}
