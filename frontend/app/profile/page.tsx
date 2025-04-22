"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getUserProfile,
  logout,
  generateReferralCode,
  getMyReferrals,
} from "@/lib/auth"
import { useToast } from "@/components/ui/use-toast"

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
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Fetch profile...
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
          title: "Error loading profile",
          description: "Please login again.",
          variant: "destructive",
        })
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router, toast])

  // Fetch referrals...
  useEffect(() => {
    if (!profile) return
    const fetchReferrals = async () => {
      try {
        const token = localStorage.getItem("auth-token") || ""
        const data = await getMyReferrals(token)
        setReferrals(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchReferrals()
  }, [profile])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return
    navigator.clipboard.writeText(profile.referralCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleGenerateReferral = async () => {
    try {
      const token = localStorage.getItem("auth-token") || ""
      const { referralCode } = await generateReferralCode(token)
      setProfile((prev) => (prev ? { ...prev, referralCode } : prev))
      toast({
        title: "New Code!",
        description: `Your referral code is now ${referralCode}`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not generate code.",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>Account Information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar & basic info */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile.profilePicture}
                alt={profile.username}
              />
              <AvatarFallback>
                {profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">
                {profile.username}
              </h2>
              <p className="text-sm text-gray-600">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Member since</span>
              <span>
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account type</span>
              <span>
                {profile.isAdmin ? "Administrator" : "User"}
              </span>
            </div>
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

          {/* Referral actions */}
          {profile.referralCode ? (
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-[#3661E8] hover:bg-[#05a8ff] text-white"
                onClick={handleCopyReferral}
              >
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[#3661E8] text-[#3661E8] hover:bg-[#3661E8]/10"
                onClick={handleGenerateReferral}
              >
                Regenerate Code
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-[#3661E8] hover:bg-[#05a8ff] text-white"
              onClick={handleGenerateReferral}
            >
              Generate Referral Code
            </Button>
          )}

          {/* Referred users */}
          {referrals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">
                Referred Users
              </h3>
              <ul className="mt-2 space-y-2">
                {referrals.map((ref) => (
                  <li
                    key={ref._id}
                    className="p-2 border rounded"
                  >
                    <p>Username: {ref.referee.username}</p>
                    <p>Email: {ref.referee.email}</p>
                    <p className="text-xs text-gray-500">
                      Joined:{" "}
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Logout */}
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
