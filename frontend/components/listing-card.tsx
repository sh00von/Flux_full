"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tag, MapPin, Clock, Info, User } from "lucide-react"

interface Listing {
  _id: string
  title: string
  description: string
  images: string[]
  category: string
  condition: string
  location: string
  price: number
  tradePreference: string
  owner: {
    username: string
    email: string
  }
  createdAt: string
  isVerified: boolean
  verificationStatus: string
}

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const router = useRouter()

  const formattedDate = new Date(listing.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(listing.price)

  const handleBuyNow = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing._id,
          title: listing.title,
          price: listing.price,
        }),
       
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to create checkout session.")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      console.error("Stripe checkout error:", errorMessage)
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="aspect-video relative">
        {listing.images && listing.images.length > 0 ? (
          <Image
            src={listing.images[0] || "/placeholder.svg"}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <Info className="h-8 w-8 text-gray-400" />
          </div>
        )}

        {!listing.isVerified && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )}
      </div>

      <CardContent className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{listing.title}</h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{listing.description}</p>

        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center">
            <Tag className="h-5 w-5 mr-1" /> {listing.category}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            <MapPin className="h-5 w-5 mr-1" /> {listing.location}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-lg">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground">{listing.condition}</span>
        </div>

        <div className="mt-2 text-xs text-muted-foreground flex items-center">
          <User className="h-3 w-3 mr-1" /> {listing.owner.username} • {formattedDate}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 mt-auto flex gap-2">
        <Button asChild className="w-1/2">
          <a href={`/listings/${listing._id}`}>View</a>
        </Button>
        <Button onClick={handleBuyNow} variant="secondary" className="w-1/2">
          Buy Now
        </Button>
      </CardFooter>
    </Card>
  )
}