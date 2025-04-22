// lib/auth.ts
"use client"

const API_URL = "http://localhost:5000/api/users"

/**
 * Register a new user.
 * @param username User's username.
 * @param email User's email.
 * @param password User's password.
 * @param profilePicture URL to user's profile picture.
 * @param referralCode Optional referral code.
 * @param interestedCategory The one category the user is interested in.
 */
export async function register(
  username: string,
  email: string,
  password: string,
  profilePicture: string,
  referralCode: string | undefined,
  interestedCategory: string
): Promise<any> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      profilePicture,
      referralCode: referralCode || undefined,
      interestedCategory,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Registration failed')
  }

  return response.json()
}

/**
 * Log in a user.
 * @param email User's email.
 * @param password User's password.
 */
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || "Invalid credentials")
  }

  localStorage.setItem("auth-token", data.token)
  localStorage.setItem("user-data", JSON.stringify(data.user))
  document.cookie = `auth-token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`

  return data
}

/**
 * Fetch the current user's profile.
 * @param token JWT token.
 */
export async function getUserProfile(token: string) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || "Failed to fetch profile")
  // pull out the user property and return it
  return data.user
}


/**
 * Log out the current user.
 */
export function logout() {
  localStorage.removeItem("auth-token")
  localStorage.removeItem("user-data")
  document.cookie = "auth-token=; path=/; max-age=0"
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated() {
  if (typeof window === "undefined") return false
  return Boolean(localStorage.getItem("auth-token"))
}

/**
 * Get stored user data from localStorage.
 */
export function getStoredUserData() {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user-data")
  return raw ? JSON.parse(raw) : null
}

/**
 * Generate (or regenerate) referral code for the authenticated user.
 * @param token JWT token.
 */
export async function generateReferralCode(token: string) {
  const res = await fetch(`${API_URL}/generate-referral-code`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error("Failed to generate referral code.")
  return res.json()
}

/**
 * Get all referral records where the authenticated user is the referrer.
 * @param token JWT token.
 */
export async function getMyReferrals(token: string) {
  const res = await fetch(`${API_URL}/referrals/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch referral data.")
  }
  return data
}
