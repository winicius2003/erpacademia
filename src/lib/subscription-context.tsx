"use client"
import * as React from "react"

export type SubscriptionUiStatus = "active" | "warning" | "overdue" | "blocked" | "loading"

export interface SubscriptionContextType {
  status: SubscriptionUiStatus
  expiresAt: Date | null
  plan: string
  daysRemaining: number | null,
  refreshSubscription: () => void
}

export const SubscriptionContext = React.createContext<SubscriptionContextType | undefined>(undefined)

export function useSubscription() {
  const context = React.useContext(SubscriptionContext)
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}
