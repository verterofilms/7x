"use client";

export const dynamic = 'force-dynamic';

import { useState } from "react";

type Step = "quiz" | "loading" | "devo" | "subscribe";

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

interface Devo {
  read: string;
  meditate: string;
  pray: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("quiz");
  const [loading, setLoading] = useState(false);
  const [devo, setDevo] = useState<Devo | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({
    level: "curious",
    goal1: false,
    goal2: false,
    goal3: false,
    need1: false,
    need2: false,
    need3: false,
    need4: false,
  });

  const handleLevelChange = (level: string) => {
    setAnswers({ ...answers, level });
  };

  const toggleGoal = (goal: keyof QuizAnswers) => {
    if (goal.startsWith("goal")) {
      setAnswers({ ...answers, [goal]: !answers[goal] });
    }
  };

  const toggleNeed = (need: keyof QuizAnswers) => {
    if (need.startsWith("need")) {
      setAnswers({ ...answers, [need]: !answers[need] });
    }
  };

  const handleGenerateDevo = async () => {
    setLoading(true);
    setStep("loading");
    try {
      const response = await fetch("/api/generate-devo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await response.json();
      setDevo(data);
      setStep("devo");
    } catch (error) {
      console.error("Error generating devo:", error);
      setStep("quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light tracking-tight text-black dark:text-white mb-2">
            7x
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Personalized Bible study for you
          </p>
        </div>

        {/* Quiz Step */}
        {step === "quiz" && (
          <div className="space-y-8">
            {/* Faith Level */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-4">
                Where are you on your spiritual journey?
              </label>
              <div className="space-y-2">
                {[
                  { id: "sceptic", label: "Sceptic" },
                  { id: "curious", label: "Curious" },
                  { id: "new-believer", label: "New Believer" },
                  { id: "disciple", label: "Long-Time Disciple" },
                  { id: "scholar", label: "Biblical Scholar" },
                ].map((option) => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="radio"
                      name="level"
                      value={option.id}
                      checked={answers.level === option.id}
                      onChange={(e) => handleLevelChange(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-4">
                What are your goals? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { id: "goal1", label: "Learn More about Bible" },
                  { id: "goal2", label: "Grow Closer to God" },
                  { id: "goal3", label: "Get My Life Together" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={answers[option.id as keyof QuizAnswers] as boolean}
                      onChange={() =>
                        toggleGoal(option.id as keyof QuizAnswers)
                      }
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Needs */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-4">
                What do you need right now? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { id: "need1", label: "Encouragement" },
                  { id: "need2", label: "Wisdom" },
                  { id: "need3", label: "To Be Challenged" },
                  { id: "need4", label: "Hope" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center"
                  >
                    <input
                      type="checkbox"
                      checked={answers[option.id as keyof QuizAnswers] as boolean}
                      onChange={() =>
                        toggleNeed(option.id as keyof QuizAnswers)
                      }
                      className="w-4 h-4"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerateDevo}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Generate My Devotional
            </button>
          </div>
        )}

        {/* Loading Step */}
        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-300 border-t-black dark:border-t-white mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Crafting your devotional...
            </p>
          </div>
        )}

        {/* Devo Display Step */}
        {step === "devo" && devo && (
          <div className="space-y-6">
            {/* Read Section */}
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white mb-3">
                📖 Read
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {devo.read}
              </p>
            </div>

            {/* Meditate Section */}
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white mb-3">
                🧘 Meditate
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {devo.meditate}
              </p>
            </div>

            {/* Pray Section */}
            <div>
              <h2 className="text-lg font-semibold text-black dark:text-white mb-3">
                🙏 Pray
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {devo.pray}
              </p>
            </div>

            {/* CTA */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Want a devotional like this every morning?
              </p>
              <a
                href="https://gumroad.com/jjwells?_gl=1*kh6x3r*_gcl_au*ODM0MjU2MDA0LjE3MjY0MzIzMDU." // Placeholder - will update with actual Gumroad link
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Subscribe for $5/month
              </a>
              <button
                onClick={() => setStep("quiz")}
                className="w-full mt-3 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
