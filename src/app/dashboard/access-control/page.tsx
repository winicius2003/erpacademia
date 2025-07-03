"use client"

import * as React from "react"
import { CheckCircle2, XCircle, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type AccessStatus = "idle" | "granted" | "denied"

export default function AccessControlPage() {
  const [memberId, setMemberId] = React.useState("")
  const [status, setStatus] = React.useState<AccessStatus>("idle")

  const handleCheckAccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberId) return
    // In a real app, this would be an API call.
    // Here, we'll just simulate the result randomly.
    setStatus(Math.random() > 0.3 ? "granted" : "denied")
  }

  return (
    <div className="flex flex-col items-center justify-center w-full pt-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline text-center text-2xl">Access Control</CardTitle>
          <CardDescription className="text-center">
            Enter a member ID to check their access status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckAccess} className="flex gap-2 mb-6">
            <Input
              placeholder="Enter Member ID..."
              value={memberId}
              onChange={(e) => {
                setMemberId(e.target.value)
                setStatus("idle")
              }}
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" /> Check
            </Button>
          </form>
          {status === "idle" && (
            <div className="h-48 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-lg">
              <p>Waiting for check...</p>
            </div>
          )}
          {status === "granted" && (
            <div className="h-48 flex flex-col items-center justify-center bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg">
              <CheckCircle2 className="w-16 h-16 mb-2" />
              <p className="text-2xl font-bold">Access Granted</p>
            </div>
          )}
          {status === "denied" && (
            <div className="h-48 flex flex-col items-center justify-center bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg">
              <XCircle className="w-16 h-16 mb-2" />
              <p className="text-2xl font-bold">Access Denied</p>
              <p className="text-sm">Reason: Overdue payment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
