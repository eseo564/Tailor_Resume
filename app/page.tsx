"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Zap, Target, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Resume Tailoring System
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Upload your resume, paste a job description, and get a customized version optimized for that specific role
            using AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardContent className="pt-6">
              <FileText className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">PDF Upload</h3>
              <p className="text-sm text-muted-foreground">
                Upload your resume PDF and we'll extract and analyze the content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Target className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Job Matching</h3>
              <p className="text-sm text-muted-foreground">
                Paste any job description to analyze requirements and keywords
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Zap className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">AI Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Powered by OpenAI to tailor your resume for maximum impact
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold mb-2">Side-by-Side</h3>
              <p className="text-sm text-muted-foreground">Compare original and tailored versions before downloading</p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload & Paste</h3>
              <p className="text-sm text-muted-foreground">
                Upload your resume PDF and paste the job description you're applying for
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes both documents and generates optimized content
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <h3 className="font-semibold mb-2">Download</h3>
              <p className="text-sm text-muted-foreground">
                Review side-by-side comparison and download your tailored resume
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
