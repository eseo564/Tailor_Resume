import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

interface GeneratedData {
  tags: string[]
  tailoredResume: string
  originalResume: string
  resumeId?: string
  jobId?: string
  matchRunId?: string
}

async function generateTags(jobDescription: string, resumeText: string): Promise<string[]> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const prompt = `You are an expert resume reviewer. Analyze the following job description and extract the 5-8 most important skills, qualifications, and requirements that a candidate should highlight.

Job Description:
${jobDescription}

Return ONLY a JSON array of tags (strings). Example: ["JavaScript", "React", "Node.js", "AWS", "Team Leadership"]

Tags:`

  console.log("[v0] Calling OpenAI API for tags generation...")

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    console.log("[v0] OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error response:", errorText)
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] OpenAI response received")

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid OpenAI response structure")
    }

    const content = data.choices[0].message.content
    console.log("[v0] OpenAI response content:", content.substring(0, 100))

    try {
      const jsonMatch = content.match(/\[.*\]/s)
      if (!jsonMatch) {
        throw new Error("No JSON array found")
      }
      const tags = JSON.parse(jsonMatch[0])
      console.log("[v0] Successfully parsed tags:", tags)
      return Array.isArray(tags) ? tags.slice(0, 8) : [tags]
    } catch (parseError) {
      console.warn("[v0] JSON parsing failed, using fallback:", parseError)
      return content
        .split("\n")
        .filter((line: string) => line.trim())
        .slice(0, 8)
        .map((tag: string) => tag.replace(/^[-•*\d.]\s*/, "").trim())
        .filter((tag: string) => tag.length > 0)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error in generateTags:", errorMessage)
    throw new Error(`Failed to generate tags: ${errorMessage}`)
  }
}

