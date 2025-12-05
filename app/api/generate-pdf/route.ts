import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { content, filename } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // PDFKit doesn't work in browser-based Next.js environment due to font file access issues
    // We'll generate the PDF on the client using jsPDF instead
    return NextResponse.json({
      content,
      filename,
      message: "Use client-side PDF generation",
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
