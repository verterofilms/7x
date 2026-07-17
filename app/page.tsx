"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Step = "login" | "questions" | "loading" | "devo";
type AuthMode = "login" | "signup";

interface ProfileAnswers {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
}

interface Devo {
  scripture: string;
  insight: string;
  analysis?: string;
  reflection: string;
  why?: string;
  question?: string;
  prayer: string;
}

const QUESTIONS = [
  {
    id: "q1",
    title: "When you open the Bible, which is closest to true?",
    options: [
      "I know the stories, but they've gone quiet on me.",
      "I've studied for years and want a passage cracked open in a way I haven't seen.",
      "I'm newer, and half the names and places blur together.",
      "I rarely read it. I want to know why I should.",
    ],
  },
  {
    id: "q2",
    title: "A verse hits hardest when it...",
    options: [
      "Names something inside me I hadn't put words to.",
      "Forces a question about what is actually true.",
      "Drops me into a scene with people I recognize.",
      "Tells me plainly what to do differently tomorrow.",
    ],
  },
  {
    id: "q3",
    title: "Ten minutes of silence sitting with one sentence of scripture sounds...",
    options: [
      "Like the whole point.",
      "Fine, if you tell me what to look for.",
      "Restless. Give me something to chew, then move.",
      "Pointless unless it ends in a decision.",
    ],
  },
  {
    id: "q4",
    title: "You've had a brutal week. What actually helps?",
    options: [
      "Someone who sits with me and doesn't rush to fix it.",
      "A framework that explains why it happened.",
      "Straight talk and a plan to get moving.",
      "Time alone to think it through myself.",
    ],
  },
  {
    id: "q5",
    title: "The best teacher you ever had...",
    options: [
      "Told you the truth even when it stung.",
      "Asked the question that made you find it yourself.",
      "Made you feel understood first.",
      "Handed you a system and let you run.",
    ],
  },
  {
    id: "q6",
    title: "Which of these is hardest to hear?",
    options: [
      "You are more loved than you have let yourself believe.",
      "You are less in control than you think.",
      "You are slowly becoming whatever your habits are making you.",
      "Your greatest strength may be the thing you hide behind.",
    ],
  },
  {
    id: "q7",
    title: "Be honest about why you're really here. Underneath it, you want...",
    options: [
      "To feel less alone in what you're carrying.",
      "To understand something that won't leave you alone.",
      "To change one thing, and you're tired of waiting.",
      "To know if God is paying attention to you.",
    ],
  },
];

export default function Home() {
  const [step, setStep] = useState<Step>("login");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const [loading, setLoading] = useState(false);
  const [devo, setDevo] = useState<Devo | null>(null);
  const [user, setUser] = useState<any>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState(7);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setStep("questions");
        // Check trial status
        checkTrialStatus(data.session.user.id);
      }
    };
    checkAuth();
  }, []);

  const checkTrialStatus = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("created_at")
        .eq("user_id", userId)
        .single();

      if (data) {
        const createdAt = new Date(data.created_at);
        const now = new Date();
        const daysElapsed = Math.floor(
          (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        setTrialDaysLeft(Math.max(0, 7 - daysElapsed));
      }
    } catch (error) {
      console.log("Profile not found, new user");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (authMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).slice(-12), // Magic link alternative
        });
        if (error) throw error;

        // Create user profile
        const { data: authData } = await supabase.auth.getSession();
        if (authData.session) {
          await supabase.from("user_profiles").insert({
            user_id: authData.session.user.id,
            email,
            created_at: new Date(),
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: "", // Simplified for demo
        });
        if (error) throw error;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setStep("questions");
        checkTrialStatus(data.session.user.id);
      }
    } catch (err: any) {
      setError(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    const q = QUESTIONS[currentQuestion].id;
    setAnswers({ ...answers, [q]: value });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
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

  const question = QUESTIONS[currentQuestion];

  // Login screen
  if (step === "login" && !user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-stone-900 dark:text-stone-100 mb-2">7x</h1>
            <p className="text-sm text-stone-500">Personalized Scripture study for you</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-700 rounded-lg dark:bg-stone-800 dark:text-white"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? "Loading..." : authMode === "login" ? "Sign In" : "Get Started"}
            </button>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-2">
              {authMode === "login" ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setError("");
              }}
              className="text-sm text-stone-900 dark:text-stone-100 hover:underline font-medium"
            >
              {authMode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </div>

          <p className="text-xs text-stone-400 text-center mt-8">
            Free 7-day trial. Then $5/month.
          </p>
        </div>
      </div>
    );
  }

  // Questions screen
  if (step === "questions") {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="text-xs text-stone-500 mb-2">
              {trialDaysLeft > 0 ? `${trialDaysLeft} days free` : "Trial ended"}
            </div>
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

          <div>
            <h2 className="text-xl text-stone-900 dark:text-stone-100 mb-8 leading-relaxed font-light">
              {question.title}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(String(idx))}
                  className="w-full text-left p-4 border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <span className="text-stone-700 dark:text-stone-300">{option}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (step === "loading") {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-stone-300 border-t-stone-800 mb-4 mx-auto"></div>
          <p className="text-stone-500">Crafting your study...</p>
        </div>
      </div>
    );
  }

  // Devo display
  if (step === "devo" && devo) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center p-4 font-serif">
        <div className="w-full max-w-2xl space-y-8 max-h-[90vh] overflow-y-auto">
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Passage</p>
            <p className="text-lg text-stone-700 dark:text-stone-300 leading-relaxed">{devo.scripture}</p>
          </div>

          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">The Coldest Verse</p>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.insight}</p>
          </div>

          {devo.analysis && (
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Who Carries the Weight</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.analysis}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">The Trap</p>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.reflection}</p>
          </div>

          {devo.why && (
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Why Story</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.why}</p>
            </div>
          )}

          {devo.question && (
            <div>
              <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">For Reflection</p>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed italic">{devo.question}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">Prayer</p>
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{devo.prayer}</p>
          </div>

          {trialDaysLeft <= 0 && (
            <div className="border-t border-stone-300 dark:border-stone-700 pt-6 text-center">
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">Trial ended</p>
              <a
                href="https://gumroad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-3 rounded-lg font-medium"
              >
                Subscribe for $5/month
              </a>
            </div>
          )}

          {trialDaysLeft > 0 && (
            <div className="border-t border-stone-300 dark:border-stone-700 pt-6 text-center">
              <p className="text-xs text-stone-500 mb-4">{trialDaysLeft} days left in free trial</p>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setStep("questions");
                }}
                className="w-full text-sm text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Create Another Study
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
