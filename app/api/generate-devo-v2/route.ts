import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface ProfileAnswers {
  q1?: string;
  q2?: string;
  q2_secondary?: string;
  q3?: string;
  q4?: string;
  q4_secondary?: string;
  q5?: string;
  q6?: string;
  q7?: string;
}

const ANSWER_PROFILES: Record<string, Record<string, string>> = {
  q1: { a: "seasoned but struggling", b: "advanced scholar", c: "newcomer", d: "skeptical seeker" },
  q2: { a: "emotional insight", b: "intellectual rigor", c: "narrative embodiment", d: "practical action" },
  q3: { a: "contemplative", b: "guided reflection", c: "active engagement", d: "decision-oriented" },
  q4: { a: "empathetic warmth", b: "analytical clarity", c: "direct challenge", d: "independent thinking" },
  q5: { a: "prophetic truth", b: "socratic questioning", c: "pastoral presence", d: "systematic teaching" },
  q6: { a: "grace and acceptance", b: "loss of control", c: "identity-formation", d: "vulnerability" },
  q7: { a: "connection and belonging", b: "growth and resilience", c: "understanding", d: "transformation" },
};

export async function POST(request: NextRequest) {
  try {
    const answers: ProfileAnswers = await request.json();

    // Build profile description
    const q1_profile = ANSWER_PROFILES.q1[answers.q1 || "c"];
    const q2_profile = ANSWER_PROFILES.q2[answers.q2 || "a"];
    const q3_profile = ANSWER_PROFILES.q3[answers.q3 || "b"];
    const q4_profile = ANSWER_PROFILES.q4[answers.q4 || "a"];
    const q5_profile = ANSWER_PROFILES.q5[answers.q5 || "b"];
    const q6_profile = ANSWER_PROFILES.q6[answers.q6 || "b"]; // Override
    const q7_profile = ANSWER_PROFILES.q7[answers.q7 || "a"]; // Override

    const prompt = `You are creating a deeply personal Scripture study for someone with this specific profile:

**Their Depth**: ${q1_profile}
**How they learn**: They need content delivered through ${q2_profile}
**Their pace**: ${q3_profile}
**What supports them**: They respond to ${q4_profile}
**Teaching style that lands**: ${q5_profile}
**Their deep need**: They're grappling with themes of ${q6_profile}
**Their real hunger**: Underneath everything, they want ${q7_profile}

Create a study that speaks DIRECTLY to this person. Not generic. Not for everyone else. For them.

Structure your response EXACTLY as follows, with these headers:

SCRIPTURE:
[The verse or passage that will most speak to them right now]

INSIGHT:
[A single, penetrating observation about this passage that addresses their specific profile. This should feel like it was written for no one else.]

REFLECTION:
[A reflection prompt that invites them into the passage in a way that matches their learning style. Make it personal.]

APPLICATION:
[One specific thing they could do or think about today that connects this passage to their real life.]

PRAYER:
[A prayer written in their voice, reflecting their need and posture. Brief, honest, in first person.]

Remember: This person chose these answers for a reason. Write to the person who made these choices, not to a generic Christian. Make every sentence count. Make it 7 minutes to read and reflect.`;

    const message = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the response
    const scriptureMatch = content.match(/SCRIPTURE:\s*([\s\S]*?)(?=INSIGHT:|$)/);
    const insightMatch = content.match(/INSIGHT:\s*([\s\S]*?)(?=REFLECTION:|$)/);
    const reflectionMatch = content.match(/REFLECTION:\s*([\s\S]*?)(?=APPLICATION:|$)/);
    const applicationMatch = content.match(/APPLICATION:\s*([\s\S]*?)(?=PRAYER:|$)/);
    const prayerMatch = content.match(/PRAYER:\s*([\s\S]*?)$/);

    const scripture = scriptureMatch ? scriptureMatch[1].trim() : content;
    const insight = insightMatch ? insightMatch[1].trim() : "Sit with this passage.";
    const reflection = reflectionMatch ? reflectionMatch[1].trim() : "What speaks to you?";
    const application = applicationMatch ? applicationMatch[1].trim() : "Live it out today.";
    const prayer = prayerMatch ? prayerMatch[1].trim() : "Open my heart to your truth.";

    return NextResponse.json({
      scripture,
      insight,
      reflection,
      application,
      prayer,
    });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return NextResponse.json(
      {
        error: "Failed to generate devotional",
        scripture: "Psalm 46:5",
        insight: "God is in the midst of her; she shall not be moved.",
        reflection: "What does it mean to know God is with you?",
        application: "Rest in His presence today.",
        prayer: "Help me trust that You are here.",
      },
      { status: 500 }
    );
  }
}
