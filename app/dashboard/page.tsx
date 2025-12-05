import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ResumeTailorForm } from "@/components/resume-tailor-form"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Resume Tailoring Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-300">Welcome back, {user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="mb-8">
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Upload your resume and paste a job description to generate a tailored version optimized for the role.
          </p>
        </div>

        <ResumeTailorForm />
      </div>
    </main>
  )
}
