import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

interface QuizAnswers {
  level: string;
  goal1: boolean;
  goal2: boolean;
  goal3: boolean;
  need1: boolean;
  need2: boolean;
  need3: boolean;
  need4: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const answers: QuizAnswers = await request.json();

    // Build the user profile from answers
    const levelMap: Record<string, string> = {
      sceptic: "a spiritual sceptic",
      curious: "spiritually curious",
      "new-believer": "a new believer",
      disciple: "a long-time disciple of Jesus",
      scholar: "a biblical scholar",
    };

    const goals = [
      answers.goal1 && "learn more about the Bible",
      answers.goal2 && "grow closer to God",
      answers.goal3 && "get their life together",
    ]
      .filter(Boolean)
      .join(", ");

    const needs = [
      answers.need1 && "encouragement",
      answers.need2 && "wisdom",
      answers.need3 && "to be challenged",
      answers.need4 && "hope",
    ]
      .filter(Boolean)
      .join(", ");

    const prompt = `You are creating a personalized 7-minute Bible devotional for someone who is ${levelMap[answers.level]}.

Their goals: ${goals || "not specified"}
What they need: ${needs || "not specified"}

Create a devotional that:
1. Speaks directly to THEIR level of understanding (if they're a sceptic, don't assume they know Bible stories; if they're a scholar, dive deep)
2. Addresses their specific goals and needs
3. Is elegant, minimal, and feels personal—like God is speaking directly to them
4. Takes 7 minutes to read and reflect on

Format your response EXACTLY as follows with these three sections separated by "---":

READ:
[A personalized reflection or passage interpretation, 150-200 words. This should be the content they read and reflect on. Choose a verse, passage, or concept that speaks to their level and needs.]

---

MEDITATE:
[A meditation or reflection prompt they can sit with, 80-120 words. This guides their contemplative moment.]

---

PRAY:
[A personalized prayer they can pray, 80-120 words. This should speak to their heart in their specific situation.]

Make it beautiful, specific to their journey, and transformative. Every word counts.`;

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

    // Parse the response
    const content =
      message.content[0].type === "text" ? message.content[0].text : "";

    const sections = content.split("---").map((s) => s.trim());

    // Extract sections
    const readMatch = sections[0]?.match(/READ:\s*([\s\S]*?)$/i);
    const meditateMatch = sections[1]?.match(/MEDITATE:\s*([\s\S]*?)$/i);
    const prayMatch = sections[2]?.match(/PRAY:\s*([\s\S]*?)$/i);

    const read = readMatch ? readMatch[1].trim() : content;
    const meditate = meditateMatch
      ? meditateMatch[1].trim()
      : "Take a moment to sit quietly with what you've read.";
    const pray = prayMatch
      ? prayMatch[1].trim()
      : "Pray the prayer of your heart.";

    return NextResponse.json({
      read,
      meditate,
      pray,
    });
  } catch (error) {
    console.error("Error generating devotional:", error);
    return NextResponse.json(
      {
        error: "Failed to generate devotional",
        read: "Take a moment to open your Bible and read a passage that speaks to your heart today.",
        meditate: "Sit with what God is saying to you through His Word.",
        pray: "Lord, help me to know you and follow you more closely.",
      },
      { status: 500 }
    );
  }
}
