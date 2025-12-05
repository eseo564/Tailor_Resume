"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProcessingSection } from "./processing-section"
import { Upload, Loader2 } from "lucide-react"
import { extractTextFromPDF } from "@/lib/pdf-extractor"

type FormState = "input" | "processing" | "preview"
type InputMode = "pdf" | "text"

export function ResumeTailorForm() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeText, setResumeText] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [inputMode, setInputMode] = useState<InputMode>("pdf")
  const [formState, setFormState] = useState<FormState>("input")
  const [processingData, setProcessingData] = useState<{
    tags: string[]
    tailoredResume: string
    originalResume: string
    resumeId?: string
    jobId?: string
    matchRunId?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file")
        return
      }
      setResumeFile(file)
      setError(null)

      setExtracting(true)
      try {
        console.log("[v0] Starting PDF text extraction...")
        const text = await extractTextFromPDF(file)
        console.log("[v0] PDF text extracted successfully, length:", text.length)
        setResumeText(text)
        setError(null)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to extract text from PDF"
        console.error("[v0] PDF extraction failed:", errorMsg)
        setError(errorMsg)
        setResumeFile(null)
      } finally {
        setExtracting(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!jobDescription.trim()) {
      setError("Please enter a job description")
      return
    }

    if (!resumeText.trim()) {
      setError(inputMode === "pdf" ? "Please upload a PDF resume" : "Please paste your resume text")
      return
    }

    setFormState("processing")
    setLoading(true)

    try {
      console.log("[v0] Form submission started")
      console.log("[v0] Job description length:", jobDescription.length)
      console.log("[v0] Resume text length:", resumeText.length, "characters")
      console.log("[v0] Sending text to /api/tailor-resume...")

      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText,
        }),
      })

      console.log("[v0] Response received - status:", response.status, "statusText:", response.statusText)
      console.log("[v0] Response headers content-type:", response.headers.get("content-type"))

      let responseText = ""
      try {
        responseText = await response.clone().text()
        console.log("[v0] Response text (first 500 chars):", responseText.substring(0, 500))
      } catch (e) {
        console.error("[v0] Could not read response text:", e)
      }

      if (!response.ok) {
        console.error("[v0] Response NOT OK - attempting to parse error...")
        let errorData
        try {
          errorData = await response.json()
          console.error("[v0] Error from API:", errorData)
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        } catch (jsonParseError) {
          console.error("[v0] Could not parse error as JSON, got:", responseText.substring(0, 200))
          throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 200)}`)
        }
      }

      console.log("[v0] Response OK, parsing JSON...")
      const data = await response.json()
      console.log("[v0] JSON parsed successfully")
      console.log(
        "[v0] Response contains - tags:",
        data.tags?.length || 0,
        "| tailored resume:",
        data.tailoredResume?.length || 0,
        "chars",
      )

      setProcessingData(data)
      setFormState("preview")
      console.log("[v0] Form state changed to preview")
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred"
      console.error("[v0] Form submission error:", errorMsg)
      setError(errorMsg)
      setFormState("input")
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      const hasInput = jobDescription.trim() && (inputMode === "pdf" ? resumeFile : resumeText.trim())
      if (hasInput && !loading) {
        handleSubmit(e as any)
      }
    }
  }

  if (formState === "preview" && processingData) {
    return (
      <ProcessingSection
        data={processingData}
        jobDescription={jobDescription}
        onReset={() => {
          setFormState("input")
          setJobDescription("")
          setResumeText("")
          setResumeFile(null)
          setProcessingData(null)
        }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-white dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste the job description here... (Press Ctrl+Enter to submit)"
              className="min-h-48 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Your Resume</label>
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="pdf" className="space-y-3">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                    disabled={extracting}
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {extracting ? (
                      <>
                        <Loader2 className="mx-auto h-12 w-12 text-blue-500 mb-3 animate-spin" />
                        <p className="text-sm text-slate-900 dark:text-white font-medium">
                          Extracting text from PDF...
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
                        {resumeFile ? (
                          <>
                            <p className="text-sm text-slate-900 dark:text-white font-medium">{resumeFile.name}</p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              ✓ Text extracted ({resumeText.length} characters)
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-slate-900 dark:text-white font-medium">
                              Click to upload PDF resume
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF files only</p>
                          </>
                        )}
                      </>
                    )}
                  </label>
                </div>
                {resumeText && inputMode === "pdf" && !extracting && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Extracted Text (editable):
                    </label>
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      className="min-h-32 resize-none text-xs"
                      placeholder="Extracted text will appear here..."
                    />
                  </div>
                )}
              </TabsContent>
              <TabsContent value="text">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste your resume text here... (Press Ctrl+Enter to submit)"
                  className="min-h-48 resize-none"
                />
              </TabsContent>
            </Tabs>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || extracting || !jobDescription.trim() || !resumeText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : extracting ? "Extracting PDF..." : "Generate Tailored Resume"}
          </Button>
        </form>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-800">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">How it works</h3>
          <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <span>Upload your PDF resume or paste the text</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <span>Paste the job description you are applying for</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <span>AI analyzes the job requirements and extracts key skills</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                4
              </span>
              <span>Your resume is tailored to match the specific job posting</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                5
              </span>
              <span>Compare original vs tailored and download as PDF</span>
            </li>
          </ol>
        </div>
      </Card>
    </div>
  )
}
