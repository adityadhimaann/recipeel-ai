"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChefHat,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Maximize2,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-full-1",
    sender: "bot",
    text: "Welcome to SousChef AI! 🍳 I am your full-page ReciPeel kitchen assistant.\n\nI can help you extract recipes from TikTok/Instagram Reels/YouTube Shorts, explain Hard Allergy vs Soft Diet conflicts, calculate your Mifflin-St Jeor daily calories, and suggest 1-click ingredient swaps. What would you like to explore?",
    timestamp: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  "How do I import a TikTok or Reel recipe?",
  "What is the difference between Hard and Soft conflicts?",
  "How do ingredient substitutions work?",
  "How do I organize recipes into folders?",
  "How are daily calorie and macro goals calculated?",
  "Suggest safe substitutes for common peanut or dairy allergies",
];

export default function SousChefFullPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateBotAnswer(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 850);
  }

  function generateBotAnswer(q: string): string {
    const query = q.toLowerCase();

    if (query.includes("import") || query.includes("tiktok") || query.includes("reel") || query.includes("youtube")) {
      return "To import a recipe, head to /recipes/import or click 'Import a recipe' on your dashboard. Paste any TikTok, Instagram Reel, or YouTube Shorts link (or choose 'Enter Manually'). SousChef AI extracts ingredients, cook time, and instructions automatically!";
    }

    if (query.includes("conflict") || query.includes("hard") || query.includes("soft") || query.includes("allergy")) {
      return "ReciPeel screens ingredients against your onboarding profile:\n\n• HARD Conflicts (Red): Flagged for saved allergies (e.g. peanuts, shellfish). Hard conflicts must be resolved or explicitly ignored before saving.\n• SOFT Conflicts (Amber): Flagged for diet preference mismatches (e.g. dairy for a vegan).";
    }

    if (query.includes("substitut") || query.includes("swap") || query.includes("replace")) {
      return "When a flagged ingredient is detected during import, ReciPeel searches 44+ seeded substitution rules. You get an inline impact preview (e.g. '-40 cal, +2g protein, removes dairy conflict'). Click 'Apply' to swap the ingredient and update your recipe totals!";
    }

    if (query.includes("folder") || query.includes("organize") || query.includes("library") || query.includes("tag")) {
      return "In your Recipe Library (/recipes), you can:\n1. Filter by Diet-Safe Only or Favorites.\n2. Create custom folders (e.g. 'Weeknight Dinners') and assign recipes to them.\n3. Add custom tags (e.g. #quick, #keto) and filter your library instantly!";
    }

    if (query.includes("macro") || query.includes("calorie") || query.includes("tdee") || query.includes("onboarding")) {
      return "In Profile Setup (/onboarding), our automatic Mifflin-St Jeor calculator computes your TDEE daily calorie target based on your age, sex, height, and weight, splitting macros (Protein, Carbs, Fat) according to your fitness goal!";
    }

    if (query.includes("peanut") || query.includes("dairy") || query.includes("allergen")) {
      return "Common Allergy Substitutions in ReciPeel:\n• Peanut Oil → Avocado Oil or Olive Oil\n• Soy Sauce → Coconut Aminos or Tamari (Gluten-Free)\n• Whole Milk → Almond Milk or Oat Milk\n• Peanut Butter → Sunflower Seed Butter (SunButter)";
    }

    return `ReciPeel makes recipe importing and dietary safety seamless! You can import recipes from social media URLs, screen ingredients against your saved allergies & diets, apply smart substitutions, and manage your recipe library.\n\nFeel free to ask me specifically about importing, conflict checks, substitutions, or library folders!`;
  }

  function handleClear() {
    setMessages(INITIAL_MESSAGES);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="mx-auto w-full max-w-4xl px-6 py-8 flex-1 flex flex-col">
        {/* Header navigation bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-bold text-primary">
              <ChefHat className="h-4 w-4" /> SousChef AI Full Page Workspace
            </span>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-surface px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="Reset Chat"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>

        {/* Full-Page Chat Container */}
        <div className="glass-card rounded-3xl border border-border bg-surface shadow-lift overflow-hidden flex flex-col flex-1 min-h-[580px]">
          {/* Top Banner */}
          <div className="flex items-center justify-between bg-primary p-5 text-primary-foreground">
            <div className="flex items-center gap-3.5">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur-xs">
                <ChefHat className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-bold text-xl leading-none">SousChef AI Assistant</h1>
                  <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-100">Online</span>
                </div>
                <p className="mt-1 text-xs opacity-85">Full-page interactive recipe extraction & dietary safety workspace</p>
              </div>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-2xl text-xs ${
                    m.sender === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-primary text-primary-foreground font-bold shadow-xs"
                  }`}
                >
                  {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                <div className={`max-w-[78%] space-y-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground shadow-xs rounded-tr-xs font-medium"
                        : "bg-surface border border-border/80 text-foreground shadow-xs rounded-tl-xs whitespace-pre-line"
                    }`}
                  >
                    {m.text}
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">{m.timestamp}</p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="grid h-8 w-8 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-xs">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Track */}
          <div className="px-5 py-3 border-t border-border/40 bg-surface/95 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5 text-primary" /> Quick Suggestions
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
              {SUGGESTED_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="shrink-0 rounded-full border border-border/80 bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-soft/40 transition cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 bg-surface border-t border-border flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SousChef AI anything about recipe imports, substitutions, or daily macros..."
              className="flex-1 rounded-2xl border border-input bg-background px-5 py-3 text-xs sm:text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-xs"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-xs sm:text-sm font-semibold text-primary-foreground transition disabled:opacity-50 hover:shadow-lift cursor-pointer active:scale-95"
            >
              Send <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
