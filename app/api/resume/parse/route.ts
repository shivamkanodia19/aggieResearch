import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/resume-parser";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    let resumeText: string;

    if (
      file.type === "application/pdf" ||
      file.name?.toLowerCase().endsWith(".pdf")
    ) {
      const buffer = Buffer.from(await file.arrayBuffer());
      try {
        // pdf-parse has a default export which is a function that
        // takes a Buffer and returns an object with a `text` field.
        const pdfParse = (await import("pdf-parse")).default as (
          data: Buffer
        ) => Promise<{ text?: string }>;

        const textResult = await pdfParse(buffer);
        resumeText = textResult?.text ?? "";
      } catch (pdfErr) {
        console.error("PDF extraction error:", pdfErr);
        return NextResponse.json(
          {
            error:
              "Could not read this PDF. Try saving your resume as a .txt file and upload that, or use a different PDF.",
          },
          { status: 400 }
        );
      }
    } else if (
      file.type === "text/plain" ||
      file.name?.toLowerCase().endsWith(".txt")
    ) {
      resumeText = await file.text();
    } else {
      return NextResponse.json(
        { error: "Unsupported format. Use PDF or plain text." },
        { status: 400 }
      );
    }

    if (!resumeText?.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file." },
        { status: 400 }
      );
    }

    const profile = await parseResume(resumeText);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Resume parsing error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse resume";
    const status =
      message.includes("API key") || message.includes("No LLM")
        ? 503
        : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
