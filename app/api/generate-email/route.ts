import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { llmComplete } from "@/lib/llm";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { applicationId, mode } = body as {
    applicationId: string;
    /** "cold" = initial outreach, "followup" = follow-up after no response */
    mode: "cold" | "followup";
  };

  if (!applicationId || !["cold", "followup"].includes(mode)) {
    return NextResponse.json({ error: "Missing applicationId or invalid mode" }, { status: 400 });
  }

  // Fetch application + opportunity
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(`*, opportunity:opportunities(*)`)
    .eq("id", applicationId)
    .eq("user_id", user.id)
    .single();

  if (appError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Fetch student profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("name, major, classification, interests, bio, graduation_year")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const opp = application.opportunity;
  const piName = opp?.leader_name ?? "Professor";
  const piTitle = opp?.contact_title ?? (opp?.contact_role === "professor" ? "Dr." : "");
  const labTitle = opp?.title ?? "your lab";
  const department = opp?.leader_department ?? opp?.categories?.[0] ?? "your department";
  const description = opp?.description ?? "";
  const teamNeeds = opp?.team_needs ?? "";
  const skillsGained = opp?.skills_gained?.join(", ") ?? "";
  const whoCanJoin = opp?.who_can_join?.join(", ") ?? "";

  const studentName = profile.name ?? "the student";
  const major = profile.major ?? "an undeclared major";
  const classification = profile.classification ?? "undergraduate";
  const interests = profile.interests?.join(", ") ?? "research";
  const bio = profile.bio ?? "";
  const gradYear = profile.graduation_year
    ? `graduating in ${profile.graduation_year}`
    : "";

  let systemPrompt: string;
  let userPrompt: string;

  if (mode === "cold") {
    systemPrompt = `You are an expert at writing concise, personalized cold emails from undergraduate students to research professors (PIs).

Rules:
- Exactly 3 short paragraphs:
  1. Who I am — name, major, year/classification, and one compelling sentence from their bio or interests
  2. Why THIS lab specifically — reference the specific opportunity title, lab focus, or team needs; connect the student's interests/skills to what the lab does
  3. Clear ask — request a 15-minute meeting or a chance to discuss joining; keep it humble and direct
- No filler phrases like "I am writing to express my interest" or "I hope this email finds you well"
- Formal but not stiff; professional
- 150-200 words maximum
- Address the PI by name using their proper title
- Do NOT include a subject line, just the email body
- End with a simple sign-off: Best regards, [Student Name]`;

    userPrompt = `Generate a cold email for this student contacting this PI.

STUDENT:
- Name: ${studentName}
- Major: ${major}
- Classification: ${classification} ${gradYear}
- Research interests: ${interests}
- Bio: ${bio || "(not provided)"}

OPPORTUNITY:
- Title: ${labTitle}
- PI name: ${piName}
- PI title: ${piTitle}
- Department: ${department}
- Description: ${description}
- Team needs: ${teamNeeds}
- Skills student will gain: ${skillsGained}
- Who can join: ${whoCanJoin}

Write a 3-paragraph cold email from the student to the PI.`;
  } else {
    // Follow-up mode
    const emailSentAt = application.email_sent_at;
    const daysSinceSent = emailSentAt
      ? Math.floor(
          (Date.now() - new Date(emailSentAt).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 7;

    systemPrompt = `You are an expert at writing polite, brief follow-up emails for undergraduate research applicants who haven't received a response.

Rules:
- Exactly 2 short paragraphs:
  1. Polite reference to the original email sent ~${daysSinceSent} days ago; confirm still very interested in the lab
  2. Reiterate the ask — 15-minute meeting or any opportunity to discuss; offer flexibility
- Warm but not pushy; professional
- 80-100 words maximum
- Address the PI by name with proper title
- No subject line, just the email body
- End with: Best regards, [Student Name]`;

    userPrompt = `Generate a follow-up email for this student.

STUDENT:
- Name: ${studentName}
- Major: ${major}
- Classification: ${classification}

OPPORTUNITY:
- Title: ${labTitle}
- PI name: ${piName}
- PI title: ${piTitle}
- Department: ${department}

Days since initial email: ${daysSinceSent}

Write a polite 2-paragraph follow-up email.`;
  }

  try {
    const emailText = await llmComplete({
      systemPrompt,
      userPrompt,
      temperature: 0.6,
      maxTokens: 600,
    });

    return NextResponse.json({ email: emailText.trim() });
  } catch (err) {
    console.error("[generate-email] LLM error:", err);
    return NextResponse.json(
      { error: "Failed to generate email. Make sure an LLM API key is configured." },
      { status: 500 }
    );
  }
}
