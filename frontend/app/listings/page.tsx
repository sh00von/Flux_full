// app/listings/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getListings } from "@/lib/listings"
import { getUserProfile } from "@/lib/auth"
import ListingsGrid from "@/components/listings-grid"
import FilterSidebar from "@/components/filter-sidebar"
import CartSidebar, { CartItem } from "@/components/CartSidebar"
import { Button } from "@/components/ui/button"
import { Loader2, Filter, X, ShoppingCart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [userPoints, setUserPoints] = useState(0)

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [deliveryType, setDeliveryType] = useState<"local" | "shipping">("local")

  const searchParams = useSearchParams()
  const router = useRouter()

  // URL filters
  const category = searchParams.get("category") || ""
  const condition = searchParams.get("condition") || ""
  const location = searchParams.get("location") || ""

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)

      try {
        // 1) Determine URL-based filters
        const filters: Record<string, string> = {}
        if (category) filters.category = category
        if (condition) filters.condition = condition
        if (location) filters.location = location

        // 2) Get user interest
        const token = localStorage.getItem("auth-token")
        let preferredCategory = ""
        if (token) {
          const user = await getUserProfile(token)
          preferredCategory = user.interestedCategory
        }

        // 3) Fetch listings
        const data = await getListings(filters)

        // 4) Partition by user interest
        let ordered: any[]
        if (preferredCategory) {
          const matched = data.filter((l) => l.category === preferredCategory)
          const others = data.filter((l) => l.category !== preferredCategory)
          ordered = [...matched, ...others]
        } else {
          ordered = data
        }

        // 5) Update state
        setListings(ordered)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load listings")
      } finally {
        setLoading(false)
      }
    })()
  }, [category, condition, location])

  // Cart handlers
  const addToCart = (item: { id: string; title: string; price: number }) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const updateQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    )
  }

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id))

  const clearFilters = () => router.push("/listings")
  const hasActiveFilters = Boolean(category || condition || location)

  const handlePayNow = () => {
    // integrate payment here
    alert("Proceed to payment of total amount.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart sidebar */}
      <CartSidebar
        isOpen={cartOpen}
        items={cart}
        deliveryType={deliveryType}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateQuantity}
        userPoints={userPoints}
        onRemove={removeFromCart}
        onDeliveryChange={(t) => setDeliveryType(t)}
        onPayNow={handlePayNow}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header with cart toggle */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Verified Listings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCartOpen(true)}
            className="flex items-center"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Mobile filter toggle */}
          <div className="md:hidden flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              {showFilters ? (
                <>
                  <X className="h-4 w-4 mr-2" /> Hide Filters
                </>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-2" /> Show Filters
                </>
              )}
            </Button>
          </div>

          {/* Sidebar filters */}
          <div className={`${showFilters ? "block" : "hidden"} md:block md:w-1/4 lg:w-1/5`}>
            <FilterSidebar
              selectedCategory={category}
              selectedCondition={condition}
              selectedLocation={location}
              onFilterChange={(k, v) => {
                const params = new URLSearchParams(searchParams.toString())
                v ? params.set(k, v) : params.delete(k)
                router.push(`/listings?${params}`)
              }}
              onClearFilters={clearFilters}
            />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {/* Active filters */}
            {hasActiveFilters && (
              <div className="hidden md:flex justify-between items-center mb-6">
                <div>
                  {category && <span className="badge">Category: {category}</span>}
                  {condition && (
                    <span className="badge ml-2">Condition: {condition}</span>
                  )}
                  {location && <span className="badge ml-2">Location: {location}</span>}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading spinner */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading listings...</span>
              </div>
            ) : (
              <ListingsGrid
                listings={listings}
                onAddToCart={(item) => addToCart(item)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
