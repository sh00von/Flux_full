"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { register as registerUser } from "@/lib/auth"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// 1) Master list of categories
const categories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Vehicles",
  "Collectibles",
  "Books",
  "Jewelry",
  "Other",
] as const

// 2) Zod schema now includes one category
const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  profilePicture: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional(),
  referralCode: z.string().optional(),
  interestedCategory: z.enum(categories, {
    required_error: "Please select a category",
  }),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      profilePicture: "https://ui-avatars.com/api/?background=random",
      referralCode: "",
      interestedCategory: categories[0],
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await registerUser(
        data.username,
        data.email,
        data.password,
        data.profilePicture || "https://ui-avatars.com/api/?background=random",
        data.referralCode,
        data.interestedCategory
      )

      setSuccess("Account created successfully! You can now log in.")
      reset()
      toast({
        title: "Registration Successful",
        description:
          "Your trading account has been created. Please log in to start trading.",
      })

      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again."
      setError(message)
      toast({
        title: "Registration Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-blue-200 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600" />
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-2xl text-blue-700">
          Create Trading Account
        </CardTitle>
        <CardDescription className="text-blue-600">
          Join our community of traders and start your journey today
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-blue-700 font-medium">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe"
              {...register("username")}
              disabled={isLoading}
              className="border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300"
            />
            {errors.username && (
              <p className="text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-700 font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              disabled={isLoading}
              className="border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-blue-700 font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
              className="border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <Label
              htmlFor="profilePicture"
              className="text-blue-700 font-medium"
            >
              Profile Picture URL (optional)
            </Label>
            <Input
              id="profilePicture"
              placeholder="https://example.com/profile.jpg"
              {...register("profilePicture")}
              disabled={isLoading}
              className="border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300"
            />
            {errors.profilePicture && (
              <p className="text-sm text-red-500">
                {errors.profilePicture.message}
              </p>
            )}
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <Label htmlFor="referralCode" className="text-blue-700 font-medium">
              Referral Code (if you have one)
            </Label>
            <Input
              id="referralCode"
              placeholder="Enter referral code (optional)"
              {...register("referralCode")}
              disabled={isLoading}
              className="border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300"
            />
            {errors.referralCode && (
              <p className="text-sm text-red-500">
                {errors.referralCode.message}
              </p>
            )}
          </div>

          {/* Interested Category */}
          <div className="space-y-2">
            <Label
              htmlFor="interestedCategory"
              className="text-blue-700 font-medium"
            >
              Pick One Category
            </Label>
            <select
              id="interestedCategory"
              {...register("interestedCategory")}
              disabled={isLoading}
              className="w-full border-blue-200 bg-blue-50 focus:border-blue-400 focus:ring-blue-300 rounded px-3 py-2"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.interestedCategory && (
              <p className="text-sm text-red-500">
                {errors.interestedCategory.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                account...
              </>
            ) : (
              "Create Trading Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
