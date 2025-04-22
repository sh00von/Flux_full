"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserProfile, logout, generateReferralCode, getMyReferrals } from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface UserProfile {
  _id: string
  username: string
  email: string
  profilePicture: string
  createdAt: string
  isAdmin: boolean
  referralCode?: string
  referralReward?: number
  interestedCategory: string
}

interface Referral {
  _id: string
  referee: {
    username: string
    email: string
  }
  createdAt: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("auth-token")
        if (!token) {
          router.push("/login")
          return
        }
        const userData = await getUserProfile(token)
        setProfile(userData)
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile. Please login again.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router, toast])

  // Fetch referrals
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem("auth-token")
        if (!token) return
        const referralsData = await getMyReferrals(token)
        setReferrals(referralsData)
      } catch (err) {
        console.error("Failed to fetch referrals", err)
      }
    }
    if (profile) fetchReferrals()
  }, [profile])

  const handleLogout = () => {
    logout()
    router.push("/login")
    toast({ title: "Logged out", description: "You have been successfully logged out." })
  }

  const handleCopyReferral = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode)
      toast({
        title: "Referral Code Copied",
        description: `Referral code ${profile.referralCode} copied to clipboard.`,
      })
    }
  }

  const handleGenerateReferral = async () => {
    try {
      const token = localStorage.getItem("auth-token") || ""
      const newProfile = await generateReferralCode(token)
      setProfile(newProfile)
      toast({
        title: "Referral Code Generated",
        description: `Your new referral code is ${newProfile.referralCode}`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate referral code.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-40 mx-auto mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) return null

  const initials = profile.username.substring(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Account Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.profilePicture} alt={profile.username} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{profile.username}</h2>
              <p className="text-sm text-gray-600">{profile.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Member since</span>
              <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account type</span>
              <span>{profile.isAdmin ? "Administrator" : "User"}</span>
            </div>
            {/* ← Newly added: Interested Category */}
            <div className="flex justify-between">
              <span className="font-medium">Interested Category</span>
              <span>{profile.interestedCategory}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Referral Reward</span>
              <span>{profile.referralReward || 0} points</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Your Referral Code</span>
              <span className="font-mono">
                {profile.referralCode || "Not generated"}
              </span>
            </div>
          </div>

          {profile.referralCode ? (
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCopyReferral}>
                Copy Code
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleGenerateReferral}>
                Regenerate
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={handleGenerateReferral}>
              Generate Referral Code
            </Button>
          )}

          {referrals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Referred Users</h3>
              <ul className="mt-2 space-y-2">
                {referrals.map((ref) => (
                  <li key={ref._id} className="p-2 border rounded">
                    <p>Username: {ref.referee.username}</p>
                    <p>Email: {ref.referee.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined: {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