async function generateTailoredResume(originalResume: string, tags: string[], jobDescription: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const tagsString = tags.join(", ")

  const prompt = `You are an expert resume writer. Given the following original resume, job description, and key requirements (tags), create a tailored version that:

1. Emphasizes experiences that match the required tags
2. Reorders experiences to put most relevant ones first
3. Adjusts descriptions to highlight skills matching the job requirements
4. Maintains the original structure and formatting
5. Keeps all the original information, just reorganized and slightly reworded to match the job

Original Resume:
${originalResume}

Key Requirements (Tags):
${tagsString}

Job Description Context:
${jobDescription.substring(0, 500)}...

Please provide the tailored resume in plain text format, maintaining the same structure as the original.`

  console.log("[v0] Calling OpenAI API for tailored resume generation...")

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    })

    console.log("[v0] OpenAI response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] OpenAI API error response:", errorText)
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] OpenAI tailored resume response received")

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid OpenAI response structure")
    }

    let content = data.choices[0].message.content

    // Remove common AI preambles like "Sure!?", "Here'?s?", etc.
    content = content.replace(
      /^(Sure!?\s*)?Here'?s?\s+(the\s+)?(tailored\s+)?(version\s+)?(of\s+)?(the\s+)?(resume)?[,:.]?\s*/i,
      "",
    )
    content = content.replace(/^(Here\s+is\s+)?(the\s+)?(tailored\s+)?(resume)?[,:.]?\s*/i, "")

    // Remove markdown formatting if present
    content = content.replace(/^```(\w+)?\s*\n?/gm, "").replace(/\n?```\s*$/gm, "")

    // Remove "---" separators at the start if they exist
    content = content.replace(/^---+\s*\n/m, "")

    const trimmedContent = content.trim().substring(0, 50000)
    console.log("[v0] Tailored resume generated, length:", trimmedContent.length)
    return trimmedContent
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[v0] Error in generateTailoredResume:", errorMessage)
    throw new Error(`Failed to generate tailored resume: ${errorMessage}`)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER][v0] ========== NEW REQUEST ==========")
    console.log("[SERVER][v0] Timestamp:", new Date().toISOString())

    const contentTypeHeader = request.headers.get("content-type") || ""
    console.log("[SERVER][v0] Request content-type:", contentTypeHeader || "(empty)")

    let jobDescription: string
    let resumeText: string

    if (!contentTypeHeader || !contentTypeHeader.includes("application/json")) {
      console.error("[SERVER][v0] Unsupported or missing content-type:", contentTypeHeader)
      return NextResponse.json(
        { error: "Please use 'Paste Text' tab. PDF extraction is not supported in this environment." },
        { status: 400 },
      )
    }

    console.log("[SERVER][v0] Processing JSON (text input)")
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[SERVER][v0] Failed to parse JSON body:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    jobDescription = body.jobDescription
    resumeText = body.resumeText

    console.log("[SERVER][v0] Request parsed successfully")
    console.log("[SERVER][v0] Job description length:", jobDescription?.length || 0)
    console.log("[SERVER][v0] Resume text length:", resumeText?.length || 0)

    if (!jobDescription || !resumeText) {
      console.error(
        "[SERVER][v0] Missing required fields - jobDescription:",
        !!jobDescription,
        "resumeText:",
        !!resumeText,
      )
      return NextResponse.json({ error: "Job description and resume text are required" }, { status: 400 })
    }

    if (resumeText.trim().length === 0) {
      console.error("[SERVER][v0] Resume text is empty")
      return NextResponse.json({ error: "Resume text is empty" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let resumeId: string | undefined
    let jobId: string | undefined
    let matchRunId: string | undefined

    if (user) {
      console.log("[SERVER][v0] User authenticated, storing data in database")

      // Store job description
      const { data: jobData, error: jobError } = await supabase
        .from("job_descriptions")
        .insert({
          user_id: user.id,
          raw_text: jobDescription,
          title: null,
        })
        .select()
        .single()

      if (jobError) {
        console.error("[SERVER][v0] Error storing job description:", jobError)
      } else {
        jobId = jobData.id
        console.log("[SERVER][v0] Job description stored, ID:", jobId)
      }

      // Store resume
      const { data: resumeData, error: resumeError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          original_pdf_path: "text_input",
          parsed_json: { text: resumeText },
          title: "Resume",
        })
        .select()
        .single()

      if (resumeError) {
        console.error("[SERVER][v0] Error storing resume:", resumeError)
      } else {
        resumeId = resumeData.id
        console.log("[SERVER][v0] Resume stored, ID:", resumeId)
      }

      // Create match run
      if (resumeId && jobId) {
        const { data: matchData, error: matchError } = await supabase
          .from("match_runs")
          .insert({
            user_id: user.id,
            resume_id: resumeId,
            job_id: jobId,
            pipeline_status: "running",
          })
          .select()
          .single()

        if (matchError) {
          console.error("[SERVER][v0] Error creating match run:", matchError)
        } else {
          matchRunId = matchData.id
          console.log("[SERVER][v0] Match run created, ID:", matchRunId)
        }
      }
    } else {
      console.log("[SERVER][v0] No authenticated user, proceeding without database storage")
    }

    console.log("[SERVER][v0] === STEP 1: TAG GENERATION ===")
    let tags: string[]
    try {
      tags = await generateTags(jobDescription, resumeText)
      console.log("[SERVER][v0] ✓ Tags generated SUCCESS:", JSON.stringify(tags))
    } catch (tagError) {
      const tagErrorMessage = tagError instanceof Error ? tagError.message : String(tagError)
      console.error("[SERVER][v0] ✗ Tag generation FAILED:", tagErrorMessage)

      if (matchRunId && user) {
        await supabase.from("match_runs").update({ pipeline_status: "failed" }).eq("id", matchRunId)
      }

      return NextResponse.json({ error: `Tag Generation Error: ${tagErrorMessage}` }, { status: 500 })
    }

    console.log("[SERVER][v0] === STEP 2: TAILORED RESUME GENERATION ===")
    let tailoredResume: string
    try {
      tailoredResume = await generateTailoredResume(resumeText, tags, jobDescription)
      console.log("[SERVER][v0] ✓ Tailored resume generated SUCCESS - length:", tailoredResume.length, "chars")
    } catch (tailorError) {
      const tailorErrorMessage = tailorError instanceof Error ? tailorError.message : String(tailorError)
      console.error("[SERVER][v0] ✗ Tailored resume generation FAILED:", tailorErrorMessage)

      if (matchRunId && user) {
        await supabase.from("match_runs").update({ pipeline_status: "failed" }).eq("id", matchRunId)
      }

      return NextResponse.json({ error: `Tailored Resume Generation Error: ${tailorErrorMessage}` }, { status: 500 })
    }

    if (matchRunId && user) {
      await supabase
        .from("match_runs")
        .update({
          pipeline_status: "completed",
          agent_trace: { tags, timestamp: new Date().toISOString() },
        })
        .eq("id", matchRunId)

      console.log("[SERVER][v0] Match run updated to completed")
    }

    console.log("[SERVER][v0] === STEP 3: RESPONSE ASSEMBLY ===")
    const response: GeneratedData = {
      tags,
      tailoredResume,
      originalResume: resumeText,
      resumeId,
      jobId,
      matchRunId,
    }

    console.log("[SERVER][v0] ✓ ALL STEPS COMPLETED SUCCESSFULLY")
    return NextResponse.json(response)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[SERVER][v0] ========== CRITICAL ERROR ==========")
    console.error("[SERVER][v0] Error message:", errorMessage)

    return NextResponse.json({ error: errorMessage || "Failed to process resume" }, { status: 500 })
  }
}
