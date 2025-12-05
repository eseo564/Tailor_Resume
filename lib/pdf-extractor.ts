"use client"

/**
 * Extracts text from a PDF file using canvas-based rendering
 * This approach works in browser environments without requiring web workers
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import("pdfjs-dist")

    // Set up worker from CDN with proper configuration
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const typedArray = new Uint8Array(arrayBuffer)

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: typedArray,
      // Disable streaming and worker for better compatibility
      disableAutoFetch: true,
      disableStream: true,
    })

    const pdf = await loadingTask.promise
    let fullText = ""

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item: any) => {
          return item.str || ""
        })
        .join(" ")

      fullText += pageText + "\n\n"
    }

    return fullText.trim()
  } catch (error) {
    console.error("[v0] PDF extraction error:", error)
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`)
  }
}
