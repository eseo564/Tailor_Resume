"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import jsPDF from "jspdf"

interface ProcessingSectionProps {
  data: {
    tags: string[]
    tailoredResume: string
    originalResume: string
  }
  jobDescription: string
  onReset: () => void
}

export function ProcessingSection({ data, jobDescription, onReset }: ProcessingSectionProps) {
  const [downloading, setDownloading] = useState(false)

  const downloadPDF = async (isOriginal: boolean) => {
    setDownloading(true)
    try {
      const content = isOriginal ? data.originalResume : data.tailoredResume
      const filename = isOriginal ? "original-resume.pdf" : "tailored-resume.pdf"

      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "letter",
      })

      // Set font and margins
      const margin = 40
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const maxWidth = pageWidth - margin * 2
      let yPosition = margin

      // Split content into lines and add to PDF
      const lines = content.split("\n")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        if (line.trim()) {
          // Detect headers (all caps or starts with capital letters)
          const isHeader = line.match(/^[A-Z][A-Z\s]+$/) || line.match(/^[A-Z][a-z]+ [A-Z]/)
          const fontSize = isHeader ? 12 : 10
          doc.setFontSize(fontSize)
          doc.setFont("helvetica", isHeader ? "bold" : "normal")

          // Split long lines to fit width
          const splitLines = doc.splitTextToSize(line, maxWidth)
          for (const splitLine of splitLines) {
            if (yPosition > pageHeight - margin) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(splitLine, margin, yPosition)
            yPosition += fontSize + 2
          }
        } else {
          yPosition += 6 // Add spacing for empty lines
        }
      }

      // Save the PDF
      doc.save(filename)
    } catch (err) {
      console.error("Download failed:", err)
      alert("Failed to download PDF")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Tags Section */}
      <Card className="p-6 bg-white dark:bg-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Generated Tags</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          These tags represent the key requirements extracted from the job description:
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {data.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </Card>

      {/* Resume Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Resume */}
        <Card className="p-6 bg-white dark:bg-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Original Resume</h3>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {data.originalResume}
          </div>
          <Button onClick={() => downloadPDF(true)} disabled={downloading} variant="outline" className="w-full mt-4">
            Download Original PDF
          </Button>
        </Card>

        {/* Tailored Resume */}
        <Card className="p-6 bg-white dark:bg-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Tailored Resume</h3>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 max-h-96 overflow-y-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {data.tailoredResume}
          </div>
          <Button
            onClick={() => downloadPDF(false)}
            disabled={downloading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
          >
            Download Tailored PDF
          </Button>
        </Card>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center">
        <Button onClick={onReset} variant="outline" className="px-8 bg-transparent">
          Process Another Resume
        </Button>
      </div>
    </div>
  )
}
