"use client"

const API_URL = "http://localhost:5000/api/listings"

interface ListingData {
  title: string
  description: string
  images: string[]
  category: string
  condition: string
  location: string
  price: number
  tradePreference: string
}

export async function createListing(listingData: ListingData) {
  try {
    const token = localStorage.getItem("auth-token")

    if (!token) {
      throw new Error("Authentication required. Please log in.")
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(listingData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to create listing")
    }

    return data
  } catch (error) {
    console.error("Create listing error:", error)
    throw error
  }
}

export async function getListings(filters?: {
  category?: string
  condition?: string
  location?: string
  showAll?: boolean
}) {
  try {
    let url = API_URL

    if (filters) {
      const queryParams = new URLSearchParams()

      if (filters.category) queryParams.append("category", filters.category)
      if (filters.condition) queryParams.append("condition", filters.condition)
      if (filters.location) queryParams.append("location", filters.location)
      if (filters.showAll) queryParams.append("showAll", "true")

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`
      }
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch listings")
    }

    return data
  } catch (error) {
    console.error("Fetch listings error:", error)
    throw error
  }
}
