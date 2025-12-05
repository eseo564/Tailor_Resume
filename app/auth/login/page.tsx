"use client"

import type React from "react"
import { login, resetPassword } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function Page() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResetMessage(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setResetMessage(result.success)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{showReset ? "Reset Password" : "Login"}</CardTitle>
              <CardDescription>
                {showReset
                  ? "Enter your email to receive a password reset link"
                  : "Enter your email below to login to your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showReset ? (
                <form onSubmit={handleReset}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input id="reset-email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    {resetMessage && <p className="text-sm text-green-600">{resetMessage}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowReset(false)
                        setError(null)
                        setResetMessage(null)
                      }}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setShowReset(true)}
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
