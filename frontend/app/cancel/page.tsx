// app/cancel/page.tsx
"use client"

import { XCircle } from "lucide-react"

export default function CancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center p-6">
      <XCircle className="h-16 w-16 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-muted-foreground">Looks like your transaction was not completed. You can try again anytime.</p>
    </div>
  )
}