import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface ProfileAnswers {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
}

export async function POST(request: NextRequest) {
  try {
    const answers: ProfileAnswers = await request.json();

    // Map answers to psychological profile
    const profileDescription = buildProfile(answers);

    const prompt = `You are writing a Scripture study for a specific person. Not generic. Not for everyone. For THEM.

${profileDescription}

## Your task

Write a study that does what the best Scripture does: it shows the reader themselves in the story, then asks what they're going to do about it.

Look at this example of what you're aiming for. Notice:
- It engages the NARRATIVE (not just extracting doctrine)
- It analyzes the LITERARY CRAFT (what the text refuses to say, the irony, the structure)
- It makes a PERSONAL MIRROR (you are the man—it's about the reader)
- It WRESTLES with complexity honestly (doesn't pretend to have all answers)
- It NAMES the reader's blind spot (the thing they judge in others)
- The PRAYER is vulnerable and real, not sanitized

Example structure from "You Are the Man":
- Coldest verse (what the text does that's striking)
- Character focus (who carries the moral weight)
- The trap (how the structure traps the READER, not just the character)
- Why story, not sermon (how indirection works on us)
- For reflection (the question that turns the reader's judgment back on them)
- Prayer (raw, honest, first-person vulnerability)

## Now write for this person

Generate a Scripture study that:
1. PICKS A PASSAGE that will matter to this person (not the obvious choice)
2. ANALYZES what the text does structurally (what it shows vs. hides, irony, craft)
3. SHOWS the reader themselves (personal mirror, blind spot, their own judgment turned around)
4. STAYS curious (doesn't pretend certainty where there isn't any)
5. PRAYS honestly (vulnerable, specific to their actual struggle)

The person reading this should feel: "This was written for me. I see myself here. And I can't unsee it."

## Format your response EXACTLY as follows:

PASSAGE:
[The verse/passage reference and opening observation about why this passage matters]

THE COLDEST VERSE:
[What does the text do that's striking? What does it show or refuse to say? What's the craft move?]

WHO CARRIES THE WEIGHT:
[Which character or detail holds the moral center? Who shows us something true?]

THE TRAP:
[How does the structure trap the READER? How does this person see themselves in this story? What judgment have they already made that gets turned around?]

WHY STORY:
[Why does this matter that it's told as narrative and not doctrine? How does indirection work on this person specifically?]

FOR REFLECTION:
[The one question that turns their own judgment back on them. Make it personal and specific to their profile.]

PRAYER:
[First-person prayer that's vulnerable and real. This person's actual wrestling with God. Raw, specific, not sanitized.]

Remember: You're not explaining Scripture. You're showing it. You're not preaching. You're asking the reader to see themselves. The power is in the personal mirror, the honest wrestling, and the vulnerability.`;

    const message = await client.messages.create({
      model: "claude-opus-4-1-20250805",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the response
    const passage = extract(content, "PASSAGE");
    const coldest = extract(content, "THE COLDEST VERSE");
    const weight = extract(content, "WHO CARRIES THE WEIGHT");
    const trap = extract(content, "THE TRAP");
    const story = extract(content, "WHY STORY");
    const reflection = extract(content, "FOR REFLECTION");
    const prayer = extract(content, "PRAYER");

    return NextResponse.json({
      scripture: passage,
      insight: coldest,
      analysis: weight,
      reflection: trap,
      why: story,
      question: reflection,
      prayer: prayer,
    });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return NextResponse.json(
      {
        error: "Failed to generate devotional",
        scripture: "Psalm 139:1-2",
        insight: "You have searched me, and known me.",
      },
      { status: 500 }
    );
  }
}

function buildProfile(answers: ProfileAnswers): string {
  const profiles: Record<string, Record<string, string>> = {
    q1: {
      "0": "seasoned but struggling—you know Scripture deeply but it has gone quiet on you",
      "1": "an advanced student—you've studied for years and crave passage interpretation that goes deeper than you've seen",
      "2": "newer to Scripture—you're still learning the stories and the landscape feels overwhelming",
      "3": "skeptical seeker—you rarely read Scripture and want to know why you should care",
    },
    q2: {
      "0": "through emotional insight—verses that name something you couldn't put into words",
      "1": "through intellectual rigor—passages that force the question of what's actually true",
      "2": "through narrative embodiment—stories with characters you recognize yourself in",
      "3": "through practical action—passages that tell you what to do differently",
    },
    q3: {
      "0": "contemplative—silence and meditation is where you find depth",
      "1": "guided—you want help knowing what to look for",
      "2": "active—you need something to engage with, not just sit with",
      "3": "decisive—reflection only matters if it leads to a choice",
    },
    q4: {
      "0": "empathetic presence—you need someone to sit with you without rushing to fix it",
      "1": "analytical clarity—you want a framework that explains why things happened",
      "2": "direct challenge—you respond to straight talk and a clear plan",
      "3": "solitude—you need space alone to think things through",
    },
    q5: {
      "0": "prophetic truth—someone who tells you the hard thing",
      "1": "Socratic questioning—someone who asks the question that makes you find the answer",
      "2": "pastoral presence—someone who made you feel understood first",
      "3": "systematic teaching—someone who gave you a framework and let you run with it",
    },
    q6: {
      "0": "grace exceeds your belief",
      "1": "control is an illusion",
      "2": "you become your habits",
      "3": "your greatest strength hides your deepest fear",
    },
    q7: {
      "0": "connection—to feel less alone in what you're carrying",
      "1": "understanding—something that won't leave you alone",
      "2": "transformation—one real change in your life",
      "3": "to know if God is actually paying attention to you",
    },
  };

  const lines: string[] = [];
  lines.push("## About this person:\n");

  if (answers.q1) lines.push(`- **Their depth**: ${profiles.q1[answers.q1] || ""}`);
  if (answers.q2) lines.push(`- **How they learn**: They need passages delivered ${profiles.q2[answers.q2] || ""}`);
  if (answers.q3) lines.push(`- **Their pace**: ${profiles.q3[answers.q3] || ""}`);
  if (answers.q4) lines.push(`- **What supports them**: They respond to ${profiles.q4[answers.q4] || ""}`);
  if (answers.q5) lines.push(`- **Teaching posture that lands**: ${profiles.q5[answers.q5] || ""}`);
  if (answers.q6) lines.push(`- **Their edge**: They're grappling with the reality that ${profiles.q6[answers.q6] || ""}`);
  if (answers.q7) lines.push(`- **Their real hunger**: Underneath everything, they want ${profiles.q7[answers.q7] || ""}`);

  return lines.join("\n");
}

function extract(content: string, section: string): string {
  const regex = new RegExp(`${section}:\\s*([\\s\\S]*?)(?=\\n[A-Z]|$)`);
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}
