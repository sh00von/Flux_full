// app/success/page.tsx
"use client"

import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center p-6">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground">Thank you for your purchase. Your transaction was completed successfully.</p>
    </div>
  )
}