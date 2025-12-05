"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[v0] Login attempt for email:", email)

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.log("[v0] Login error:", error.message)

    if (error.message === "Invalid login credentials") {
      return { error: "Invalid email or password. Please check your credentials and try again." }
    }
    return { error: error.message }
  }

  console.log("[v0] Login successful, redirecting to dashboard")
  redirect("/dashboard")
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password reset email sent. Please check your inbox." }
}
