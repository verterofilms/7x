"use client";

import { useState, useEffect } from "react";

type Step = "questions" | "loading" | "devo" | "login";

interface ProfileAnswers {
  q1?: string; // depth
  q2?: string; // lens (primary)
  q2_secondary?: string;
  q3?: string; // cadence
  q4?: string; // temperament (primary)
  q4_secondary?: string;
  q5?: string; // posture
  q6?: string; // content target (override)
  q7?: string; // register (override)
}

interface Devo {
  scripture: string;
  insight: string;
  reflection: string;
  application: string;
  prayer: string;
}

const QUESTIONS = [
  {
    id: "q1",
    title: "When you open the Bible, which is closest to true?",
    type: "single",
    options: [
      { label: "I know the stories, but they've gone quiet on me.", value: "a" },
      { label: "I've studied for years and want a passage cracked open in a way I haven't seen.", value: "b" },
      { label: "I'm newer, and half the names and places blur together.", value: "c" },
      { label: "I rarely read it. I want to know why I should.", value: "d" },
    ],
  },
  {
    id: "q2",
    title: "A verse hits hardest when it...",
    type: "dual",
    options: [
      { label: "Names something inside me I hadn't put words to.", value: "a" },
      { label: "Forces a question about what is actually true.", value: "b" },
      { label: "Drops me into a scene with people I recognize.", value: "c" },
      { label: "Tells me plainly what to do differently tomorrow.", value: "d" },
    ],
  },
  {
    id: "q3",
    title: "Ten minutes of silence sitting with one sentence of scripture sounds...",
    type: "single",
    options: [
      { label: "Like the whole point.", value: "a" },
      { label: "Fine, if you tell me what to look for.", value: "b" },
      { label: "Restless. Give me something to chew, then move.", value: "c" },
      { label: "Pointless unless it ends in a decision.", value: "d" },
    ],
  },
  {
    id: "q4",
    title: "You've had a brutal week. What actually helps?",
    type: "dual",
    options: [
      { label: "Someone who sits with me and doesn't rush to fix it.", value: "a" },
      { label: "A framework that explains why it happened.", value: "b" },
      { label: "Straight talk and a plan to get moving.", value: "c" },
      { label: "Time alone to think it through myself.", value: "d" },
    ],
  },
  {
    id: "q5",
    title: "The best teacher you ever had...",
    type: "single",
    options: [
      { label: "Told you the truth even when it stung.", value: "a" },
      { label: "Asked the question that made you find it yourself.", value: "b" },
      { label: "Made you feel understood first.", value: "c" },
      { label: "Handed you a system and let you run.", value: "d" },
    ],
  },
  {
    id: "q6",
    title: "Which of these is hardest to hear?",
    type: "single",
    options: [
      { label: "You are more loved than you have let yourself believe.", value: "a" },
      { label: "You are less in control than you think.", value: "b" },
      { label: "You are slowly becoming whatever your habits are making you.", value: "c" },
      { label: "Your greatest strength may be the thing you hide behind.", value: "d" },
    ],
  },
  {
    id: "q7",
    title: "Be honest about why you're really here. Underneath it, you want...",
    type: "single",
    options: [
      { label: "To feel less alone.", value: "a" },
      { label: "To be challenged and grow a spine.", value: "b" },
      { label: "To understand something that's been nagging you.", value: "c" },
      { label: "To change one specific thing in your life.", value: "d" },
    ],
  },
];

export default function Home() {
  const [step, setStep] = useState<Step>("questions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const [loading, setLoading] = useState(false);
  const [devo, setDevo] = useState<Devo | null>(null);

  const question = QUESTIONS[currentQuestion];

  const handleAnswer = (value: string) => {
    const q = question.id;
    setAnswers({ ...answers, [q]: value });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered, generate devo
      generateDevo({ ...answers, [q]: value });
    }
  };

  const generateDevo = async (profileAnswers: ProfileAnswers) => {
    setLoading(true);
    setStep("loading");
    try {
      const response = await fetch("/api/generate-devo-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileAnswers),
      });
      const data = await response.json();
      setDevo(data);
      setStep("devo");
    } catch (error) {
      console.error("Error generating devo:", error);
      setStep("questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4 font-serif">
      <div className="w-full max-w-md">
        {/* Questions Flow */}
        {step === "questions" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-sm text-stone-500 mb-4">
                Question {currentQuestion + 1} of {QUESTIONS.length}
              </div>
              <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-stone-800 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question */}
            <div>
              <h2 className="text-2xl text-stone-900 dark:text-stone-100 mb-8 leading-relaxed font-light">
                {question.title}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <span className="text-stone-700 dark:text-stone-300">{option.label}</span>
                  </button>
                ))}
              </div>

              {question.type === "dual" && (
                <p className="text-xs text-stone-400 mt-4">Pick your strongest answer first</p>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border border-stone-300 border-t-stone-800 dark:border-t-stone-200 mb-4"></div>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Crafting your study...</p>
          </div>
        )}

        {/* Devo Display */}
        {step === "devo" && devo && (
          <div className="space-y-8 animate-fade-in">
            {/* Scripture */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Scripture</p>
              <p className="text-lg text-stone-700 dark:text-stone-300 italic">{devo.scripture}</p>
            </div>

            {/* Insight */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Insight</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.insight}</p>
            </div>

            {/* Reflection */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Reflection</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.reflection}</p>
            </div>

            {/* Application */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">For Your Day</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.application}</p>
            </div>

            {/* Prayer */}
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">Prayer</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">{devo.prayer}</p>
            </div>

            {/* CTA */}
            <div className="border-t border-stone-300 dark:border-stone-700 pt-6 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                Want a study like this every morning?
              </p>
              <a
                href="https://gumroad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe for $5/month
              </a>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setStep("questions");
                }}
                className="w-full mt-3 text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                Create Another Study
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
